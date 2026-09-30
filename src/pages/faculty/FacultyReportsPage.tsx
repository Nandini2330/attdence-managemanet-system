import React, { useState } from 'react';
import { ReportGeneratorModal } from '../../components/reports/ReportGeneratorModal';
import { FileText, Download, FileSpreadsheet, Sparkles } from 'lucide-react';

export const FacultyReportsPage: React.FC = () => {
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900">Reports & Exports</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Generate accredited attendance sheets, subject analytics, and compliance registries
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900">Official PDF Reports</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Formatted departmental PDF tables complete with verification timestamps and institutional headers.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            className="w-full mt-5 h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
          >
            Export PDF Format
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900">Excel / Spreadsheet</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Export structured workbook data directly to .xlsx for gradebook computation, formulas, and auditing.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            className="w-full mt-5 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
          >
            Export Excel Workbook
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-slate-900">Raw CSV Records</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Download raw CSV records for custom data science pipelines and institutional ERP integration.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            className="w-full mt-5 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
          >
            Export Raw CSV
          </button>
        </div>
      </div>

      <ReportGeneratorModal isOpen={showReportModal} onClose={() => setShowReportModal(false)} />
    </div>
  );
};
