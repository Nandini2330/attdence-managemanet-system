import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

// Layouts
import { DashboardLayout } from '../layouts/DashboardLayout';
import { StudentLayout } from '../layouts/StudentLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { UnauthorizedPage } from '../pages/auth/UnauthorizedPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { StudentManagementPage } from '../pages/admin/StudentManagementPage';
import { FacultyManagementPage } from '../pages/admin/FacultyManagementPage';
import { AcademicManagementPage } from '../pages/admin/AcademicManagementPage';
import { TimetableManagementPage } from '../pages/admin/TimetableManagementPage';
import { AttendanceRecordsPage } from '../pages/admin/AttendanceRecordsPage';
import { AuditLogsPage } from '../pages/admin/AuditLogsPage';
import { SystemSettingsPage } from '../pages/admin/SystemSettingsPage';

// Faculty Pages
import { FacultyDashboardPage } from '../pages/faculty/FacultyDashboardPage';
import { LiveQrSessionPage } from '../pages/faculty/LiveQrSessionPage';
import { LiveFaceAttendancePage } from '../pages/faculty/LiveFaceAttendancePage';
import { FacultyClassesPage } from '../pages/faculty/FacultyClassesPage';
import { FacultyReportsPage } from '../pages/faculty/FacultyReportsPage';

// Student Pages
import { StudentDashboardPage } from '../pages/student/StudentDashboardPage';
import { StudentQrScannerPage } from '../pages/student/StudentQrScannerPage';
import { StudentHistoryPage } from '../pages/student/StudentHistoryPage';
import { StudentTimetablePage } from '../pages/student/StudentTimetablePage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';

export const AppRoutes: React.FC = () => {
  const { role } = useAuth();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="students" element={<StudentManagementPage />} />
        <Route path="faculty" element={<FacultyManagementPage />} />
        <Route path="departments" element={<AcademicManagementPage />} />
        <Route path="subjects" element={<AcademicManagementPage />} />
        <Route path="classes" element={<AcademicManagementPage />} />
        <Route path="timetable" element={<TimetableManagementPage />} />
        <Route path="attendance" element={<AttendanceRecordsPage />} />
        <Route path="reports" element={<FacultyReportsPage />} />
        <Route path="notifications" element={<AttendanceRecordsPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="settings" element={<SystemSettingsPage />} />
      </Route>

      {/* Faculty Protected Routes */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<FacultyDashboardPage />} />
        <Route path="classes" element={<FacultyClassesPage />} />
        <Route path="session/qr" element={<LiveQrSessionPage />} />
        <Route path="session/face" element={<LiveFaceAttendancePage />} />
        <Route path="records" element={<AttendanceRecordsPage />} />
        <Route path="reports" element={<FacultyReportsPage />} />
        <Route path="timetable" element={<TimetableManagementPage />} />
      </Route>

      {/* Student Protected Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboardPage />} />
        <Route path="scan" element={<StudentQrScannerPage />} />
        <Route path="attendance" element={<StudentHistoryPage />} />
        <Route path="timetable" element={<StudentTimetablePage />} />
        <Route path="profile" element={<StudentProfilePage />} />
      </Route>

      {/* Default Fallback Redirect */}
      <Route
        path="*"
        element={
          role === 'ADMIN' ? (
            <Navigate to="/admin" replace />
          ) : role === 'FACULTY' ? (
            <Navigate to="/faculty" replace />
          ) : (
            <Navigate to="/student" replace />
          )
        }
      />
    </Routes>
  );
};
