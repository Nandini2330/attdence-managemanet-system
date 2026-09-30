import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  QrCode, 
  ScanFace, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';
import { UserRole } from '../../types';
import { StudentRegistrationWizardModal } from '../../components/student/StudentRegistrationWizardModal';

export const LoginPage: React.FC = () => {
  const { login, resetPassword, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@smartattend.edu');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const ok = await login(email, password);
      if (ok) {
        // Redirection based on role
        if (email.includes('admin')) navigate('/admin');
        else if (email.includes('faculty')) navigate('/faculty');
        else navigate('/student');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    }
  };

  const handleQuickLogin = async (roleEmail: string, targetPath: string, role: UserRole) => {
    setEmail(roleEmail);
    setPassword('password123');
    await login(roleEmail, 'password123', role);
    navigate(targetPath);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    await resetPassword(forgotEmail);
    setForgotSuccess(true);
    setTimeout(() => {
      setForgotSuccess(false);
      setShowForgotModal(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Icon & Heading */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-xl shadow-brand-500/30">
            S
          </div>
        </div>
        <h1 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
          SMART<span className="text-brand-600">ATTEND</span>
        </h1>
        <p className="mt-1 text-center text-xs text-gray-500 font-medium">
          AI-Powered Face Recognition & Dynamic QR Attendance Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-card border border-surface-border">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email / Student ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smartattend.edu"
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-surface-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-surface-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Campus'}</span>
            </button>

            {/* New Student Register Link */}
            <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">New student?</span>
              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 hover:underline"
              >
                <ScanFace className="w-3.5 h-3.5" />
                <span>Register with Face ID</span>
              </button>
            </div>
          </form>

          {/* 1-Click Test Access Roles */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider text-center mb-3">
              Fast Demo Role Login:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@smartattend.edu', '/admin', 'ADMIN')}
                className="p-2.5 rounded-xl border border-gray-200 hover:border-brand-500 hover:bg-brand-50/50 text-center transition-all group"
              >
                <div className="text-xs font-bold text-gray-800 group-hover:text-brand-700">Admin</div>
                <div className="text-[10px] text-gray-400">Dr. Sarah</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('faculty@smartattend.edu', '/faculty', 'FACULTY')}
                className="p-2.5 rounded-xl border border-gray-200 hover:border-brand-500 hover:bg-brand-50/50 text-center transition-all group"
              >
                <div className="text-xs font-bold text-gray-800 group-hover:text-brand-700">Faculty</div>
                <div className="text-[10px] text-gray-400">Prof. Vikram</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('student@smartattend.edu', '/student', 'STUDENT')}
                className="p-2.5 rounded-xl border border-gray-200 hover:border-brand-500 hover:bg-brand-50/50 text-center transition-all group"
              >
                <div className="text-xs font-bold text-gray-800 group-hover:text-brand-700">Student</div>
                <div className="text-[10px] text-gray-400">Rahul Patil</div>
              </button>
            </div>
          </div>
        </div>

        {/* Feature summary pills */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <ScanFace className="w-3.5 h-3.5 text-brand-600" />
            <span>Biometric AI Face</span>
          </div>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-1.5">
            <QrCode className="w-3.5 h-3.5 text-brand-600" />
            <span>3s Dynamic QR</span>
          </div>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Anti-Proxy</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-extrabold text-lg text-gray-900 mb-1">Reset Password</h3>
            <p className="text-xs text-gray-500 mb-4">
              Enter your institutional email to receive an official authentication reset link.
            </p>

            {forgotSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Password reset link dispatched!</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@smartattend.edu"
                  required
                  className="w-full p-2.5 bg-gray-50 border border-surface-border rounded-xl text-xs"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2-Step Student Registration Wizard: Page 1 (Info) & Page 2 (Face Save) */}
      <StudentRegistrationWizardModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
      />
    </div>
  );
};
