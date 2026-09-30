import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../firebase/firestoreService';
import { QrScannerModal } from '../../components/qr/QrScannerModal';
import { StudentFaceScannerModal } from '../../components/face/StudentFaceScannerModal';
import { 
  QrCode, 
  CalendarCheck, 
  Clock, 
  ScanFace, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  ChevronRight,
  ShieldCheck,
  Camera,
  ArrowRight
} from 'lucide-react';
import { AttendanceRecord, Student } from '../../types';
import { useNavigate } from 'react-router-dom';

export const StudentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [showQrScanner, setShowQrScanner] = useState(false);
  const [showFaceScanner, setShowFaceScanner] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubStu = firestoreService.subscribeStudents((list) => {
      setAllStudents(list);
      const me = list.find((s) => s.id === user.id || s.email === user.email) || list[0];
      setStudent((prev) => (prev ? list.find((s) => s.id === prev.id) || me : me));
    });

    const unsubRec = firestoreService.subscribeRecords((list) => {
      const myRecords = list.filter((r) => r.studentId === (user ? user.id : 'stu-01'));
      setRecords(myRecords);
    });

    return () => {
      unsubStu();
      unsubRec();
    };
  }, [user?.id, user?.email]);



  const todayClasses = [
    {
      time: '09:00 AM',
      subject: 'Machine Learning',
      room: 'Room A-204',
      faculty: 'Prof. Vikram Sharma',
      status: 'Live Now',
    },
    {
      time: '10:00 AM',
      subject: 'Data Science',
      room: 'Room A-204',
      faculty: 'Dr. Ananya Iyer',
      status: 'Upcoming',
    },
    {
      time: '11:15 AM',
      subject: 'Python Programming',
      room: 'Lab L-102',
      faculty: 'Prof. Vikram Sharma',
      status: 'Upcoming',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Campus Attendance Terminal Station Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Campus Terminal Online</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Campus Attendance Station
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              AIML Department • Smart Biometric & Dynamic QR Attendance
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/80">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Anti-Proxy Guard: Active</span>
            </span>
          </div>
        </div>

        {/* Current Active Classroom Session Card */}
        <div className="mt-5 p-4 sm:p-5 rounded-xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-blue-200 uppercase tracking-wider font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Current Active Lecture Session</span>
            </div>
            <div className="text-lg sm:text-xl font-bold mt-1 tracking-tight text-white flex items-center gap-2.5">
              <span>Machine Learning (AIML-501)</span>
              <span className="text-[10px] font-semibold bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-md border border-emerald-400/30">
                Live Check-in Open
              </span>
            </div>
            <div className="text-xs text-blue-100 mt-1 flex flex-wrap items-center gap-3">
              <span>Prof. Vikram Sharma</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-200" />
                Room A-204
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-200" />
                09:00 AM – 10:00 AM
              </span>
            </div>
          </div>

          <div className="bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/20 shrink-0 text-center">
            <div className="text-[10px] text-blue-200 font-medium uppercase tracking-wider">Session Status</div>
            <div className="text-sm font-bold text-white mt-0.5 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Accepting Scans</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Attendance Verification Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Mark Today's Attendance
          </h2>
          <button
            onClick={() => navigate('/student/attendance')}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>My Attendance Records</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* 1. Dynamic QR Scanner Card */}
          <div
            onClick={() => setShowQrScanner(true)}
            className="group cursor-pointer bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-blue-400 hover:shadow-xs transition-all flex items-start gap-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                  QR Scanner
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  Dynamic 3s
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Scan professor's rotating HMAC QR code on classroom screen
              </p>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                <span>Launch QR Scanner</span>
                <span>→</span>
              </div>
            </div>
          </div>

          {/* 2. Biometric Face Scan Card */}
          <div
            onClick={() => setShowFaceScanner(true)}
            className="group cursor-pointer bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-indigo-400 hover:shadow-xs transition-all flex items-start gap-3.5"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <ScanFace className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Face Scan (AI Face ID)
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  128-D AI
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Instant biometric verification using camera facial landmarks
              </p>
              <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                <span>Launch Face Scan</span>
                <span>→</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Privacy & Personal Attendance Access Card */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Confidential Student Attendance Portal
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed max-w-xl">
              Individual attendance percentages and detailed subject statistics are private and confidential. To inspect your personal attendance record, open your private portal.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/student/attendance')}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <span>View My Private Records</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Today's Schedule</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your daily lecture sessions</p>
          </div>
          <button
            onClick={() => navigate('/student/timetable')}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
          >
            <span>Full Timetable</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {todayClasses.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-11 rounded-lg bg-white border border-slate-200 flex flex-col items-center justify-center font-mono">
                  <span className="text-[11px] font-bold text-slate-900">{item.time.split(' ')[0]}</span>
                  <span className="text-[9px] text-slate-400">{item.time.split(' ')[1]}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">{item.subject}</h4>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{item.faculty}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.room}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {item.status === 'Live Now' ? (
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Live Session
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                    Upcoming
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Modals: QR Scanner & Face Scan */}
      <QrScannerModal
        isOpen={showQrScanner}
        onClose={() => setShowQrScanner(false)}
        onSuccess={() => {
          setTimeout(() => setShowQrScanner(false), 1500);
        }}
      />

      <StudentFaceScannerModal
        isOpen={showFaceScanner}
        onClose={() => setShowFaceScanner(false)}
        onSuccess={() => {
          setTimeout(() => setShowFaceScanner(false), 1500);
        }}
      />
    </div>
  );
};
