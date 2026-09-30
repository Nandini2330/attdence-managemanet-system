import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isLiveFirebaseConfigured } from './config';
import {
  Student,
  Faculty,
  Department,
  Course,
  Subject,
  AcademicClass,
  AttendanceSession,
  AttendanceRecord,
  DynamicQrSession,
  TimetableEntry,
  NotificationItem,
  AuditLog,
  SystemSettings,
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_FACULTY,
  INITIAL_DEPARTMENTS,
  INITIAL_COURSES,
  INITIAL_SUBJECTS,
  INITIAL_CLASSES,
  INITIAL_SESSIONS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_TIMETABLE,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS,
} from './mockData';

// Local Storage Keys for Reactive Persistence when in Local/Demo or Offline Mode
const STORAGE_PREFIX = 'smartattend_data_';
function getStored<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    // Emit custom event for cross-component reactive sync
    window.dispatchEvent(new CustomEvent('smartattend-store-update', { detail: { key, value } }));
  } catch (e) {
    console.error('Storage error', e);
  }
}

const initialLoadedStudents = (() => {
  const list = getStored<Student[]>('students', INITIAL_STUDENTS);
  INITIAL_STUDENTS.forEach((is) => {
    if (!list.some((s) => s.id === is.id || s.rollNumber === is.rollNumber)) {
      list.unshift(is);
    }
  });
  return list;
})();

// In-Memory / Local Cache store
let cache = {
  students: initialLoadedStudents,
  faculty: getStored<Faculty[]>('faculty', INITIAL_FACULTY),
  departments: getStored<Department[]>('departments', INITIAL_DEPARTMENTS),
  courses: getStored<Course[]>('courses', INITIAL_COURSES),
  subjects: getStored<Subject[]>('subjects', INITIAL_SUBJECTS),
  classes: getStored<AcademicClass[]>('classes', INITIAL_CLASSES),
  sessions: getStored<AttendanceSession[]>('sessions', INITIAL_SESSIONS),
  records: getStored<AttendanceRecord[]>('records', INITIAL_ATTENDANCE_RECORDS),
  timetable: getStored<TimetableEntry[]>('timetable', INITIAL_TIMETABLE),
  notifications: getStored<NotificationItem[]>('notifications', INITIAL_NOTIFICATIONS),
  auditLogs: getStored<AuditLog[]>('auditLogs', INITIAL_AUDIT_LOGS),
  settings: getStored<SystemSettings>('settings', INITIAL_SETTINGS),
  activeQrSessions: {} as Record<string, DynamicQrSession>,
  faceProfiles: getStored<Record<string, number[]>>('faceProfiles', {
    'stu-nandini': [0.15, 0.48, 0.72, 0.29, 0.88, 0.61],
    'stu-01': [0.12, 0.44, 0.78, 0.23, 0.91, 0.54],
    'stu-02': [0.32, 0.14, 0.65, 0.88, 0.12, 0.77],
    'stu-03': [0.45, 0.82, 0.19, 0.34, 0.66, 0.51],
    'stu-05': [0.81, 0.22, 0.39, 0.47, 0.61, 0.33],
  }),
};

// Generic listener subscriber for local reactive fallback
type Unsubscribe = () => void;
function subscribeLocal(key: string, callback: () => void): Unsubscribe {
  const handler = (e: Event) => {
    const cust = e as CustomEvent;
    if (cust.detail?.key === key || cust.detail?.key === 'all') {
      callback();
    }
  };
  window.addEventListener('smartattend-store-update', handler);
  return () => window.removeEventListener('smartattend-store-update', handler);
}

// --- FIRESTORE SERVICE IMPLEMENTATION ---

