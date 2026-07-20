'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ShoppingCart, Package, Users, BarChart3,
  Settings, LogOut, Warehouse, ChevronLeft, Clock
} from 'lucide-react';
import { useThemeStore } from '@/store/theme-store';
import { cn } from '@/lib/utils';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'POS Kasir', icon: ShoppingCart, href: '/pos' },
  { label: 'Produk', icon: Package, href: '/master/produk' },
  { label: 'Kategori', icon: Package, href: '/master/kategori' },
  { label: 'Pelanggan', icon: Users, href: '/master/pelanggan' },
  { label: 'Stok', icon: Warehouse, href: '/stok' },
  { label: 'Riwayat', icon: Clock, href: '/history' },
  { label: 'Laporan', icon: BarChart3, href: '/laporan' },
  { label: 'Pengaturan', icon: Settings, href: '/pengaturan' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useThemeStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 z-40 h-screen glass-card !rounded-none border-r border-l-0 border-t-0 border-b-0"
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/10">
        {sidebarOpen && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            POS Pro
          </motion.span>
        )}
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <ChevronLeft className={cn('w-5 h-5 transition-transform', !sidebarOpen && 'rotate-180')} />
        </button>
      </div>

      {/* Menu */}
      <nav className="p-3 space-y-1 mt-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary font-semibold'
                    : 'hover:bg-white/10 text-[var(--text-secondary)]'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-primary')} />
                {sidebarOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 left-3 right-3">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-danger/10 text-danger transition-all w-full">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Keluar</span>}
        </button>
      </div>
    </motion.aside>
  );
}
