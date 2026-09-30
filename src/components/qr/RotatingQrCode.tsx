import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useAttendanceSession } from '../../context/AttendanceSessionContext';
import { 
  ShieldCheck, 
  Timer, 
  Maximize2, 
  Minimize2, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  Radio,
  Lock
} from 'lucide-react';

interface RotatingQrCodeProps {
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const RotatingQrCode: React.FC<RotatingQrCodeProps> = ({
  fullscreen = false,
  onToggleFullscreen,
}) => {
  const { activeSession, qrSession, qrSecondsRemaining, sessionRecords } = useAttendanceSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!qrSession || !canvasRef.current) return;

    const qrPayload = JSON.stringify({
      app: 'SMARTATTEND',
      sessionId: qrSession.sessionId,
      token: qrSession.currentToken,
      timestamp: qrSession.generatedAt,
      expiresAt: qrSession.expiresAt,
    });

    QRCode.toCanvas(canvasRef.current, qrPayload, {
      width: fullscreen ? 360 : 270,
      margin: 2,
      color: {
        dark: '#090d16',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    }).catch((err) => {
      console.error('QR rendering error:', err);
    });
  }, [qrSession?.currentToken, fullscreen]);

  if (!activeSession) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-surface-border text-gray-400">
        No active attendance session selected.
      </div>
    );
  }

  const presentCount = sessionRecords.length;
  const totalCount = activeSession.totalStudents || 48;
  const attendancePercent = Math.round((presentCount / totalCount) * 100);

  // SVG Circular Radial Progress Math (radius = 32, circumference = 2 * PI * 32 = 201)
  const circleRadius = 30;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (qrSecondsRemaining / 3) * circleCircumference;

  return (
    <div
      className={`relative overflow-hidden transition-all duration-300 flex flex-col items-center justify-center ${
        fullscreen
          ? 'fixed inset-0 z-50 bg-gradient-to-b from-[#090D16] via-[#0F172A] to-[#020617] text-white p-6 sm:p-12'
          : 'bg-white rounded-3xl border border-slate-200/80 p-7 shadow-elevation'
      }`}
    >
      {/* Background ambient glow in presentation mode */}
      {fullscreen && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[600px] h-[600px] bg-brand-500 rounded-full blur-[140px]" />
        </div>
      )}

      {/* Top Meta Bar */}
      <div className="w-full flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 backdrop-blur-md">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            LIVE SECURE BROADCAST
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium text-slate-400 bg-slate-100 dark:bg-slate-800">
            <Lock className="w-3 h-3 text-slate-400" />
            HMAC-SHA256
          </span>
        </div>

        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className={`p-2 rounded-xl transition-all border ${
              fullscreen
                ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title={fullscreen ? 'Exit Theater Mode' : 'Auditorium Projector Mode'}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Title & Subject Info */}
      <div className="text-center mb-5 z-10">
        <h2 className={`font-black tracking-tight ${fullscreen ? 'text-4xl text-white' : 'text-2xl text-slate-900'}`}>
          SCAN TO MARK ATTENDANCE
        </h2>
        <p className={`text-xs sm:text-sm font-medium mt-1 ${fullscreen ? 'text-slate-300' : 'text-slate-500'}`}>
          {activeSession.subjectName} • <span className="font-semibold text-brand-600">{activeSession.className} ({activeSession.division})</span>
        </p>
      </div>

      {/* Center Dynamic QR Framing with Circular Radial Countdown Badge */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Glowing framing container */}
        <div className="p-5 bg-white rounded-3xl shadow-2xl border-4 border-slate-100 dark:border-slate-800 ring-1 ring-slate-900/5 relative group">
          <canvas ref={canvasRef} className="rounded-2xl" />

          {/* Center Brand Hologram Watermark inside QR */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-11 h-11 bg-white rounded-xl shadow-lg border-2 border-brand-600 flex items-center justify-center font-extrabold text-brand-600 text-sm">
              S
            </div>
          </div>
        </div>

        {/* Circular SVG Radial Countdown Timer Ring */}
        <div className="mt-6 flex items-center gap-3 bg-slate-900/90 text-white px-5 py-2 rounded-full border border-slate-700 shadow-xl backdrop-blur-md">
          {/* SVG Circular Ring */}
          <div className="relative w-9 h-9 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r={circleRadius}
                stroke="#334155"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="36"
                cy="36"
                r={circleRadius}
                stroke="#3B82F6"
                strokeWidth="6"
                fill="none"
                strokeDasharray={circleCircumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <span className="absolute font-mono text-xs font-extrabold text-brand-400">
              {qrSecondsRemaining}s
            </span>
          </div>

          <div className="text-left">
            <div className="text-xs font-bold tracking-wide">Dynamic Token Rotating</div>
            <div className="text-[10px] text-slate-400 font-mono">Changes every 3 seconds</div>
          </div>
        </div>
      </div>

      {/* Real-Time Live Presence KPIs */}
      <div className="grid grid-cols-3 gap-3.5 w-full max-w-md mt-6 z-10">
        <div className={`p-3.5 rounded-2xl text-center border backdrop-blur-sm ${
          fullscreen ? 'bg-slate-800/60 border-slate-700/80 text-white' : 'bg-slate-50 border-slate-200/80'
        }`}>
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Enrolled</div>
          <div className="text-2xl font-black mt-0.5">{totalCount}</div>
        </div>

        <div className={`p-3.5 rounded-2xl text-center border backdrop-blur-sm ${
          fullscreen ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">Present</div>
          <div className="text-2xl font-black mt-0.5">{presentCount}</div>
        </div>

        <div className={`p-3.5 rounded-2xl text-center border backdrop-blur-sm ${
          fullscreen ? 'bg-brand-950/40 border-brand-800/60 text-brand-400' : 'bg-brand-50 border-brand-200 text-brand-800'
        }`}>
          <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">Turnout</div>
          <div className="text-2xl font-black mt-0.5">{attendancePercent}%</div>
        </div>
      </div>

      {/* Security Guarantee Pill */}
      <div className="mt-5 flex items-center gap-2 text-xs text-slate-400 z-10">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Anti-Screenshot & Anti-Proxy Token Security Active</span>
      </div>
    </div>
  );
};
