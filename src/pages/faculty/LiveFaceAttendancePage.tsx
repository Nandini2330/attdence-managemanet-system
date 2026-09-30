import React from 'react';
import { useAttendanceSession } from '../../context/AttendanceSessionContext';
import { FaceCameraView } from '../../components/face/FaceCameraView';
import { PowerOff, ArrowLeft, ScanFace } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LiveFaceAttendancePage: React.FC = () => {
  const { activeSession, endSession } = useAttendanceSession();
  const navigate = useNavigate();

  const handleEndSession = async () => {
    if (window.confirm('Conclude this Biometric AI Face Attendance session?')) {
      await endSession();
      navigate('/faculty');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
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
              <ScanFace className="w-5 h-5 text-indigo-600" />
              <h1 className="font-bold text-base sm:text-lg text-slate-900">
                {activeSession ? `${activeSession.subjectName} — Biometric Face Verification` : 'Face Recognition Attendance'}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                AI Vision
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeSession ? `${activeSession.className} (${activeSession.division})` : 'Neural Landmark Identification'}
            </p>
          </div>
        </div>

        <button
          onClick={handleEndSession}
          className="h-10 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <PowerOff className="w-4 h-4" />
          <span>Conclude Face Session</span>
        </button>
      </div>

      {/* Main Face AI Camera and Live Stats Feed */}
      <FaceCameraView />
    </div>
  );
};
