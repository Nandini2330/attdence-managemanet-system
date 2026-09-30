import React, { useState, useEffect } from 'react';
import { firestoreService } from '../../firebase/firestoreService';
import { Department, Subject, AcademicClass } from '../../types';
import { Building2, BookOpen, Layers, Plus, CheckCircle2 } from 'lucide-react';

export const AcademicManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'DEPARTMENTS' | 'SUBJECTS' | 'CLASSES'>('SUBJECTS');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);

  useEffect(() => {
    const unsubDept = firestoreService.subscribeDepartments(setDepartments);
    const unsubSub = firestoreService.subscribeSubjects(setSubjects);
    const unsubCls = firestoreService.subscribeClasses(setClasses);
    return () => {
      unsubDept();
      unsubSub();
      unsubCls();
    };
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900">Academic Structure</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure departments, curriculum subjects, and class division allocations
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('SUBJECTS')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'SUBJECTS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Curriculum Subjects ({subjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('CLASSES')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'CLASSES'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Class Divisions ({classes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DEPARTMENTS')}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'DEPARTMENTS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Departments ({departments.length})</span>
        </button>
      </div>

      {/* Tab: Subjects */}
      {activeTab === 'SUBJECTS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map((sub) => (
            <div key={sub.id} className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-xs transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                    {sub.code}
                  </span>
                  <span className="text-xs font-medium text-slate-500">{sub.credits} Credits</span>
                </div>
                <h3 className="font-semibold text-sm text-slate-900 mt-2.5">{sub.name}</h3>
                <div className="text-xs text-slate-500 mt-0.5">Semester {sub.semester}</div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>AIML Department</span>
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Classes */}
      {activeTab === 'CLASSES' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-xs transition-shadow flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {cls.roomNumber}
                </span>
                <h3 className="font-semibold text-sm text-slate-900 mt-2.5">{cls.name}</h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  Year {cls.year} • Division {cls.division}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Class Roster:</span>
                <span className="font-semibold text-slate-900">{cls.totalStudents} Students</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Departments */}
      {activeTab === 'DEPARTMENTS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-xs transition-shadow">
              <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                {dept.code}
              </span>
              <h3 className="font-semibold text-sm text-slate-900 mt-2.5">{dept.name}</h3>
              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-slate-400">Total Students</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{dept.totalStudents}</div>
                </div>
                <div>
                  <div className="text-slate-400">Faculty Count</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{dept.totalFaculty}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
