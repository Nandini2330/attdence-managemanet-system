import React, { useState, useEffect } from 'react';
import { firestoreService } from '../../firebase/firestoreService';
import { Student, Department } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StudentRegistrationWizardModal } from '../../components/student/StudentRegistrationWizardModal';
import { 
  Users, 
  Search, 
  Plus, 
  ScanFace, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Eye, 
  X
} from 'lucide-react';

export const StudentManagementPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  useEffect(() => {
    const unsubStu = firestoreService.subscribeStudents(setStudents);
    const unsubDept = firestoreService.subscribeDepartments(setDepartments);
    return () => {
      unsubStu();
      unsubDept();
    };
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || s.departmentId === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || s.status === selectedStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleToggleStatus = async (student: Student) => {
    const newStatus = student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await firestoreService.updateStudent(student.id, { status: newStatus });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to deactivate and remove this student?')) {
      await firestoreService.deleteStudent(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Student Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage student enrollments, biometric face profiles, and class allocations
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="h-10 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm inline-flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, roll number, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Roll No</th>
                <th className="py-3.5 px-4">Class & Div</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Face Biometric</th>
                <th className="py-3.5 px-4">Attendance %</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No students found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {stu.profileImage ? (
                          <img src={stu.profileImage} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-xs border border-brand-100">
                            {stu.fullName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900">{stu.fullName}</div>
                          <div className="text-[11px] text-slate-400">{stu.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {stu.rollNumber}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      Year {stu.year} • Div {stu.division}
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-800">
                      {stu.departmentName}
                    </td>

                    <td className="py-3 px-4">
                      {stu.faceEnrolled ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <ScanFace className="w-3.5 h-3.5 text-emerald-600" />
                          Enrolled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                          Not Enrolled
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`font-bold ${
                        (stu.overallAttendance || 0) < 75 ? 'text-rose-600' : 'text-emerald-600'
                      }`}>
                        {stu.overallAttendance || 100}%
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={stu.status} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingStudent(stu)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="View Student Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(stu)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Toggle Status"
                        >
                          {stu.status === 'ACTIVE' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        </button>
                        <button
                          onClick={() => handleDelete(stu.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2-STEP REGISTRATION MODAL: Page 1 (Info) -> Page 2 (Face Save) */}
      <StudentRegistrationWizardModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Student Details View Dossier Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="font-bold text-sm text-slate-900">Student Profile Dossier</span>
              <button onClick={() => setViewingStudent(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              {viewingStudent.profileImage ? (
                <img src={viewingStudent.profileImage} alt="" className="w-16 h-16 rounded-2xl object-cover border border-slate-200" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-xl border border-brand-100">
                  {viewingStudent.fullName.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="font-bold text-base text-slate-900">{viewingStudent.fullName}</h3>
                <div className="text-xs text-slate-500 font-mono">{viewingStudent.studentId}</div>
                <div className="text-xs text-brand-600 font-semibold mt-0.5">
                  Roll No: {viewingStudent.rollNumber} • {viewingStudent.departmentName}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Overall Attendance:</span>
                <span className="font-bold text-emerald-600">{viewingStudent.overallAttendance}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Biometric AI Status:</span>
                <span className="font-semibold text-slate-800">
                  {viewingStudent.faceEnrolled ? '✓ Face Enrolled' : 'Not Enrolled'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Class & Division:</span>
                <span className="font-semibold text-slate-800">Year {viewingStudent.year} - Div {viewingStudent.division}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Email:</span>
                <span className="font-medium text-slate-800">{viewingStudent.email}</span>
              </div>
            </div>

            <button
              onClick={() => setViewingStudent(null)}
              className="w-full h-10 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
