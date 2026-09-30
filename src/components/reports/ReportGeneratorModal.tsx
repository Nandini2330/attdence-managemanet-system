import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  X, 
  Filter, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { firestoreService } from '../../firebase/firestoreService';
import { AttendanceRecord, Student, Subject } from '../../types';

interface ReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportGeneratorModal: React.FC<ReportGeneratorModalProps> = ({ isOpen, onClose }) => {
  const [reportType, setReportType] = useState<'Daily Attendance' | 'Monthly Attendance' | 'Student Attendance' | 'Subject Attendance' | 'Low Attendance'>('Daily Attendance');
  const [format, setFormat] = useState<'PDF' | 'EXCEL' | 'CSV'>('PDF');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsExporting(true);
    setDownloadSuccess(false);

    // Fetch live records and student roster from firestoreService
    let records: AttendanceRecord[] = [];
    let students: Student[] = [];
    let subjects: Subject[] = [];

    firestoreService.subscribeRecords((r) => { records = r; })();
    firestoreService.subscribeStudents((s) => { students = s; })();
    firestoreService.subscribeSubjects((sub) => { subjects = sub; })();

    // Filter data based on selected report
    let exportData: any[] = [];

    if (reportType === 'Low Attendance') {
      exportData = students
        .filter((s) => (s.overallAttendance || 0) < 75)
        .map((s) => ({
          'Student ID': s.studentId,
          'Full Name': s.fullName,
          'Roll Number': s.rollNumber,
          'Department': s.departmentName,
          'Attendance Rate': `${s.overallAttendance}%`,
          'Status': 'CRITICAL (<75%)',
        }));
    } else {
      let filtered = records;
      if (statusFilter !== 'ALL') {
        filtered = filtered.filter((r) => r.status === statusFilter);
      }
      exportData = filtered.map((r) => ({
        'Date': r.date,
        'Student Name': r.studentName,
        'Roll No': r.rollNumber,
        'Subject': r.subjectName,
        'Division': r.division,
        'Time': r.recordedTime,
        'Method': r.method,
        'Status': r.status,
      }));
    }

    if (exportData.length === 0) {
      exportData = [
        {
          'Notice': 'No matching attendance records found for this query period.',
          'Generated At': new Date().toLocaleString(),
        },
      ];
    }

    // Export formatting
    const fileName = `SMARTATTEND_${reportType.replace(/\s+/g, '_')}_${Date.now()}`;

    if (format === 'PDF') {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('SMARTATTEND Official Attendance Report', 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Report Type: ${reportType} | Generated: ${new Date().toLocaleString()}`, 14, 28);
      doc.text(`Institutional Biometric & Dynamic QR Verified Attendance Record`, 14, 34);

      const headers = Object.keys(exportData[0] || {});
      const body = exportData.map((row) => headers.map((k) => row[k]));

      autoTable(doc, {
        startY: 40,
        head: [headers],
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 9 },
      });

      doc.save(`${fileName}.pdf`);
    } else if (format === 'EXCEL') {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } else if (format === 'CSV') {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.csv`;
      a.click();
    }

    setIsExporting(false);
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-400" />
            <span className="font-bold text-sm tracking-wide">EXPORT ATTENDANCE REPORT</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Report Type */}
          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1.5">
              Report Category
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full p-2.5 bg-gray-50 border border-surface-border rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="Daily Attendance">Daily Attendance Master Log</option>
              <option value="Monthly Attendance">Monthly Summary</option>
              <option value="Student Attendance">Individual Student Performance</option>
              <option value="Subject Attendance">Subject-wise Session Breakdown</option>
              <option value="Low Attendance">Low Attendance Warning Registry (&lt;75%)</option>
            </select>
          </div>

          {/* Date & Status Filters */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1.5">
                Date Reference
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-surface-border rounded-xl text-xs font-medium"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1.5">
                Attendance Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-surface-border rounded-xl text-xs font-medium"
              >
                <option value="ALL">All Records</option>
                <option value="PRESENT">Present Only</option>
                <option value="ABSENT">Absent Only</option>
                <option value="LATE">Late Only</option>
              </select>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block font-bold text-gray-700 uppercase tracking-wider text-[11px] mb-1.5">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['PDF', 'EXCEL', 'CSV'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    format === fmt
                      ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                      : 'border-surface-border bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {fmt === 'PDF' && <FileText className="w-5 h-5 text-rose-500" />}
                  {fmt === 'EXCEL' && <FileSpreadsheet className="w-5 h-5 text-emerald-600" />}
                  {fmt === 'CSV' && <Download className="w-5 h-5 text-brand-600" />}
                  <span>{fmt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Download feedback */}
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Report exported successfully from Firestore!</span>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={isExporting}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating Report...' : `Export ${format} Report`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
