import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAttendanceSession } from '../../context/AttendanceSessionContext';
import { firestoreService } from '../../firebase/firestoreService';
import { StartSessionModal } from '../../components/faculty/StartSessionModal';
import { StatCard } from '../../components/analytics/StatCard';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Play, 
  MapPin, 
  AlertTriangle 
} from 'lucide-react';
import { AttendanceSession, Student } from '../../types';
import { useNavigate } from 'react-router-dom';

export const FacultyDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeSession } = useAttendanceSession();

  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [showStartModal, setShowStartModal] = useState(false);
  const [defaultSubjectId, setDefaultSubjectId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const unsubStu = firestoreService.subscribeStudents(setStudents);
    const unsubSess = firestoreService.subscribeSessions(setSessions);
    return () => {
      unsubStu();
      unsubSess();
    };
  }, []);

  const todayClasses = [
    {
      id: 'c1',
      time: '09:00 AM',
      duration: '60 min',
      subjectName: 'Machine Learning',
      subjectId: 'sub-ml',
      class: 'B.Tech AIML - Div A',
      room: 'Room A-204',
      enrolled: 48,
    },
    {
      id: 'c2',
      time: '10:00 AM',
      duration: '60 min',
      subjectName: 'Data Science',
      subjectId: 'sub-ds',
      class: 'B.Tech AIML - Div A',
      room: 'Room A-204',
      enrolled: 48,
    },
    {
      id: 'c3',
      time: '11:15 AM',
      duration: '60 min',
      subjectName: 'Python Programming',
      subjectId: 'sub-py',
      class: 'B.Tech AIML - Div A',
      room: 'Lab L-102',
      enrolled: 48,
    },
  ];

  const handleStartClassAttendance = (subjectId: string) => {
    setDefaultSubjectId(subjectId);
    setShowStartModal(true);
  };

  const lowAttendanceStudents = students.filter((s) => (s.overallAttendance || 0) < 75);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-800 to-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-medium backdrop-blur-sm border border-white/20">
            Faculty Console
          </span>
          <h1 className="text-xl sm:text-2xl font-bold mt-2.5 tracking-tight text-white">
            Good Morning, {user?.fullName || 'Professor'} 👋
          </h1>
          <p className="text-white/80 text-xs sm:text-sm mt-1 leading-relaxed">
            Ready to initiate verified attendance. Choose between our dynamic 3-second anti-proxy QR code or biometric AI facial recognition.
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              onClick={() => {
                setDefaultSubjectId(undefined);
                setShowStartModal(true);
              }}
              className="h-10 px-4 bg-white text-brand-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-all shadow-sm inline-flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>START ATTENDANCE</span>
            </button>

            {activeSession && (
              <button
                onClick={() => {
                  if (activeSession.method === 'QR') navigate('/faculty/session/qr');
                  else navigate('/faculty/session/face');
                }}
                className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-all shadow-sm inline-flex items-center gap-2 animate-pulse"
              >
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>Resume Active {activeSession.method} Session ({activeSession.presentCount} marked)</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative Graphic Circles */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute right-24 top-0 -translate-y-8 w-40 h-40 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Today's Overview KPI Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Today's Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value="48"
            icon={Users}
            subtitle="AIML Div A roster"
          />
          <StatCard
            title="Present Today"
            value="41"
            change="+4 vs yesterday"
            icon={CheckCircle2}
            subtitle="Verified presence"
          />
          <StatCard
            title="Absent"
            value="7"
            changeType="negative"
            icon={XCircle}
            subtitle="Unexcused"
          />
          <StatCard
            title="Attendance %"
            value="85.4%"
            change="Target 75%"
            icon={TrendingUp}
            subtitle="Class average"
          />
        </div>
      </div>

      {/* Main Grid: Today's Classes & Low Attendance Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Today's Scheduled Classes (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Today's Assigned Classes</h3>
              <p className="text-xs text-slate-500 mt-0.5">Initiate attendance verification directly from class timetable</p>
            </div>
          </div>

          <div className="space-y-3">
            {todayClasses.map((cls) => (
              <div
                key={cls.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-12 rounded-lg bg-white border border-slate-200 text-center font-mono flex flex-col items-center justify-center shrink-0">
                    <div className="text-[11px] font-bold text-brand-700">{cls.time.split(' ')[0]}</div>
                    <div className="text-[9px] text-slate-400 font-medium">{cls.duration}</div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">{cls.subjectName}</h4>
                    <div className="text-xs text-slate-600 mt-0.5">{cls.class}</div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {cls.room}
                      </span>
                      <span>•</span>
                      <span>{cls.enrolled} Students Enrolled</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleStartClassAttendance(cls.subjectId)}
                  className="h-10 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm inline-flex items-center justify-center gap-2 self-start sm:self-auto shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Attendance</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Low Attendance Watchlist (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4" />
                <span>Low Attendance</span>
              </div>
              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                &lt;75% Alert
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3.5">
              Students at risk of examination debarment
            </p>

            <div className="space-y-2.5">
              {lowAttendanceStudents.map((st) => (
                <div
                  key={st.id}
                  className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{st.fullName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono">Roll: {st.rollNumber} • Div {st.division}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-rose-700 text-xs">{st.overallAttendance}%</div>
                    <div className="text-[10px] text-rose-500 font-medium mt-0.5">Follow-up sent</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/faculty/records')}
            className="w-full h-10 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center text-center"
          >
            Review Attendance Roster
          </button>
        </div>
      </div>

      {/* Start Session Modal */}
      <StartSessionModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        defaultSubjectId={defaultSubjectId}
      />
    </div>
  );
};
