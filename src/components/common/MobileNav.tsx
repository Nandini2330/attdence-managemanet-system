import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, QrCode, CalendarCheck, Clock, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2 flex items-center justify-around shadow-lg md:hidden">
      <NavLink
        to="/student"
        end
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-2 text-[10px] transition-colors ${
            isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`
        }
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/student/attendance"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-2 text-[10px] transition-colors ${
            isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`
        }
      >
        <CalendarCheck className="w-5 h-5 mb-0.5" />
        <span>Attendance</span>
      </NavLink>

      {/* Prominent Center Scan Button */}
      <NavLink
        to="/student/scan"
        className="relative -top-4 flex flex-col items-center group"
      >
        <div className="w-12 h-12 rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/30 border-4 border-white flex items-center justify-center transition-transform group-active:scale-95 group-hover:bg-blue-700">
          <QrCode className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-semibold text-blue-700 mt-0.5">Scanner</span>
      </NavLink>

      <NavLink
        to="/student/timetable"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-2 text-[10px] transition-colors ${
            isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`
        }
      >
        <Clock className="w-5 h-5 mb-0.5" />
        <span>Timetable</span>
      </NavLink>

      <NavLink
        to="/student/profile"
        className={({ isActive }) =>
          `flex flex-col items-center py-1 px-2 text-[10px] transition-colors ${
            isActive ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900 font-medium'
          }`
        }
      >
        <User className="w-5 h-5 mb-0.5" />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};
