import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { MobileNav } from '../components/common/MobileNav';

export const StudentLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col pb-20 md:pb-8">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
};