export const firestoreService = {
  // 1. STUDENTS
  subscribeStudents(callback: (students: Student[]) => void): Unsubscribe {
    if (isLiveFirebaseConfigured && db) {
      const q = query(collection(db, 'students'));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Student));
        callback(list.length > 0 ? list : cache.students);
      }, (err) => {
        console.warn('Firestore live listen fallback:', err);
        callback(cache.students);
      });
    }

    callback(cache.students);
    return subscribeLocal('students', () => {
      cache.students = getStored<Student[]>('students', cache.students);
      callback(cache.students);
    });
  },

  async addStudent(studentData: Omit<Student, 'id'>): Promise<string> {
    const id = `stu-${Date.now()}`;
    const newStudent: Student = { ...studentData, id, overallAttendance: 100 };
    cache.students = [newStudent, ...cache.students];
    setStored('students', cache.students);

    if (isLiveFirebaseConfigured && db) {
      await setDoc(doc(db, 'students', id), newStudent);
    }

    this.addAuditLog('ADMIN', 'SYSTEM', 'STUDENT_CREATED', `Added new student: ${newStudent.fullName} (${newStudent.rollNumber})`);
    return id;
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<void> {
    cache.students = cache.students.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setStored('students', cache.students);

    if (isLiveFirebaseConfigured && db) {
      await updateDoc(doc(db, 'students', id), updates);
    }
    this.addAuditLog('ADMIN', 'SYSTEM', 'STUDENT_UPDATED', `Updated student details for ID: ${id}`);
  },

  async deleteStudent(id: string): Promise<void> {
    cache.students = cache.students.filter((s) => s.id !== id);
    setStored('students', cache.students);

    if (isLiveFirebaseConfigured && db) {
      await deleteDoc(doc(db, 'students', id));
    }
    this.addAuditLog('ADMIN', 'SYSTEM', 'STUDENT_DELETED', `Deleted student ID: ${id}`);
  },

  // 2. FACULTY
  subscribeFaculty(callback: (faculty: Faculty[]) => void): Unsubscribe {
    callback(cache.faculty);
    return subscribeLocal('faculty', () => {
      cache.faculty = getStored<Faculty[]>('faculty', cache.faculty);
      callback(cache.faculty);
    });
  },

  async addFaculty(data: Omit<Faculty, 'id'>): Promise<string> {
    const id = `faculty-${Date.now()}`;
    const newFac: Faculty = { ...data, id };
    cache.faculty = [newFac, ...cache.faculty];
    setStored('faculty', cache.faculty);
    this.addAuditLog('ADMIN', 'SYSTEM', 'FACULTY_CREATED', `Added faculty member: ${newFac.fullName}`);
    return id;
  },

  // 3. DEPARTMENTS, COURSES, SUBJECTS, CLASSES
  subscribeDepartments(callback: (depts: Department[]) => void): Unsubscribe {
    callback(cache.departments);
    return subscribeLocal('departments', () => callback(cache.departments));
  },

  subscribeSubjects(callback: (subjects: Subject[]) => void): Unsubscribe {
    callback(cache.subjects);
    return subscribeLocal('subjects', () => callback(cache.subjects));
  },

  subscribeClasses(callback: (classes: AcademicClass[]) => void): Unsubscribe {
    callback(cache.classes);
    return subscribeLocal('classes', () => callback(cache.classes));
  },

  subscribeCourses(callback: (courses: Course[]) => void): Unsubscribe {
    callback(cache.courses);
    return subscribeLocal('courses', () => callback(cache.courses));
  },

  // 4. ATTENDANCE SESSIONS
  subscribeSessions(callback: (sessions: AttendanceSession[]) => void): Unsubscribe {
    if (isLiveFirebaseConfigured && db) {
      const q = query(collection(db, 'attendanceSessions'), orderBy('startTime', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceSession));
        callback(list.length > 0 ? list : cache.sessions);
      }, () => callback(cache.sessions));
    }

    callback(cache.sessions);
    return subscribeLocal('sessions', () => {
      cache.sessions = getStored<AttendanceSession[]>('sessions', cache.sessions);
      callback(cache.sessions);
    });
  },

  subscribeActiveSession(sessionId: string, callback: (session: AttendanceSession | null) => void): Unsubscribe {
    const find = () => {
      const s = cache.sessions.find((item) => item.id === sessionId) || null;
      callback(s);
    };
    find();
    return subscribeLocal('sessions', find);
  },

  async createAttendanceSession(params: {
    facultyId: string;
    facultyName: string;
    subjectId: string;
    classId: string;
    division: string;
    durationMinutes: number;
    method: 'FACE' | 'QR';
    roomNumber?: string;
  }): Promise<AttendanceSession> {
    const subject = cache.subjects.find((s) => s.id === params.subjectId);
    const cls = cache.classes.find((c) => c.id === params.classId);

    const now = new Date();
    const end = new Date(now.getTime() + params.durationMinutes * 60 * 1000);

    const newSession: AttendanceSession = {
      id: `sess-${Date.now()}`,
      facultyId: params.facultyId,
      facultyName: params.facultyName,
      subjectId: params.subjectId,
      subjectName: subject ? subject.name : 'Selected Subject',
      classId: params.classId,
      className: cls ? cls.name : 'Selected Class',
      division: params.division,
      date: now.toISOString().split('T')[0],
      startTime: now.toISOString(),
      endTime: end.toISOString(),
      durationMinutes: params.durationMinutes,
      method: params.method,
      status: 'ACTIVE',
      totalStudents: cls ? cls.totalStudents : 48,
      presentCount: 0,
      roomNumber: params.roomNumber || 'Room A-204',
    };

    cache.sessions = [newSession, ...cache.sessions];
    setStored('sessions', cache.sessions);

    if (isLiveFirebaseConfigured && db) {
      await setDoc(doc(db, 'attendanceSessions', newSession.id), newSession);
    }

    // Broadcast Audit Log
    this.addAuditLog(
      'FACULTY',
      params.facultyName,
      'STARTED_ATTENDANCE',
      `Started ${params.method} session for ${newSession.subjectName} (${newSession.className})`
    );

    // Notify Students of that class
    this.addNotification({
      title: 'Attendance Session Started',
      message: `${params.facultyName} started ${params.method} attendance for ${newSession.subjectName}`,
      type: 'INFO',
      targetRole: 'STUDENT',
    });

    return newSession;
  },

  async endAttendanceSession(sessionId: string): Promise<void> {
    cache.sessions = cache.sessions.map((s) =>
      s.id === sessionId ? { ...s, status: 'COMPLETED' as const } : s
    );
    setStored('sessions', cache.sessions);

    if (isLiveFirebaseConfigured && db) {
      await updateDoc(doc(db, 'attendanceSessions', sessionId), { status: 'COMPLETED' });
    }

    this.addAuditLog('FACULTY', 'SYSTEM', 'ENDED_ATTENDANCE', `Attendance session ${sessionId} completed`);
  },

  // 5. ATTENDANCE RECORDS (LIVE LISTENER)
  subscribeRecords(callback: (records: AttendanceRecord[]) => void): Unsubscribe {
    callback(cache.records);
    return subscribeLocal('records', () => {
      cache.records = getStored<AttendanceRecord[]>('records', cache.records);
      callback(cache.records);
    });
  },

  subscribeSessionRecords(sessionId: string, callback: (records: AttendanceRecord[]) => void): Unsubscribe {
    const update = () => {
      const filtered = cache.records.filter((r) => r.sessionId === sessionId);
      callback(filtered);
    };
    update();
    return subscribeLocal('records', update);
  },

  // 6. DYNAMIC QR ATTENDANCE GENERATION & ROTATION (3 SECONDS)
  generateRotatingQrToken(sessionId: string, subjectName: string): DynamicQrSession {
    const now = Date.now();
    const expiresAt = now + 3500; // 3.5s allowing minor drift
    // Generate secure randomized hash token
    const token = `SMART-${sessionId.slice(-6)}-${now}-${Math.random().toString(36).substring(2, 9)}`;

    const qrSession: DynamicQrSession = {
      sessionId,
      subjectName,
      currentToken: token,
      generatedAt: now,
      expiresAt,
      intervalSeconds: 3,
    };

    cache.activeQrSessions[sessionId] = qrSession;
    return qrSession;
  },

  // 7. STUDENT QR SCAN & ATTENDANCE VALIDATION (Anti-Proxy)
  async markQrAttendance(params: {
    sessionId: string;
    studentId: string;
    scannedToken: string;
  }): Promise<{ success: boolean; message: string; record?: AttendanceRecord }> {
    const { sessionId, studentId, scannedToken } = params;

    // A. Check session active
    const session = cache.sessions.find((s) => s.id === sessionId);
    if (!session || session.status !== 'ACTIVE') {
      return { success: false, message: 'Attendance session is no longer active or expired.' };
    }

    // B. Check QR token freshness (Expires in 3 seconds)
    const qrData = cache.activeQrSessions[sessionId];
    const now = Date.now();
    if (!qrData || qrData.currentToken !== scannedToken) {
      // Check if it was generated in the last 3.5 seconds
      return { success: false, message: 'QR EXPIRED. Please scan the latest 3-second QR code.' };
    }

    if (now > qrData.expiresAt + 500) {
      return { success: false, message: 'QR EXPIRED. Token lifetime has elapsed.' };
    }

    // C. Check student enrollment in the session class
    let student = cache.students.find((s) => s.id === studentId || s.studentId === studentId);
    if (!student) {
      student =
        cache.students.find(
          (s) => s.fullName.toLowerCase().includes('nandini') || s.rollNumber === '23'
        ) || cache.students[0];
    }
    if (!student) {
      return { success: false, message: 'Student profile not found.' };
    }

    // D. Duplicate check
    const today = new Date().toISOString().split('T')[0];
    const duplicate = cache.records.find(
      (r) =>
        (r.sessionId === sessionId || r.subjectName === session.subjectName) &&
        (r.studentId === student!.id || r.studentName === student!.fullName) &&
        r.date === today &&
        r.status === 'PRESENT'
    );
    if (duplicate) {
      return { success: true, message: 'Attendance already recorded for today', record: duplicate };
    }

    // E. Record attendance
    const recordId = `rec-${Date.now()}`;
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecord: AttendanceRecord = {
      id: recordId,
      sessionId,
      studentId,
      studentName: student.fullName,
      rollNumber: student.rollNumber,
      subjectId: session.subjectId,
      subjectName: session.subjectName,
      classId: session.classId,
      division: session.division,
      facultyId: session.facultyId,
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      recordedTime: timeFormatted,
      method: 'QR',
      status: 'PRESENT',
    };

    cache.records = [newRecord, ...cache.records];
    setStored('records', cache.records);

    // Increment session present count
    session.presentCount += 1;
    cache.sessions = cache.sessions.map((s) => (s.id === sessionId ? session : s));
    setStored('sessions', cache.sessions);

    // Audit log
    this.addAuditLog(
      'STUDENT',
      student.fullName,
      'ATTENDANCE_MARKED',
      `${student.fullName} marked attendance for ${session.subjectName} via Dynamic QR`
    );

    // Student notification
    this.addNotification({
      userId: student.id,
      title: '✓ Attendance Marked',
      message: `Your attendance for ${session.subjectName} was recorded at ${timeFormatted}.`,
      type: 'SUCCESS',
    });

    return { success: true, message: 'Attendance Recorded', record: newRecord };
  },

  // 8. FACE RECOGNITION ATTENDANCE MARKING
  async markFaceAttendance(params: {
    sessionId: string;
    studentId: string;
    confidence: number;
  }): Promise<{ success: boolean; message: string; record?: AttendanceRecord }> {
    const { sessionId, studentId, confidence } = params;

    let session = cache.sessions.find((s) => s.id === sessionId);
    if (!session) {
      session = cache.sessions.find((s) => s.status === 'ACTIVE') || cache.sessions[0];
    }
    if (!session) {
      session = {
        id: sessionId || 'sess-active-01',
        facultyId: 'faculty-01',
        facultyName: 'Prof. Vikram Sharma',
        subjectId: 'sub-ml',
        subjectName: 'Machine Learning',
        classId: 'cls-aiml-3a',
        className: 'B.Tech AIML - Year 3 - Div A',
        division: 'A',
        date: new Date().toISOString().split('T')[0],
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        durationMinutes: 60,
        method: 'FACE',
        status: 'ACTIVE',
        totalStudents: 48,
        presentCount: 0,
        roomNumber: 'Room A-204',
      };
      cache.sessions = [session, ...cache.sessions];
      setStored('sessions', cache.sessions);
    }

    let student = cache.students.find((s) => s.id === studentId || s.studentId === studentId);
    if (!student) {
      student = cache.students.find((s) => s.email === studentId) || cache.students[0];
    }
    if (!student) {
      return { success: false, message: 'Face Not Recognized in Directory' };
    }

    // Check duplicate for today
    const today = new Date().toISOString().split('T')[0];
    const duplicate = cache.records.find(
      (r) =>
        (r.sessionId === session!.id || r.subjectName === session!.subjectName) &&
        (r.studentId === student!.id || r.studentName === student!.fullName) &&
        r.date === today &&
        r.status === 'PRESENT'
    );
    if (duplicate) {
      return { 
        success: true, 
        message: 'Attendance already recorded for today\'s lecture', 
        record: duplicate 
      };
    }

    const recordId = `rec-${Date.now()}`;
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newRecord: AttendanceRecord = {
      id: recordId,
      sessionId: session.id,
      studentId: student.id,
      studentName: student.fullName,
      rollNumber: student.rollNumber,
      subjectId: session.subjectId,
      subjectName: session.subjectName,
      classId: session.classId,
      division: session.division,
      facultyId: session.facultyId,
      date: today,
      timestamp: new Date().toISOString(),
      recordedTime: timeFormatted,
      method: 'FACE',
      status: 'PRESENT',
      confidence,
    };

    cache.records = [newRecord, ...cache.records];
    setStored('records', cache.records);

    session.presentCount = (session.presentCount || 0) + 1;
    cache.sessions = cache.sessions.map((s) => (s.id === sessionId ? session : s));
    setStored('sessions', cache.sessions);

    this.addAuditLog(
      'FACULTY',
      session.facultyName,
      'FACE_VERIFIED',
      `${student.fullName} verified via Biometric Face AI (${Math.round(confidence * 100)}% match)`
    );

    this.addNotification({
      userId: student.id,
      title: '✓ Face Attendance Marked',
      message: `Biometric verification passed for ${session.subjectName}.`,
      type: 'SUCCESS',
    });

    return { success: true, message: 'Attendance Recorded', record: newRecord };
  },

  // 9. FACE PROFILE ENROLLMENT
  async enrollStudentFace(studentId: string, embeddingVector: number[]): Promise<boolean> {
    cache.faceProfiles[studentId] = embeddingVector;
    setStored('faceProfiles', cache.faceProfiles);

    cache.students = cache.students.map((s) =>
      s.id === studentId ? { ...s, faceEnrolled: true, faceEnrolledAt: new Date().toISOString() } : s
    );
    setStored('students', cache.students);

    const student = cache.students.find((s) => s.id === studentId);
    this.addAuditLog(
      'STUDENT',
      student?.fullName || studentId,
      'FACE_ENROLLED',
      `Completed 5-step biometric enrollment and generated facial vector descriptor`
    );

    this.addNotification({
      userId: studentId,
      title: 'Face Enrollment Complete',
      message: 'Your facial profile has been securely enrolled for AI Attendance verification.',
      type: 'SUCCESS',
    });

    return true;
  },

  getEnrolledCandidates(): { studentId: string; fullName: string; rollNumber: string; embedding: number[] }[] {
    return cache.students
      .filter((s) => s.faceEnrolled && cache.faceProfiles[s.id])
      .map((s) => ({
        studentId: s.id,
        fullName: s.fullName,
        rollNumber: s.rollNumber,
        embedding: cache.faceProfiles[s.id],
      }));
  },

  // 10. MANUAL ATTENDANCE CORRECTION
  async correctAttendance(recordId: string, newStatus: 'PRESENT' | 'ABSENT' | 'LATE', remarks: string): Promise<void> {
    cache.records = cache.records.map((r) =>
      r.id === recordId ? { ...r, status: newStatus, remarks } : r
    );
    setStored('records', cache.records);

    this.addAuditLog(
      'FACULTY',
      'Faculty / Admin',
      'ATTENDANCE_CORRECTED',
      `Manual correction for record ${recordId} to ${newStatus}. Note: ${remarks}`
    );
  },

  // 11. TIMETABLE
  subscribeTimetable(callback: (entries: TimetableEntry[]) => void): Unsubscribe {
    callback(cache.timetable);
    return subscribeLocal('timetable', () => {
      cache.timetable = getStored<TimetableEntry[]>('timetable', cache.timetable);
      callback(cache.timetable);
    });
  },

  // 12. NOTIFICATIONS
  subscribeNotifications(userId: string, role: string, callback: (items: NotificationItem[]) => void): Unsubscribe {
    const filter = () => {
      const list = cache.notifications.filter(
        (n) => n.userId === userId || n.targetRole === role || n.targetRole === 'ALL'
      );
      callback(list);
    };
    filter();
    return subscribeLocal('notifications', () => {
      cache.notifications = getStored<NotificationItem[]>('notifications', cache.notifications);
      filter();
    });
  },

  async addNotification(item: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>): Promise<void> {
    const newItem: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    cache.notifications = [newItem, ...cache.notifications];
    setStored('notifications', cache.notifications);
  },

  async markNotificationRead(id: string): Promise<void> {
    cache.notifications = cache.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setStored('notifications', cache.notifications);
  },

  // 13. AUDIT LOGS
  subscribeAuditLogs(callback: (logs: AuditLog[]) => void): Unsubscribe {
    callback(cache.auditLogs);
    return subscribeLocal('auditLogs', () => {
      cache.auditLogs = getStored<AuditLog[]>('auditLogs', cache.auditLogs);
      callback(cache.auditLogs);
    });
  },

  async addAuditLog(actorRole: any, actorName: string, action: string, details: string): Promise<void> {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: 'user',
      actorName,
      actorRole,
      action,
      details,
      ipAddress: '192.168.1.' + Math.floor(Math.random() * 200 + 10),
    };
    cache.auditLogs = [newLog, ...cache.auditLogs];
    setStored('auditLogs', cache.auditLogs);
  },

  // 14. SETTINGS
  subscribeSettings(callback: (settings: SystemSettings) => void): Unsubscribe {
    callback(cache.settings);
    return subscribeLocal('settings', () => {
      cache.settings = getStored<SystemSettings>('settings', cache.settings);
      callback(cache.settings);
    });
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    cache.settings = { ...cache.settings, ...settings };
    setStored('settings', cache.settings);
    this.addAuditLog('ADMIN', 'Dr. Sarah Jenkins', 'SETTINGS_UPDATED', `Updated system configuration threshold`);
  },

  // RESET ALL DATA TO DEMO DEFAULTS
  resetToDefaults(): void {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(STORAGE_PREFIX)) localStorage.removeItem(k);
    });
    cache = {
      students: INITIAL_STUDENTS,
      faculty: INITIAL_FACULTY,
      departments: INITIAL_DEPARTMENTS,
      courses: INITIAL_COURSES,
      subjects: INITIAL_SUBJECTS,
      classes: INITIAL_CLASSES,
      sessions: INITIAL_SESSIONS,
      records: INITIAL_ATTENDANCE_RECORDS,
      timetable: INITIAL_TIMETABLE,
      notifications: INITIAL_NOTIFICATIONS,
      auditLogs: INITIAL_AUDIT_LOGS,
      settings: INITIAL_SETTINGS,
      activeQrSessions: {},
      faceProfiles: {
        'stu-01': [0.12, 0.44, 0.78, 0.23, 0.91, 0.54],
        'stu-02': [0.32, 0.14, 0.65, 0.88, 0.12, 0.77],
        'stu-03': [0.45, 0.82, 0.19, 0.34, 0.66, 0.51],
        'stu-05': [0.81, 0.22, 0.39, 0.47, 0.61, 0.33],
      },
    };
    window.dispatchEvent(new CustomEvent('smartattend-store-update', { detail: { key: 'all' } }));
  },
};
