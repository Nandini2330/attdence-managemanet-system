import React, { useState, useEffect } from 'react';
import { firestoreService } from '../../firebase/firestoreService';
import { SystemSettings } from '../../types';
import { Settings, Save, RotateCcw, CheckCircle2, ShieldCheck, Timer, ScanFace } from 'lucide-react';

export const SystemSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    minAttendanceThreshold: 75,
    qrRotationIntervalSeconds: 3,
    faceConfidenceThreshold: 0.72,
    allowManualCorrection: true,
    academicTerm: 'Fall 2026 - Semester VI',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsub = firestoreService.subscribeSettings(setSettings);
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await firestoreService.updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo state to fresh default institutional records?')) {
      firestoreService.resetToDefaults();
      alert('System successfully restored to default state.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900">System Configuration</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Adjust global attendance thresholds, biometric matching parameters, and anti-proxy rotating tokens
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200/80 p-5 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] space-y-6 text-xs">
        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">Settings successfully saved and synced across all nodes.</span>
          </div>
        )}

        {/* 1. Threshold */}
        <div className="border-b border-slate-100 pb-5">
          <label className="block font-semibold text-slate-900 text-sm mb-1">
            Minimum Mandatory Attendance Threshold
          </label>
          <p className="text-slate-500 text-xs mb-3">
            Students whose overall attendance drops below this number are automatically flagged with Low Attendance Warnings.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={50}
              max={100}
              value={settings.minAttendanceThreshold}
              onChange={(e) => setSettings({ ...settings, minAttendanceThreshold: Number(e.target.value) })}
              className="w-24 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <span className="font-medium text-slate-600">% (Standard: 75%)</span>
          </div>
        </div>

        {/* 2. QR Rotation */}
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2 mb-1">
            <Timer className="w-4 h-4 text-blue-600" />
            <label className="font-semibold text-slate-900 text-sm">
              Dynamic QR Token Expiry / Rotation Interval
            </label>
          </div>
          <p className="text-slate-500 text-xs mb-3">
            Frequency at which the faculty presentation QR changes with a new cryptographic HMAC token.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={2}
              max={10}
              value={settings.qrRotationIntervalSeconds}
              onChange={(e) => setSettings({ ...settings, qrRotationIntervalSeconds: Number(e.target.value) })}
              className="w-24 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <span className="font-medium text-slate-600">Seconds (Current strict mode: 3s)</span>
          </div>
        </div>

        {/* 3. Face AI Confidence */}
        <div className="border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2 mb-1">
            <ScanFace className="w-4 h-4 text-indigo-600" />
            <label className="font-semibold text-slate-900 text-sm">
              Biometric Face AI Minimum Cosine Confidence
            </label>
          </div>
          <p className="text-slate-500 text-xs mb-3">
            Required similarity index between captured frame feature vector and student enrolled face profile.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step={0.01}
              min={0.5}
              max={0.99}
              value={settings.faceConfidenceThreshold}
              onChange={(e) => setSettings({ ...settings, faceConfidenceThreshold: Number(e.target.value) })}
              className="w-24 h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg font-bold text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <span className="font-medium text-slate-600">Confidence Score (Recommended: 0.72)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="h-10 px-4 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Database to Default Seed</span>
          </button>

          <button
            type="submit"
            className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
