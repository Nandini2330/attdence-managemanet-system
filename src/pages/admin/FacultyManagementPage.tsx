import React, { useState, useEffect } from 'react';
import { firestoreService } from '../../firebase/firestoreService';
import { Faculty, Department, Subject } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  GraduationCap, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  BookOpen, 
  X, 
  CheckCircle2, 
  XCircle, 
  Building2 
} from 'lucide-react';

export const FacultyManagementPage: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    departmentId: 'dept-aiml',
    departmentName: 'Artificial Intelligence & Machine Learning',
    designation: 'Assistant Professor',
    assignedSubjects: [] as string[],
    assignedClasses: ['cls-aiml-3a'],
    status: 'ACTIVE' as const,
  });

  useEffect(() => {
    const unsubFac = firestoreService.subscribeFaculty(setFaculty);
    const unsubDept = firestoreService.subscribeDepartments(setDepartments);
    const unsubSub = firestoreService.subscribeSubjects(setSubjects);
    return () => {
      unsubFac();
      unsubDept();
      unsubSub();
    };
  }, []);

  const filteredFaculty = faculty.filter(
    (f) =>
      f.fullName.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      f.departmentName.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    const dept = departments.find((d) => d.id === formData.departmentId);
    await firestoreService.addFaculty({
      ...formData,
      facultyId: `FAC-${Math.floor(Math.random() * 800 + 100)}`,
      departmentName: dept ? dept.name : 'AIML',
    });
    setShowAddModal(false);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      departmentId: 'dept-aiml',
      departmentName: 'Artificial Intelligence & Machine Learning',
      designation: 'Assistant Professor',
      assignedSubjects: [],
      assignedClasses: ['cls-aiml-3a'],
      status: 'ACTIVE',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900">Faculty Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage academic staff, department assignments, and course allocations
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-all shadow-sm inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty by name, email, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFaculty.map((f) => (
          <div key={f.id} className="bg-white rounded-xl border border-slate-200/80 p-4 sm:p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-xs transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {f.profileImage ? (
                    <img src={f.profileImage} alt="" className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-100 shrink-0">
                      {f.fullName.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-slate-900 truncate">{f.fullName}</h3>
                    <div className="text-xs text-blue-600 font-medium truncate">{f.designation}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{f.facultyId}</div>
                  </div>
                </div>
                <StatusBadge status={f.status} size="sm" />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 text-slate-500">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{f.departmentName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{f.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Assigned {f.assignedSubjects.length || 2} Active Subjects</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Faculty Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl border border-slate-200 flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Add Faculty Member</h3>
                <p className="text-xs text-slate-500 mt-0.5">Register a new professor or instructor</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFaculty} className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Prof. Jane Doe"
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="prof@smartattend.edu"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Associate Professor"
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Department</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                >
                  Register Faculty Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
