import React, { useState, useEffect } from 'react';
import { firestoreService } from '../../firebase/firestoreService';
import { AttendanceRecord } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  CalendarCheck, 
  Search, 
  Filter, 
  QrCode, 
  ScanFace, 
  Edit3, 
  CheckCircle2, 
  X,
  Clock 
} from 'lucide-react';

export const AttendanceRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [newStatus, setNewStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE'>('PRESENT');
  const [correctionRemarks, setCorrectionRemarks] = useState('');

  useEffect(() => {
    const unsub = firestoreService.subscribeRecords(setRecords);
    return () => unsub();
  }, []);

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.subjectName.toLowerCase().includes(search.toLowerCase());
    const matchesMethod = methodFilter === 'ALL' || r.method === methodFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesMethod && matchesStatus;
  });

  const handleSaveCorrection = async () => {
    if (!editingRecord) return;
    await firestoreService.correctAttendance(
      editingRecord.id,
      newStatus,
      correctionRemarks || 'Administrative attendance adjustment'
    );
    setEditingRecord(null);
    setCorrectionRemarks('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900">Attendance Master Log</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Complete institutional log of Biometric Face & Dynamic QR verified attendance records
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Methods</option>
            <option value="QR">Dynamic QR</option>
            <option value="FACE">Face AI Recognition</option>
            <option value="MANUAL">Manual Correction</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="ALL">All Status</option>
            <option value="PRESENT">Present</option>
            <option value="ABSENT">Absent</option>
            <option value="LATE">Late</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Roll No</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Div</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Correct</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No attendance records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{r.date}</div>
                      <div className="text-[10px] text-slate-400">{r.recordedTime}</div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {r.studentName}
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-slate-600">
                      {r.rollNumber}
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {r.subjectName}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      Div {r.division}
                    </td>

                    <td className="py-3 px-4">
                      {r.method === 'QR' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                          <QrCode className="w-3.5 h-3.5" />
                          Dynamic QR
                        </span>
                      )}
                      {r.method === 'FACE' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                          <ScanFace className="w-3.5 h-3.5" />
                          Face AI {r.confidence ? `(${Math.round(r.confidence * 100)}%)` : ''}
                        </span>
                      )}
                      {r.method === 'MANUAL' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                          Manual
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} size="sm" />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingRecord(r);
                          setNewStatus(r.status);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Authorized Correction"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Attendance Correction Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Correct Record</h3>
                <p className="text-xs text-slate-400">Manual administrative adjustment</p>
              </div>
              <button 
                onClick={() => setEditingRecord(null)} 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="font-semibold text-slate-900">{editingRecord.studentName} ({editingRecord.rollNumber})</div>
              <div className="text-slate-500">{editingRecord.subjectName} • {editingRecord.date}</div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 text-xs mb-1.5">
                New Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['PRESENT', 'ABSENT', 'LATE'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setNewStatus(st)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                      newStatus === st
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 text-xs mb-1">
                Authorized Reason / Remarks
              </label>
              <textarea
                value={correctionRemarks}
                onChange={(e) => setCorrectionRemarks(e.target.value)}
                placeholder="Reason for adjustment (e.g. medical note, scanner glare)..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs h-20 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleSaveCorrection}
              className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
            >
              Confirm Correction & Log to Audit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
