import React, { useState, useEffect } from 'react';
import { firestoreService } from '../../firebase/firestoreService';
import { AcademicClass, Student } from '../../types';
import { StartSessionModal } from '../../components/faculty/StartSessionModal';
import { Layers, Users, Play, MapPin, Eye } from 'lucide-react';

export const FacultyClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showStartModal, setShowStartModal] = useState(false);

  useEffect(() => {
    const unsubCls = firestoreService.subscribeClasses(setClasses);
    const unsubStu = firestoreService.subscribeStudents(setStudents);
    return () => {
      unsubCls();
      unsubStu();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">Assigned Classes</h1>
          <p className="text-xs text-gray-500 mt-1">
            View allocated semester classes, classroom rooms, and enrolled students
          </p>
        </div>

        <button
          onClick={() => setShowStartModal(true)}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 self-start"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch Attendance</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classes.map((cls) => {
          const classStudents = students.filter((s) => s.division === cls.division);

          return (
            <div key={cls.id} className="bg-white rounded-2xl border border-surface-border p-6 shadow-card space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 font-mono">
                    {cls.roomNumber}
                  </span>
                  <h3 className="font-bold text-lg text-gray-900 mt-1.5">{cls.name}</h3>
                  <div className="text-xs text-gray-500">
                    Division {cls.division} • Year {cls.year}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-extrabold text-gray-900">{classStudents.length || cls.totalStudents}</div>
                  <div className="text-[10px] text-gray-400 font-medium">Students Enrolled</div>
                </div>
              </div>

              {/* Roster preview */}
              <div className="border-t border-gray-100 pt-3">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Sample Student Roster:
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {classStudents.slice(0, 5).map((s) => (
                    <div key={s.id} className="p-2 bg-gray-50 rounded-xl text-xs flex items-center justify-between">
                      <span className="font-medium text-gray-800">{s.fullName}</span>
                      <span className="font-mono text-gray-400 text-[11px]">{s.rollNumber}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <StartSessionModal isOpen={showStartModal} onClose={() => setShowStartModal(false)} />
    </div>
  );
};
