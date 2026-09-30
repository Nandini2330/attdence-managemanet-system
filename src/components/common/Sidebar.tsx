import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  CalendarCheck,
  FileBarChart2,
  Bell,
  ShieldAlert,
  Settings,
  QrCode,
  ScanFace,
  Layers,
  Clock,
} from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { role } = useAuth();

  const adminNavItems: SidebarItem[] = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Faculty', path: '/admin/faculty', icon: GraduationCap },
    { name: 'Departments', path: '/admin/departments', icon: Building2 },
    { name: 'Subjects', path: '/admin/subjects', icon: BookOpen },
    { name: 'Classes', path: '/admin/classes', icon: Layers },
    { name: 'Timetable', path: '/admin/timetable', icon: Clock },
    { name: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
    { name: 'Reports', path: '/admin/reports', icon: FileBarChart2 },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const facultyNavItems: SidebarItem[] = [
    { name: 'Dashboard', path: '/faculty', icon: LayoutDashboard },
    { name: 'Assigned Classes', path: '/faculty/classes', icon: Layers },
    { name: 'Dynamic QR Mode', path: '/faculty/session/qr', icon: QrCode, badge: 'Live' },
    { name: 'Face AI Attendance', path: '/faculty/session/face', icon: ScanFace, badge: 'AI' },
    { name: 'Attendance Records', path: '/faculty/records', icon: CalendarCheck },
    { name: 'Reports & Export', path: '/faculty/reports', icon: FileBarChart2 },
    { name: 'Timetable', path: '/faculty/timetable', icon: Clock },
  ];

  const items = role === 'ADMIN' ? adminNavItems : facultyNavItems;

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r border-slate-200/80 shrink-0 h-full select-none">
      <div className="p-3.5 flex-1 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {role === 'ADMIN' ? 'Administration' : 'Faculty Console'}
        </div>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin' || item.path === '/faculty'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors relative ${
                  isActive
                    ? 'bg-blue-50/80 text-blue-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  )}
                  {item.badge && !isActive && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase rounded bg-slate-100 text-slate-600">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Campus Status Footer */}
      <div className="p-3.5 border-t border-slate-200/80">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Campus Network Active</span>
          </div>
          <div className="text-slate-500 text-[10px] mt-0.5 font-normal">
            Biometric AI & Dynamic QR Ready
          </div>
        </div>
      </div>
    </aside>
  );
};
