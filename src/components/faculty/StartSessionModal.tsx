import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAttendanceSession } from '../../context/AttendanceSessionContext';
import { firestoreService } from '../../firebase/firestoreService';
import { Subject, AcademicClass } from '../../types';
import { 
  Play, 
  X, 
  QrCode, 
  ScanFace, 
  Clock, 
  BookOpen, 
  Layers, 
  DoorClosed,
  Sparkles 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StartSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubjectId?: string;
}

export const StartSessionModal: React.FC<StartSessionModalProps> = ({
  isOpen,
  onClose,
  defaultSubjectId,
}) => {
  const { user } = useAuth();
  const { startSession } = useAttendanceSession();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [division, setDivision] = useState('A');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [method, setMethod] = useState<'QR' | 'FACE'>('QR');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubSub = firestoreService.subscribeSubjects((list) => {
      setSubjects(list);
      if (list.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(defaultSubjectId || list[0].id);
      }
    });

    const unsubCls = firestoreService.subscribeClasses((list) => {
      setClasses(list);
      if (list.length > 0 && !selectedClassId) {
        setSelectedClassId(list[0].id);
      }
    });

    return () => {
      unsubSub();
      unsubCls();
    };
  }, [defaultSubjectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const session = await startSession({
        facultyId: user.id,
        facultyName: user.fullName,
        subjectId: selectedSubjectId,
        classId: selectedClassId,
        division,
        durationMinutes,
        method,
        roomNumber: 'Room A-204',
      });

      setLoading(false);
      onClose();

      // Navigate to live session view
      if (method === 'QR') {
        navigate('/faculty/session/qr');
      } else {
        navigate('/faculty/session/face');
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        {/* Top Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-brand-400" />
            <span className="font-bold text-sm tracking-wide">START ATTENDANCE SESSION</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Subject Selection */}
          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-brand-600" />
              <span>Subject</span>
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-surface-border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          {/* Class & Division */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-600" />
                <span>Class</span>
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-surface-border rounded-xl text-xs font-semibold"
                required
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                <DoorClosed className="w-3.5 h-3.5 text-brand-600" />
                <span>Division</span>
              </label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-surface-border rounded-xl text-xs font-semibold"
              >
                <option value="A">Division A</option>
                <option value="B">Division B</option>
                <option value="C">Division C</option>
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              <span>Session Duration (Minutes)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[45, 60, 90].map((dur) => (
                <button
                  type="button"
                  key={dur}
                  onClick={() => setDurationMinutes(dur)}
                  className={`py-2 rounded-xl border text-center font-bold transition-all ${
                    durationMinutes === dur
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {dur} Mins
                </button>
              ))}
            </div>
          </div>

          {/* Attendance Method Selection */}
          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-2">
              Select Attendance Verification Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Dynamic QR */}
              <button
                type="button"
                onClick={() => setMethod('QR')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  method === 'QR'
                    ? 'border-brand-600 bg-brand-50/60 shadow-sm'
                    : 'border-surface-border bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center mb-2">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="font-bold text-gray-900 text-sm">Dynamic QR</div>
                <div className="text-[11px] text-gray-500 mt-1">
                  Rotating QR changes every 3 seconds for anti-proxy classroom display.
                </div>
              </button>

              {/* Face Recognition */}
              <button
                type="button"
                onClick={() => setMethod('FACE')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  method === 'FACE'
                    ? 'border-brand-600 bg-brand-50/60 shadow-sm'
                    : 'border-surface-border bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                  <ScanFace className="w-5 h-5" />
                </div>
                <div className="font-bold text-gray-900 text-sm">Face Recognition</div>
                <div className="text-[11px] text-gray-500 mt-1">
                  AI Biometric verification matches faces with enrolled student profiles.
                </div>
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Creating Session...' : `Launch ${method === 'QR' ? 'Dynamic QR' : 'Face AI'} Session`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
