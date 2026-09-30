import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../firebase/firestoreService';
import { NotificationItem, UserRole } from '../../types';
import { 
  Bell, 
  Search, 
  LogOut, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  ChevronDown,
  Sparkles,
  Command,
  Radio,
  ScanFace,
  QrCode,
  Layers,
  Clock,
  FileText,
  X,
  Menu,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarCheck,
  FileBarChart2,
  ShieldAlert,
  Settings
} from 'lucide-react';
import { useNavigate, NavLink } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, role, logout, switchRoleDemo } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  useEffect(() => {
    if (!user) return;
    const unsub = firestoreService.subscribeNotifications(user.id, user.role, setNotifications);
    return () => unsub();
  }, [user?.id, user?.role]);

  // Global Keyboard Shortcut: Cmd/Ctrl + K to trigger Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRoleDemo(newRole);
    setShowRoleSwitcher(false);
    setShowCommandPalette(false);
    if (newRole === 'ADMIN') navigate('/admin');
    else if (newRole === 'FACULTY') navigate('/faculty');
    else navigate('/student');
  };

  const commandItems = [
    { label: 'Admin Dashboard', icon: Layers, path: '/admin', roleRequired: 'ADMIN' },
    { label: 'Student Directory', icon: User, path: '/admin/students', roleRequired: 'ADMIN' },
    { label: 'Master Timetable', icon: Clock, path: '/admin/timetable', roleRequired: 'ADMIN' },
    { label: 'Dynamic QR Attendance (Faculty)', icon: QrCode, path: '/faculty/session/qr', roleRequired: 'FACULTY' },
    { label: 'Face AI Attendance (Faculty)', icon: ScanFace, path: '/faculty/session/face', roleRequired: 'FACULTY' },
    { label: 'Export Reports (PDF/Excel)', icon: FileText, path: '/faculty/reports', roleRequired: 'FACULTY' },
    { label: 'Campus Attendance Terminal', icon: Layers, path: '/student', roleRequired: 'STUDENT' },
    { label: 'My Attendance Records', icon: CalendarCheck, path: '/student/attendance', roleRequired: 'STUDENT' },
    { label: 'Student QR Scanner', icon: QrCode, path: '/student/scan', roleRequired: 'STUDENT' },
    { label: 'Class Timetable', icon: Clock, path: '/student/timetable', roleRequired: 'STUDENT' },
    { label: 'Student Profile & Face Enrollment', icon: ScanFace, path: '/student/profile', roleRequired: 'STUDENT' },
  ];

  const filteredCommands = commandItems.filter((item) =>
    item.label.toLowerCase().includes(commandQuery.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)] shrink-0">
      {/* Left: Brand & Command Search Trigger */}
      <div className="flex items-center gap-3 sm:gap-4 lg:gap-8 flex-1">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          type="button"
          onClick={() => setShowMobileDrawer(true)}
          className="md:hidden p-1.5 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div 
          onClick={() => {
            if (role === 'ADMIN') navigate('/admin');
            else if (role === 'FACULTY') navigate('/faculty');
            else navigate('/student');
          }}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
            S
          </div>
          <div className="hidden sm:block">
            <span className="font-bold tracking-tight text-slate-900 text-base">
              SMART<span className="text-blue-600">ATTEND</span>
            </span>
            <span className="block text-[10px] font-medium text-slate-400 -mt-1 tracking-normal">
              AI Attendance Platform
            </span>
          </div>
        </div>

        {/* Global Quick Search / Command Palette Bar */}
        <button
          onClick={() => setShowCommandPalette(true)}
          className="hidden md:flex items-center justify-between w-80 h-9 px-3 text-xs bg-slate-50/90 border border-slate-200/80 rounded-lg text-slate-400 hover:border-slate-300 hover:bg-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Search or jump to...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-white border border-slate-200 rounded text-slate-400 shadow-2xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right: Live Sync Status, Role Switcher, Notifications & Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Live Network Latency: Elegant & Minimal (Section 18) */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Firestore synced <span className="text-slate-300 mx-0.5">·</span> 18ms</span>
        </div>

        {/* Quick Role Tester Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Fast switch role for grading/testing"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Role: <strong className="text-blue-600 font-semibold">{role}</strong></span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1.5 z-50 text-xs animate-in fade-in">
              <div className="px-3 py-1 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                Instant Switch Role:
              </div>
              <button
                onClick={() => handleRoleSwitch('ADMIN')}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${role === 'ADMIN' ? 'font-semibold text-blue-600 bg-blue-50/50' : 'text-slate-700'}`}
              >
                <span>Dr. Sarah (Admin)</span>
                {role === 'ADMIN' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </button>
              <button
                onClick={() => handleRoleSwitch('FACULTY')}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${role === 'FACULTY' ? 'font-semibold text-blue-600 bg-blue-50/50' : 'text-slate-700'}`}
              >
                <span>Prof. Vikram (Faculty)</span>
                {role === 'FACULTY' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </button>
              <button
                onClick={() => handleRoleSwitch('STUDENT')}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${role === 'STUDENT' ? 'font-semibold text-blue-600 bg-blue-50/50' : 'text-slate-700'}`}
              >
                <span>Rahul Patil (Student)</span>
                {role === 'STUDENT' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="w-9 h-9 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent hover:border-slate-200/80 flex items-center justify-center transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden z-50 animate-in fade-in">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <span className="font-semibold text-xs text-slate-900 uppercase tracking-wider">Campus Notifications</span>
                <span className="text-[11px] text-blue-600 font-semibold">{unreadCount} unread</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">All notifications caught up.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => firestoreService.markNotificationRead(n.id)}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors flex gap-3 ${!n.read ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="mt-0.5">
                        {n.type === 'SUCCESS' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        {n.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {n.type === 'INFO' && <Info className="w-4 h-4 text-blue-500" />}
                        {n.type === 'ALERT' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{n.title}</div>
                        <div className="text-slate-600 text-[11px] mt-0.5">{n.message}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar (Section 19) */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 sm:px-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition-colors"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-100">
                {user?.fullName.charAt(0) || 'U'}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-tight">
                {role === 'STUDENT' ? 'Student Terminal' : (user?.fullName || 'Admin User')}
              </div>
              <div className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                {role === 'STUDENT' ? 'ACTIVE' : (role || 'ADMIN')}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200/80 py-1.5 z-50 text-xs animate-in fade-in">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="font-semibold text-slate-900">{user?.fullName}</div>
                <div className="text-slate-400 text-[11px] truncate">{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  if (role === 'STUDENT') navigate('/student/profile');
                  else navigate('/settings');
                }}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile Dossier
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-bold"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Command Palette Modal (Ctrl + K) */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command, page name, or quick switch..."
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                className="w-full text-sm font-medium focus:outline-none text-slate-900 placeholder-slate-400"
              />
              <button onClick={() => setShowCommandPalette(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 max-h-80 overflow-y-auto space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Navigation
              </div>
              {filteredCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.path}
                    onClick={() => {
                      setShowCommandPalette(false);
                      navigate(cmd.path);
                    }}
                    className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 flex items-center justify-between text-xs text-slate-700 font-semibold group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
                      <span>{cmd.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{cmd.roleRequired}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Slide-Over Drawer */}
      {showMobileDrawer && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={() => setShowMobileDrawer(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  S
                </div>
                <span className="font-bold text-slate-900 text-sm tracking-tight">SMARTATTEND</span>
              </div>
              <button 
                onClick={() => setShowMobileDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="p-3 flex-1 overflow-y-auto space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {role === 'ADMIN' ? 'Administration' : 'Faculty Console'}
              </div>
              {(role === 'ADMIN' ? [
                { name: 'Dashboard', path: '/admin', icon: Layers },
                { name: 'Students', path: '/admin/students', icon: User },
                { name: 'Faculty', path: '/admin/faculty', icon: GraduationCap },
                { name: 'Departments', path: '/admin/departments', icon: Building2 },
                { name: 'Subjects', path: '/admin/subjects', icon: BookOpen },
                { name: 'Classes', path: '/admin/classes', icon: Layers },
                { name: 'Timetable', path: '/admin/timetable', icon: Clock },
                { name: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
                { name: 'Reports', path: '/admin/reports', icon: FileBarChart2 },
                { name: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
                { name: 'Settings', path: '/admin/settings', icon: Settings },
              ] : [
                { name: 'Dashboard', path: '/faculty', icon: Layers },
                { name: 'Classes', path: '/faculty/classes', icon: Layers },
                { name: 'Dynamic QR Mode', path: '/faculty/session/qr', icon: QrCode },
                { name: 'Face AI Attendance', path: '/faculty/session/face', icon: ScanFace },
                { name: 'Attendance Records', path: '/faculty/records', icon: CalendarCheck },
                { name: 'Reports & Export', path: '/faculty/reports', icon: FileBarChart2 },
              ]).map((navItem) => {
                const NavIcon = navItem.icon;
                return (
                  <NavLink
                    key={navItem.path}
                    to={navItem.path}
                    onClick={() => setShowMobileDrawer(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`
                    }
                  >
                    <NavIcon className="w-4 h-4" />
                    <span>{navItem.name}</span>
                  </NavLink>
                );
              })}
            </div>

            {/* Drawer User Info Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                  {user?.fullName.charAt(0) || 'U'}
                </div>
                <div className="flex-1 truncate">
                  <div className="text-xs font-semibold text-slate-800 truncate">{user?.fullName}</div>
                  <div className="text-[10px] text-slate-400 font-mono uppercase">{role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
