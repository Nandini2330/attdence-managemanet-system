import React, { useState } from 'react';
import { useAttendanceSession } from '../../context/AttendanceSessionContext';
import { RotatingQrCode } from '../../components/qr/RotatingQrCode';
import { 
  Users, 
  CheckCircle2, 
  PowerOff, 
  Maximize2, 
  Minimize2, 
  ShieldCheck, 
  Clock, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LiveQrSessionPage: React.FC = () => {
  const { activeSession, sessionRecords, endSession } = useAttendanceSession();
  const navigate = useNavigate();
  const [fullscreen, setFullscreen] = useState(false);

  const handleEndSession = async () => {
    if (window.confirm('Are you sure you want to conclude this attendance session? All marked attendances are safely stored in Firestore.')) {
      await endSession();
      navigate('/faculty');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Session Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/faculty')}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-slate-900">
                {activeSession ? activeSession.subjectName : 'Dynamic QR Attendance'}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                Live Broadcast
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeSession ? `${activeSession.className} • ${activeSession.division}` : 'Rotating Anti-Proxy QR Active'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="h-10 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{fullscreen ? 'Exit Fullscreen' : 'Projector Mode'}</span>
          </button>

          <button
            onClick={handleEndSession}
            className="h-10 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <PowerOff className="w-4 h-4" />
            <span>End Attendance Session</span>
          </button>
        </div>
      </div>

      {/* Main Grid: QR Presentation in Center, Live Attendees on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Dynamic Rotating QR Presentation (7 cols) */}
        <div className="lg:col-span-7">
          <RotatingQrCode
            fullscreen={fullscreen}
            onToggleFullscreen={() => setFullscreen(!fullscreen)}
          />
        </div>

        {/* Live Attendance Roll Feed (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-semibold text-xs text-slate-700 uppercase tracking-wider">Live Attendance Feed</h3>
              <p className="text-[11px] text-slate-400">Updating in real-time as students scan</p>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              {sessionRecords.length} Present
            </span>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {sessionRecords.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                Waiting for student scans... Display QR to class.
              </div>
            ) : (
              sessionRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 bg-slate-50 border border-slate-200/70 rounded-lg text-xs flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900">{rec.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Roll {rec.rollNumber}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-emerald-700 font-semibold text-xs">{rec.recordedTime}</span>
                    <div className="text-[10px] text-emerald-600 uppercase font-medium">Verified QR</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
