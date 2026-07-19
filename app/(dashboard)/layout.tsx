'use client';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { useThemeStore } from '@/store/theme-store';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isDark, sidebarOpen } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarOpen ? 260 : 72 }}
      >
        <Navbar />
        <main className="p-6 animate-fade-in">{children}</main>
      </div>
    </div>
  );
}
