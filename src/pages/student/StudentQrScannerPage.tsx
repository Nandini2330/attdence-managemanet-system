import React, { useState } from 'react';
import { QrScannerModal } from '../../components/qr/QrScannerModal';
import { StudentFaceScannerModal } from '../../components/face/StudentFaceScannerModal';
import { QrCode, ScanFace, ShieldCheck, ArrowLeft, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const StudentQrScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<'QR' | 'FACE'>('QR');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/student')}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Attendance Scanner</h1>
          <p className="text-xs text-slate-500 mt-0.5">Select verification method to record your lecture presence</p>
        </div>
      </div>

      {/* Verification Mode Toggle Tabs */}
      <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
        <button
          onClick={() => setActiveMode('QR')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeMode === 'QR'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Dynamic QR Scanner</span>
        </button>
        <button
          onClick={() => setActiveMode('FACE')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeMode === 'FACE'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ScanFace className="w-4 h-4" />
          <span>Biometric Face Scan</span>
        </button>
      </div>

      {/* Mode 1: QR Scanner */}
      {activeMode === 'QR' && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/80 text-center space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
            <QrCode className="w-8 h-8" />
          </div>

          <div className="max-w-xs mx-auto">
            <h3 className="font-bold text-base text-slate-900">Anti-Proxy Dynamic QR</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Faculty displays a rotating dynamic HMAC QR that refreshes every 3 seconds. Tap below to launch your camera.
            </p>
          </div>

          <button
            onClick={() => setShowQrModal(true)}
            className="w-full max-w-xs h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <Camera className="w-4 h-4" />
            <span>Launch QR Scanner</span>
          </button>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted short-lived HMAC token validation</span>
          </div>
        </div>
      )}

      {/* Mode 2: Face Scan */}
      {activeMode === 'FACE' && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200/80 text-center space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto border border-indigo-100">
            <ScanFace className="w-8 h-8" />
          </div>

          <div className="max-w-xs mx-auto">
            <h3 className="font-bold text-base text-slate-900">Biometric Face Recognition</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Verify presence directly using high-precision 128-D facial vector cosine similarity.
            </p>
          </div>

          <button
            onClick={() => setShowFaceModal(true)}
            className="w-full max-w-xs h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <ScanFace className="w-4 h-4" />
            <span>Launch Face Scan</span>
          </button>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted 128-D vector neural matching</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <QrScannerModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        onSuccess={() => {
          setTimeout(() => navigate('/student/attendance'), 1000);
        }}
      />

      <StudentFaceScannerModal
        isOpen={showFaceModal}
        onClose={() => setShowFaceModal(false)}
        onSuccess={() => {
          setTimeout(() => navigate('/student/attendance'), 1000);
        }}
      />
    </div>
  );
};
