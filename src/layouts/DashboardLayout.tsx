import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col antialiased text-slate-800 overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-7 overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
