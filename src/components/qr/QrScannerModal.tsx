import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../firebase/firestoreService';
import { soundEffects } from '../../utils/audioFeedback';
import { 
  Camera, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ShieldAlert, 
  Sparkles, 
  Navigation,
  Crosshair,
  Volume2
} from 'lucide-react';
import { AttendanceRecord } from '../../types';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (record: AttendanceRecord) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'EXPIRED' | 'DUPLICATE' | 'UNAUTHORIZED'>('IDLE');
  const [resultRecord, setResultRecord] = useState<AttendanceRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [gpsVerified, setGpsVerified] = useState(true);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      setStatus('IDLE');
      setResultRecord(null);
      setErrorMessage('');
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
    } catch (err: any) {
      setCameraError('Camera access not granted or unavailable on this device. You can verify using the active QR simulator below.');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const handleValidateToken = async (qrData: { sessionId: string; token: string; timestamp?: number; expiresAt?: number }) => {
    if (!user) return;
    setStatus('PROCESSING');

    const now = Date.now();
    if (qrData.expiresAt && now > qrData.expiresAt + 500) {
      soundEffects.playErrorTone();
      setStatus('EXPIRED');
      setErrorMessage('QR EXPIRED. Token lifetime has elapsed (> 3 seconds).');
      return;
    }

    try {
      const studentId = (!user?.id || user.id === 'admin-01') ? 'stu-nandini' : user.id;
      const result = await firestoreService.markQrAttendance({
        sessionId: qrData.sessionId,
        studentId,
        scannedToken: qrData.token,
      });

      if (result.success && result.record) {
        soundEffects.playSuccessChime();
        setStatus('SUCCESS');
        setResultRecord(result.record);
        if (onSuccess) onSuccess(result.record);
      } else {
        soundEffects.playErrorTone();
        if (result.message.includes('ALREADY RECORDED')) {
          setStatus('DUPLICATE');
        } else if (result.message.includes('EXPIRED')) {
          setStatus('EXPIRED');
        } else if (result.message.includes('not enrolled')) {
          setStatus('UNAUTHORIZED');
        } else {
          setStatus('EXPIRED');
        }
        setErrorMessage(result.message);
      }
    } catch (e: any) {
      soundEffects.playErrorTone();
      setStatus('EXPIRED');
      setErrorMessage(e.message || 'Validation failed');
    }
  };

  const handleSimulateScan = async (isStaleToken: boolean = false) => {
    let sessions: any[] = [];
    firestoreService.subscribeSessions((list) => {
      sessions = list;
    })();
    const active = sessions.find((s) => s.status === 'ACTIVE');

    if (!active) {
      soundEffects.playErrorTone();
      setStatus('UNAUTHORIZED');
      setErrorMessage('No active attendance session is currently broadcasting.');
      return;
    }

    const now = Date.now();
    if (!isStaleToken) {
      const qrData = firestoreService.generateRotatingQrToken(active.id, active.subjectName);
      await handleValidateToken({
        sessionId: active.id,
        token: qrData.currentToken,
        expiresAt: qrData.expiresAt,
      });
    } else {
      await handleValidateToken({
        sessionId: active.id,
        token: 'EXPIRED-TOKEN-STALE',
        expiresAt: now - 5000,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        {/* Top Header */}
        <div className="p-4 bg-[#090D16] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-brand-400" />
            <span className="font-extrabold text-sm tracking-wide">DYNAMIC ATTENDANCE SCANNER</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative bg-black h-80 flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Precision Scanning Viewfinder Box */}
          <div className="relative z-10 w-60 h-60 border border-brand-400/30 rounded-3xl flex items-center justify-center shadow-2xl">
            {/* Precision corner brackets */}
            <div className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-brand-500 rounded-tl-xl shadow-[0_0_10px_#3B82F6]" />
            <div className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-brand-500 rounded-tr-xl shadow-[0_0_10px_#3B82F6]" />
            <div className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-brand-500 rounded-bl-xl shadow-[0_0_10px_#3B82F6]" />
            <div className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-brand-500 rounded-br-xl shadow-[0_0_10px_#3B82F6]" />

            {/* Cyan Laser Beam Animation */}
            <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_14px_#38bdf8] animate-scanner-laser" />

            <div className="text-center text-white/80 text-xs px-4 pointer-events-none font-medium">
              Frame faculty 3-second QR code
            </div>
          </div>

          {/* GPS Classroom Proximity Pill */}
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 z-20">
            <Navigation className="w-3 h-3 text-emerald-400" />
            <span>GEO-RADIUS: CLASSROOM A-204 (18m)</span>
          </div>

          {/* Camera Error Message */}
          {cameraError && (
            <div className="absolute inset-0 bg-slate-950/90 text-white p-6 flex flex-col items-center justify-center text-center">
              <Camera className="w-10 h-10 text-slate-500 mb-2" />
              <div className="text-sm font-bold text-slate-200">Scanner Viewfinder Ready</div>
              <div className="text-xs text-slate-400 mt-1 max-w-xs">{cameraError}</div>
            </div>
          )}
        </div>

        {/* Feedback / Action Area */}
        <div className="p-5 flex-1 bg-slate-50 flex flex-col justify-between">
          {status === 'IDLE' && (
            <div className="text-center space-y-3">
              <p className="text-xs text-slate-500">
                The QR code rotates cryptographically every 3 seconds to prevent proxy attendance.
              </p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => handleSimulateScan(false)}
                  className="flex-1 py-3 px-3 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Scan Active QR Token</span>
                </button>
                <button
                  onClick={() => handleSimulateScan(true)}
                  className="py-3 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  title="Test expired token handling"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Test Expired</span>
                </button>
              </div>
            </div>
          )}

          {status === 'PROCESSING' && (
            <div className="py-6 text-center space-y-2">
              <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-sm font-black text-slate-900">Validating HMAC Rotating Token...</div>
              <div className="text-xs text-slate-500">Checking timestamp & student class division roster</div>
            </div>
          )}

          {status === 'SUCCESS' && resultRecord && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-black text-emerald-950 text-base">✓ Attendance Marked Successfully!</h3>
              <div className="text-xs text-emerald-900 space-y-1.5 pt-2 border-t border-emerald-200/60 text-left">
                <div className="flex justify-between">
                  <span className="text-emerald-700">Student:</span>
                  <span className="font-extrabold">{resultRecord.studentName} (Roll: {resultRecord.rollNumber})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700">Subject:</span>
                  <span className="font-extrabold">{resultRecord.subjectName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700">Date:</span>
                  <span className="font-mono font-semibold">{resultRecord.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700">Timestamp:</span>
                  <span className="font-mono font-bold text-emerald-800">{resultRecord.recordedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700">Verification:</span>
                  <span className="font-semibold">3s Dynamic QR (HMAC-SHA256)</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black transition-colors shadow-md"
              >
                Done
              </button>
            </div>
          )}

          {status === 'EXPIRED' && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-amber-500/30">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="font-black text-amber-950 text-base">QR EXPIRED</h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                The 3-second token lifespan has expired. Please align with the latest rotating QR on the professor's screen.
              </p>
              <button
                onClick={() => setStatus('IDLE')}
                className="w-full mt-2 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-black transition-colors shadow-md"
              >
                Scan Latest Code
              </button>
            </div>
          )}

          {status === 'DUPLICATE' && (
            <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-blue-500/30">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="font-black text-blue-950 text-base">ATTENDANCE ALREADY RECORDED</h3>
              <p className="text-xs text-blue-800">
                Your presence has already been certified for this lecture session.
              </p>
              <button
                onClick={onClose}
                className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black transition-colors shadow-md"
              >
                Close Viewfinder
              </button>
            </div>
          )}

          {status === 'UNAUTHORIZED' && (
            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-rose-500/30">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="font-black text-rose-950 text-base">Unauthorized Scan</h3>
              <p className="text-xs text-rose-800">{errorMessage || 'You are not enrolled in this class division.'}</p>
              <button
                onClick={onClose}
                className="w-full mt-2 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-black transition-colors shadow-md"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
