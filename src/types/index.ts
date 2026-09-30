export type UserRole = 'ADMIN' | 'FACULTY' | 'STUDENT';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  departmentId?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  studentId: string; // e.g. STU-2026-001
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  courseId: string;
  courseName: string;
  year: number; // 1, 2, 3, 4
  division: string; // A, B, C
  rollNumber: string; // 101, 102...
  profileImage?: string;
  status: 'ACTIVE' | 'INACTIVE';
  faceEnrolled: boolean;
  faceEnrolledAt?: string;
  overallAttendance?: number;
}

export interface Faculty {
  id: string;
  facultyId: string; // FAC-101
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  assignedSubjects: string[];
  assignedClasses: string[];
  profileImage?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Department {
  id: string;
  name: string;
  code: string; // e.g. AIML, CSE
  totalStudents: number;
  totalFaculty: number;
}

export interface Course {
  id: string;
  departmentId: string;
  name: string; // e.g. B.Tech Artificial Intelligence & Machine Learning
  code: string;
  durationYears: number;
}

export interface Subject {
  id: string;
  name: string; // e.g. Machine Learning
  code: string; // ML-401
  departmentId: string;
  courseId: string;
  semester: number;
  credits: number;
}

export interface AcademicClass {
  id: string;
  name: string; // B.Tech AIML - Year 3 - Div A
  courseId: string;
  year: number;
  division: string;
  roomNumber: string;
  totalStudents: number;
}

export interface AttendanceSession {
  id: string;
  facultyId: string;
  facultyName: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  division: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO
  endTime: string;
  durationMinutes: number;
  method: 'FACE' | 'QR';
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  totalStudents: number;
  presentCount: number;
  roomNumber?: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  division: string;
  facultyId: string;
  date: string;
  timestamp: string; // ISO
  recordedTime: string; // 10:42 AM
  method: 'FACE' | 'QR' | 'MANUAL';
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  confidence?: number;
  remarks?: string;
}

export interface DynamicQrSession {
  sessionId: string;
  subjectName: string;
  currentToken: string;
  generatedAt: number; // ms
  expiresAt: number; // ms
  intervalSeconds: number; // 3 seconds
}

export interface TimetableEntry {
  id: string;
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  startTime: string; // e.g. "09:00 AM"
  endTime: string; // e.g. "10:00 AM"
  subjectId: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  classId: string;
  className: string;
  division: string;
  roomNumber: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  targetRole?: UserRole | 'ALL';
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface SystemSettings {
  minAttendanceThreshold: number; // Default 75
  qrRotationIntervalSeconds: number; // Default 3
  faceConfidenceThreshold: number; // Default 0.72
  allowManualCorrection: boolean;
  academicTerm: string;
}

export interface SubjectAttendanceSummary {
  subjectId: string;
  subjectName: string;
  code: string;
  conducted: number;
  present: number;
  absent: number;
  percentage: number;
  status: 'Good' | 'Low Attendance';
}
