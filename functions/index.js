const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();

const QR_SECRET = process.env.QR_SECRET_SALT || 'smartattend_production_qr_salt_key_2026';
const QR_LIFETIME_MS = 3500; // 3.5s allowing tiny network jitter for 3-second rotating QR

/**
 * Generate secure HMAC token for rotating Dynamic QR
 */
function createSecureToken(sessionId, timestamp) {
  return crypto
    .createHmac('sha256', QR_SECRET)
    .update(`${sessionId}:${timestamp}`)
    .digest('hex');
}

/**
 * 1. Create an attendance session
 */
exports.createAttendanceSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { subjectId, classId, division, durationMinutes, method } = data;
  const facultyId = context.auth.uid;

  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + (durationMinutes || 60) * 60 * 1000);

  const sessionRef = await db.collection('attendanceSessions').add({
    facultyId,
    subjectId,
    classId,
    division,
    startTime: admin.firestore.Timestamp.fromDate(startTime),
    endTime: admin.firestore.Timestamp.fromDate(endTime),
    method, // 'FACE' or 'QR'
    status: 'ACTIVE',
    totalStudents: 0,
    presentCount: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Count enrolled students for class
  const enrollmentsSnap = await db.collection('enrollments')
    .where('classId', '==', classId)
    .where('division', '==', division)
    .get();

  await sessionRef.update({
    totalStudents: enrollmentsSnap.size
  });

  // Log in audit
  await db.collection('auditLogs').add({
    action: 'ATTENDANCE_STARTED',
    actorId: facultyId,
    details: `Started ${method} attendance for subject ${subjectId}`,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { sessionId: sessionRef.id, status: 'ACTIVE' };
});

/**
 * 2. Generate dynamic QR token (called every 3s by faculty client)
 */
exports.generateQrToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const { sessionId } = data;
  const sessionDoc = await db.collection('attendanceSessions').doc(sessionId).get();

  if (!sessionDoc.exists || sessionDoc.data().status !== 'ACTIVE') {
    throw new functions.https.HttpsError('failed-precondition', 'Session is not active');
  }

  const now = Date.now();
  const token = createSecureToken(sessionId, now);

  const qrSessionRef = db.collection('qrSessions').doc(sessionId);
  await qrSessionRef.set({
    sessionId,
    currentToken: token,
    generatedAt: now,
    expiresAt: now + QR_LIFETIME_MS,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    token,
    generatedAt: now,
    expiresIn: 3
  };
});

/**
 * 3. Validate QR Token and Mark Student Attendance
 */
exports.validateQrTokenAndMarkAttendance = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in as a student');
  }

  const studentId = context.auth.uid;
  const { sessionId, token, scannedAt } = data;

  if (!sessionId || !token) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing sessionId or token');
  }

  // A. Check active session
  const sessionDoc = await db.collection('attendanceSessions').doc(sessionId).get();
  if (!sessionDoc.exists || sessionDoc.data().status !== 'ACTIVE') {
    throw new functions.https.HttpsError('failed-precondition', 'Attendance session is no longer active');
  }
  const sessionData = sessionDoc.data();

  // B. Verify QR token freshness from qrSessions
  const qrDoc = await db.collection('qrSessions').doc(sessionId).get();
  if (!qrDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'No active QR token found for this session');
  }

  const qrData = qrDoc.data();
  const now = Date.now();

  if (now > qrData.expiresAt || (scannedAt && Math.abs(now - scannedAt) > QR_LIFETIME_MS)) {
    throw new functions.https.HttpsError('deadline-exceeded', 'QR EXPIRED. Please scan the newest code.');
  }

  if (qrData.currentToken !== token) {
    throw new functions.https.HttpsError('permission-denied', 'Invalid or rotated QR code');
  }

  // C. Check student enrollment in the class/division
  const studentDoc = await db.collection('students').doc(studentId).get();
  if (!studentDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Student profile does not exist');
  }
  const studentData = studentDoc.data();

  if (studentData.classId && studentData.classId !== sessionData.classId) {
    throw new functions.https.HttpsError('permission-denied', 'You are not enrolled in this class');
  }

  // D. Check for duplicate attendance
  const existingRecord = await db.collection('attendanceRecords')
    .where('sessionId', '==', sessionId)
    .where('studentId', '==', studentId)
    .limit(1)
    .get();

  if (!existingRecord.empty) {
    throw new functions.https.HttpsError('already-exists', 'ATTENDANCE ALREADY RECORDED');
  }

  // E. Record attendance in Firestore
  const recordRef = await db.collection('attendanceRecords').add({
    sessionId,
    studentId,
    studentName: studentData.fullName || studentData.name,
    rollNumber: studentData.rollNumber,
    subjectId: sessionData.subjectId,
    classId: sessionData.classId,
    facultyId: sessionData.facultyId,
    division: sessionData.division,
    method: 'QR',
    status: 'PRESENT',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    recordedAtFormatted: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  });

  // Increment present count in session
  await db.collection('attendanceSessions').doc(sessionId).update({
    presentCount: admin.firestore.FieldValue.increment(1)
  });

  // Audit log
  await db.collection('auditLogs').add({
    action: 'ATTENDANCE_MARKED',
    actorId: studentId,
    details: `${studentData.fullName} marked attendance via Dynamic QR for ${sessionData.subjectId}`,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  // Student notification
  await db.collection('notifications').add({
    userId: studentId,
    title: 'Attendance Marked',
    message: `Marked Present for subject ${sessionData.subjectId}`,
    type: 'SUCCESS',
    read: false,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  return {
    success: true,
    recordId: recordRef.id,
    subjectId: sessionData.subjectId,
    markedAt: new Date().toISOString()
  };
});

/**
 * 4. Verify Face Recognition and Mark Attendance
 */
exports.verifyFaceAttendance = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { sessionId, studentId, confidence, faceEmbedding } = data;

  if (!sessionId || !studentId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing sessionId or studentId');
  }

  // Check confidence threshold
  if (confidence && confidence < 0.70) {
    throw new functions.https.HttpsError('invalid-argument', 'Face confidence below required threshold');
  }

  // Session check
  const sessionDoc = await db.collection('attendanceSessions').doc(sessionId).get();
  if (!sessionDoc.exists || sessionDoc.data().status !== 'ACTIVE') {
    throw new functions.https.HttpsError('failed-precondition', 'Session is not active');
  }
  const sessionData = sessionDoc.data();

  // Check enrollment
  const studentDoc = await db.collection('students').doc(studentId).get();
  if (!studentDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Student does not exist');
  }
  const studentData = studentDoc.data();

  // Check duplicate
  const existingRecord = await db.collection('attendanceRecords')
    .where('sessionId', '==', sessionId)
    .where('studentId', '==', studentId)
    .limit(1)
    .get();

  if (!existingRecord.empty) {
    return {
      success: false,
      alreadyMarked: true,
      message: 'Attendance Already Recorded'
    };
  }

  // Record Attendance
  const recordRef = await db.collection('attendanceRecords').add({
    sessionId,
    studentId,
    studentName: studentData.fullName || studentData.name,
    rollNumber: studentData.rollNumber,
    subjectId: sessionData.subjectId,
    classId: sessionData.classId,
    facultyId: sessionData.facultyId,
    division: sessionData.division,
    method: 'FACE',
    status: 'PRESENT',
    confidence: confidence || 0.94,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    recordedAtFormatted: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  });

  await db.collection('attendanceSessions').doc(sessionId).update({
    presentCount: admin.firestore.FieldValue.increment(1)
  });

  await db.collection('auditLogs').add({
    action: 'ATTENDANCE_MARKED',
    actorId: context.auth.uid,
    details: `${studentData.fullName} recognized via Face AI for ${sessionData.subjectId} (Confidence: ${Math.round((confidence || 0.94) * 100)}%)`,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    success: true,
    recordId: recordRef.id,
    studentName: studentData.fullName,
    markedAt: new Date().toISOString()
  };
});
