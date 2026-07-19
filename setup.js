const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ==========================================
// KONFIGURASI PROYEK
// ==========================================
const PROJECT_NAME = 'pos-professional';
const ROOT_DIR = path.join(process.cwd(), PROJECT_NAME);

// Helper untuk membuat file & folder
function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content.trim() + '\n');
  console.log(`✅ Created: ${path.relative(ROOT_DIR, filePath)}`);
}

function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

console.log('\n🚀 POS PROFESSIONAL - SETUP TAHAP 1\n');
console.log('=====================================\n');

// 1. BUAT STRUKTUR FOLDER
console.log('📁 Membuat struktur folder...');
const folders = [
  'app/(auth)/login',
  'app/(dashboard)/dashboard',
  'app/api/auth',
  'components/layout',
  'components/ui',
  'hooks',
  'lib',
  'store',
  'types',
  'utils',
  'prisma',
  'public/images',
  'styles',
];
folders.forEach(f => createDir(path.join(ROOT_DIR, f)));

// ==========================================
// 2. FILE KONFIGURASI
// ==========================================
console.log('\n⚙️  Menulis file konfigurasi...');

createFile(path.join(ROOT_DIR, 'package.json'), `
{
  "name": "pos-professional",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.45.0",
    "@prisma/client": "^5.17.0",
    "zustand": "^4.5.4",
    "framer-motion": "^11.3.19",
    "lucide-react": "^0.416.0",
    "recharts": "^2.12.7",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.4.0",
    "date-fns": "^3.6.0",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "typescript": "^5.5.4",
    "@types/node": "^20.14.12",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.7",
    "prisma": "^5.17.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.5"
  }
}
`);

createFile(path.join(ROOT_DIR, 'tsconfig.json'), `
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`);

createFile(path.join(ROOT_DIR, 'next.config.mjs'), `
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
};
export default nextConfig;
`);

createFile(path.join(ROOT_DIR, 'tailwind.config.ts'), `
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        secondary: '#6366F1',
        accent: '#06B6D4',
        success: '#10B981',
        danger: '#F43F5E',
        glass: {
          light: 'rgba(255,255,255,0.7)',
          dark: 'rgba(15,23,42,0.7)',
        }
      },
      backdropBlur: { glass: '25px' },
      boxShadow: {
        glass: '0 8px 32px rgba(124,58,237,0.12)',
        glow: '0 0 20px rgba(124,58,237,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      }
    },
  },
  plugins: [],
};
export default config;
`);

createFile(path.join(ROOT_DIR, 'postcss.config.mjs'), `
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
export default config;
`);

createFile(path.join(ROOT_DIR, '.env.local'), `
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (Supabase PostgreSQL Connection String)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# App Configuration
NEXT_PUBLIC_APP_NAME=POS Professional
NEXT_PUBLIC_CURRENCY=IDR
JWT_SECRET=your-super-secret-jwt-key-change-this
`);

createFile(path.join(ROOT_DIR, '.gitignore'), `
node_modules/
.next/
out/
.env*.local
*.tsbuildinfo
next-env.d.ts
prisma/migrations/
`);

// ==========================================
// 3. PRISMA SCHEMA
// ==========================================
console.log('\n🗄️  Menulis Prisma Schema...');

createFile(path.join(ROOT_DIR, 'prisma/schema.prisma'), `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}

enum Role {
  OWNER
  ADMIN
  KASIR
  GUDANG
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  name          String
  role          Role     @default(KASIR)
  avatar        String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  transactions  Transaction[]
  auditLogs     AuditLog[]
}

model Kategori {
  id        String    @id @default(uuid())
  nama      String    @unique
  deskripsi String?
  createdAt DateTime  @default(now())
  produk    Produk[]
}

model Brand {
  id        String    @id @default(uuid())
  nama      String    @unique
  createdAt DateTime  @default(now())
  produk    Produk[]
}

model Supplier {
  id        String    @id @default(uuid())
  nama      String
  kontak    String?
  alamat    String?
  createdAt DateTime  @default(now())
  produk    Produk[]
}

model Produk {
  id           String    @id @default(uuid())
  barcode      String    @unique
  sku          String    @unique
  nama         String
  kategoriId   String
  brandId      String?
  supplierId   String?
  hargaModal   Float     @default(0)
  hargaJual    Float     @default(0)
  diskon       Float     @default(0)
  pajak        Float     @default(0)
  satuan       String    @default("pcs")
  berat        Float     @default(0)
  stok         Int       @default(0)
  minStok      Int       @default(10)
  foto         String?
  statusAktif  Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  kategori     Kategori  @relation(fields: [kategoriId], references: [id])
  brand        Brand?    @relation(fields: [brandId], references: [id])
  supplier     Supplier? @relation(fields: [supplierId], references: [id])
  detailTransaksi DetailTransaksi[]
  stokMovements StokMovement[]
}

model Pelanggan {
  id          String   @id @default(uuid())
  nama        String
  telepon     String?  @unique
  email       String?
  isMember    Boolean  @default(false)
  poin        Int      @default(0)
  level       String   @default("Regular")
  createdAt   DateTime @default(now())
  transactions Transaction[]
}

model Transaction {
  id          String    @id @default(uuid())
  nomor       String    @unique
  userId      String
  pelangganId String?
  subtotal    Float     @default(0)
  diskon      Float     @default(0)
  pajak       Float     @default(0)
  grandTotal  Float     @default(0)
  bayar       Float     @default(0)
  kembalian   Float     @default(0)
  metodeBayar String    @default("Cash")
  catatan     String?
  status      String    @default("completed")
  createdAt   DateTime  @default(now())
  user        User      @relation(fields: [userId], references: [id])
  pelanggan   Pelanggan? @relation(fields: [pelangganId], references: [id])
  details     DetailTransaksi[]
  payments    Pembayaran[]
}

model DetailTransaksi {
  id            String      @id @default(uuid())
  transaksiId   String
  produkId      String
  qty           Int         @default(1)
  harga         Float       @default(0)
  diskon        Float       @default(0)
  subtotal      Float       @default(0)
  catatan       String?
  transaksi     Transaction @relation(fields: [transaksiId], references: [id], onDelete: Cascade)
  produk        Produk      @relation(fields: [produkId], references: [id])
}

model Pembayaran {
  id          String      @id @default(uuid())
  transaksiId String
  metode      String
  jumlah      Float
  referensi   String?
  createdAt   DateTime    @default(now())
  transaksi   Transaction @relation(fields: [transaksiId], references: [id], onDelete: Cascade)
}

model StokMovement {
  id        String   @id @default(uuid())
  produkId  String
  tipe      String   // IN, OUT, ADJUSTMENT, TRANSFER
  jumlah    Int
  referensi String?
  catatan   String?
  createdAt DateTime @default(now())
  produk    Produk   @relation(fields: [produkId], references: [id])
}

model Pengaturan {
  id           String @id @default(uuid())
  key          String @unique
  value        String
  description  String?
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  aksi      String
  entitas   String
  entitasId String?
  detail    String?
  ip        String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
`);

// ==========================================
// 4. LIBRARIES & UTILS
// ==========================================
console.log('\n📚 Menulis libraries & utils...');

createFile(path.join(ROOT_DIR, 'lib/supabase.ts'), `
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
`);

createFile(path.join(ROOT_DIR, 'lib/prisma.ts'), `
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
`);

createFile(path.join(ROOT_DIR, 'lib/utils.ts'), `
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatTanggal(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function generateNomorTransaksi(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return \`TRX-\${y}\${m}\${d}-\${h}\${min}\${s}\${rand}\`;
}
`);

// ==========================================
// 5. TYPES
// ==========================================
createFile(path.join(ROOT_DIR, 'types/index.ts'), `
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  color: 'purple' | 'indigo' | 'cyan' | 'emerald' | 'rose';
}

export interface CartItem {
  id: string;
  barcode: string;
  nama: string;
  harga: number;
  qty: number;
  diskon: number;
  catatan?: string;
}

export interface DashboardStats {
  totalPenjualanHariIni: number;
  totalPenjualanBulanIni: number;
  omzet: number;
  profit: number;
  jumlahProduk: number;
  jumlahMember: number;
  jumlahTransaksi: number;
}
`);

// ==========================================
// 6. ZUSTAND STORES
// ==========================================
console.log('\n🐻 Menulis Zustand stores...');

createFile(path.join(ROOT_DIR, 'store/auth-store.ts'), `
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'pos-auth-storage' }
  )
);
`);

createFile(path.join(ROOT_DIR, 'store/theme-store.ts'), `
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  sidebarOpen: boolean;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      sidebarOpen: true,
      toggleTheme: () => set((s) => ({ isDark: !s.isDark })),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: 'pos-theme-storage' }
  )
);
`);

createFile(path.join(ROOT_DIR, 'store/cart-store.ts'), `
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  heldTransactions: { id: string; items: CartItem[]; timestamp: number }[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  holdTransaction: () => void;
  recallTransaction: (id: string) => void;
  deleteHeldTransaction: (id: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      heldTransactions: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, qty: i.qty + item.qty } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQty: (id, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, qty: Math.max(1, qty) } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      holdTransaction: () =>
        set((state) => ({
          heldTransactions: [
            ...state.heldTransactions,
            { id: crypto.randomUUID(), items: state.items, timestamp: Date.now() },
          ],
          items: [],
        })),
      recallTransaction: (id) =>
        set((state) => {
          const held = state.heldTransactions.find((t) => t.id === id);
          if (!held) return state;
          return {
            items: held.items,
            heldTransactions: state.heldTransactions.filter((t) => t.id !== id),
          };
        }),
      deleteHeldTransaction: (id) =>
        set((state) => ({
          heldTransactions: state.heldTransactions.filter((t) => t.id !== id),
        })),
    }),
    { name: 'pos-cart-storage' }
  )
);
`);

// ==========================================
// 7. GLOBAL CSS (GLASSMORPHISM)
// ==========================================
console.log('\n🎨 Menulis Global CSS...');

createFile(path.join(ROOT_DIR, 'app/globals.css'), `
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-gradient: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #e0f2fe 100%);
    --glass-bg: rgba(255, 255, 255, 0.65);
    --glass-border: rgba(255, 255, 255, 0.3);
    --text-primary: #1e1b4b;
    --text-secondary: #6b7280;
  }

  .dark {
    --bg-gradient: linear-gradient(135deg, #0f0a2e 0%, #1a1145 50%, #0c1929 100%);
    --glass-bg: rgba(15, 23, 42, 0.65);
    --glass-border: rgba(255, 255, 255, 0.08);
    --text-primary: #f1f5f9;
    --text-secondary: #94a3b8;
  }

  body {
    background: var(--bg-gradient);
    color: var(--text-primary);
    min-height: 100vh;
    font-family: 'Inter', system-ui, sans-serif;
  }
}

@layer components {
  .glass-card {
    @apply rounded-2xl border shadow-glass transition-all duration-300;
    background: var(--glass-bg);
    backdrop-filter: blur(25px);
    -webkit-backdrop-filter: blur(25px);
    border-color: var(--glass-border);
  }

  .glass-card:hover {
    @apply shadow-glow;
    transform: translateY(-2px);
  }

  .btn-primary {
    @apply px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-300;
    background: linear-gradient(135deg, #7C3AED, #6366F1);
    box-shadow: 0 4px 15px rgba(124, 58, 237, 0.3);
  }

  .btn-primary:hover {
    box-shadow: 0 0 25px rgba(124, 58, 237, 0.5);
    transform: translateY(-1px);
  }

  .input-glass {
    @apply w-full px-4 py-3 rounded-xl border outline-none transition-all duration-300;
    background: var(--glass-bg);
    backdrop-filter: blur(15px);
    border-color: var(--glass-border);
    color: var(--text-primary);
  }

  .input-glass:focus {
    @apply ring-2 ring-primary/50;
    border-color: #7C3AED;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { @apply rounded-full bg-primary/30; }
  ::-webkit-scrollbar-thumb:hover { @apply bg-primary/50; }
}
`);

// ==========================================
// 8. LAYOUT & COMPONENTS
// ==========================================
console.log('\n🧩 Menulis komponen layout...');

createFile(path.join(ROOT_DIR, 'app/layout.tsx'), `
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'POS Professional',
  description: 'Aplikasi Point of Sale Profesional dengan Glassmorphism UI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
`);

createFile(path.join(ROOT_DIR, 'app/page.tsx'), `
import { redirect } from 'next/navigation';
export default function Home() {
  redirect('/dashboard');
}
`);

createFile(path.join(ROOT_DIR, 'components/layout/Sidebar.tsx'), `
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ShoppingCart, Package, Users, BarChart3,
  Settings, LogOut, Warehouse, ChevronLeft
} from 'lucide-react';
import { useThemeStore } from '@/store/theme-store';
import { cn } from '@/lib/utils';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'POS Kasir', icon: ShoppingCart, href: '/pos' },
  { label: 'Produk', icon: Package, href: '/master/produk' },
  { label: 'Pelanggan', icon: Users, href: '/master/pelanggan' },
  { label: 'Stok', icon: Warehouse, href: '/stok' },
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
`);

createFile(path.join(ROOT_DIR, 'components/layout/Navbar.tsx'), `
'use client';
import { Bell, Moon, Sun, Search } from 'lucide-react';
import { useThemeStore } from '@/store/theme-store';
import { useAuthStore } from '@/store/auth-store';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { isDark, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 h-16 glass-card !rounded-none border-x-0 border-t-0 px-6 flex items-center justify-between">
      {/* Search */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
        <input
          type="text"
          placeholder="Cari produk, transaksi, pelanggan..."
          className="input-glass !py-2 pl-10 text-sm"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
        </motion.button>

        <div className="flex items-center gap-3 pl-3 border-l border-white/10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold">{user?.name || 'User'}</p>
            <p className="text-xs text-[var(--text-secondary)]">{user?.role || 'Staff'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
`);

createFile(path.join(ROOT_DIR, 'app/(dashboard)/layout.tsx'), `
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
`);

// ==========================================
// 9. LOGIN PAGE
// ==========================================
createFile(path.join(ROOT_DIR, 'app/(auth)/login/page.tsx'), `
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Store } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Demo login - ganti dengan Supabase Auth di tahap selanjutnya
    await new Promise((r) => setTimeout(r, 800));
    login({ id: '1', email, name: 'Admin Toko', role: 'OWNER' });
    router.push('/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-8 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-glow">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            POS Professional
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Masuk ke sistem kasir Anda</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass pl-10"
                placeholder="admin@toko.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glass pl-10 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-primary transition-colors"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-white/20" />
              <span className="text-[var(--text-secondary)]">Ingat saya</span>
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </motion.button>
        </form>

        <p className="text-center text-xs text-[var(--text-secondary)] mt-6">
          Demo: gunakan email & password apapun
        </p>
      </motion.div>
    </div>
  );
}
`);

// ==========================================
// 10. DASHBOARD PAGE
// ==========================================
createFile(path.join(ROOT_DIR, 'app/(dashboard)/dashboard/page.tsx'), `
'use client';
import { motion } from 'framer-motion';
import {
  DollarSign, ShoppingBag, Users, Package, TrendingUp,
  AlertTriangle, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatRupiah } from '@/lib/utils';

const stats = [
  { title: 'Penjualan Hari Ini', value: 4520000, icon: DollarSign, trend: 12.5, color: 'purple' },
  { title: 'Transaksi', value: 48, icon: ShoppingBag, trend: 8.2, color: 'indigo' },
  { title: 'Total Member', value: 1250, icon: Users, trend: 3.1, color: 'cyan' },
  { title: 'Total Produk', value: 342, icon: Package, trend: -2.4, color: 'emerald' },
];

const salesData = [
  { hari: 'Sen', penjualan: 3200000, profit: 800000 },
  { hari: 'Sel', penjualan: 4100000, profit: 1025000 },
  { hari: 'Rab', penjualan: 3800000, profit: 950000 },
  { hari: 'Kam', penjualan: 5200000, profit: 1300000 },
  { hari: 'Jum', penjualan: 4800000, profit: 1200000 },
  { hari: 'Sab', penjualan: 6100000, profit: 1525000 },
  { hari: 'Min', penjualan: 5500000, profit: 1375000 },
];

const topProducts = [
  { nama: 'Indomie Goreng', terjual: 245, revenue: 857500 },
  { nama: 'Aqua 600ml', terjual: 189, revenue: 567000 },
  { nama: 'Kopi Kapal Api', terjual: 156, revenue: 468000 },
  { nama: 'Telur 1kg', terjual: 98, revenue: 294000 },
  { nama: 'Minyak Goreng 1L', terjual: 87, revenue: 174000 },
];

const lowStock = [
  { nama: 'Gula Pasir 1kg', stok: 3, min: 10 },
  { nama: 'Sabun Cuci Piring', stok: 5, min: 15 },
  { nama: 'Tissue Roll', stok: 2, min: 20 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-[var(--text-secondary)] text-sm">Ringkasan performa toko Anda</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <motion.div key={stat.title} variants={itemVariants} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={\`p-2.5 rounded-xl bg-\${stat.color === 'purple' ? 'primary' : stat.color === 'indigo' ? 'secondary' : stat.color === 'cyan' ? 'accent' : 'success'}/15\`}>
                <stat.icon className={\`w-5 h-5 text-\${stat.color === 'purple' ? 'primary' : stat.color === 'indigo' ? 'secondary' : stat.color === 'cyan' ? 'accent' : 'success'}\`} />
              </div>
              <div className={\`flex items-center gap-1 text-xs font-medium \${stat.trend >= 0 ? 'text-success' : 'text-danger'}\`}>
                {stat.trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(stat.trend)}%
              </div>
            </div>
            <p className="text-[var(--text-secondary)] text-sm">{stat.title}</p>
            <p className="text-2xl font-bold mt-1">
              {typeof stat.value === 'number' && stat.value > 10000
                ? formatRupiah(stat.value)
                : stat.value.toLocaleString('id-ID')}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Grafik Penjualan Mingguan
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorPenjualan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
              <XAxis dataKey="hari" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => \`\${v / 1000000}jt\`} />
              <Tooltip formatter={(v: number) => formatRupiah(v)} />
              <Area type="monotone" dataKey="penjualan" stroke="#7C3AED" strokeWidth={2} fill="url(#colorPenjualan)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-accent" /> Produk Terlaris
          </h3>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.nama} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{p.nama}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{p.terjual} terjual</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">{formatRupiah(p.revenue)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock */}
        <motion.div variants={itemVariants} className="glass-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-danger" /> Stok Menipis
          </h3>
          <div className="space-y-2">
            {lowStock.map((item) => (
              <div key={item.nama} className="flex items-center justify-between p-3 rounded-xl bg-danger/5 border border-danger/10">
                <span className="text-sm font-medium">{item.nama}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-danger">{item.stok}</span>
                  <span className="text-xs text-[var(--text-secondary)]"> / min {item.min}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="glass-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-secondary" /> Aktivitas Terbaru
          </h3>
          <div className="space-y-3">
            {[
              { aksi: 'Transaksi TRX-20260719-001', waktu: '2 menit lalu', user: 'Kasir A' },
              { aksi: 'Stok masuk: Indomie Goreng +50', waktu: '15 menit lalu', user: 'Gudang B' },
              { aksi: 'Produk baru ditambahkan', waktu: '1 jam lalu', user: 'Admin' },
              { aksi: 'Transaksi TRX-20260719-000', waktu: '2 jam lalu', user: 'Kasir A' },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{log.aksi}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{log.user} • {log.waktu}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
`);

// ==========================================
// 11. README
// ==========================================
createFile(path.join(ROOT_DIR, 'README.md'), `
# POS Professional - Tahap 1

## Quick Start
\`\`\`bash
npm install
# Edit .env.local dengan credentials Supabase Anda
npx prisma generate
npx prisma db push
npm run dev
\`\`\`

## Tech Stack
- Next.js 14 (App Router)
- Supabase (PostgreSQL + Auth)
- Prisma ORM
- Zustand (State Management)
- Tailwind CSS + Glassmorphism
- Framer Motion
- Recharts
- Lucide Icons

## Struktur Folder
\`\`\`
pos-professional/
├── app/
│   ├── (auth)/login/
│   ├── (dashboard)/dashboard/
│   ├── api/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/layout/
├── lib/
├── store/
├── types/
├── prisma/
└── package.json
\`\`\`
`);

// ==========================================
// SELESAI - INSTRUKSI SELANJUTNYA
// ==========================================
console.log('\n=====================================');
console.log('✅ TAHAP 1 SELESAI!');
console.log('=====================================\n');
console.log('Langkah selanjutnya:\n');
console.log(`  cd ${PROJECT_NAME}`);
console.log('  npm install');
console.log('  # Edit .env.local dengan credentials Supabase');
console.log('  npx prisma generate');
console.log('  npx prisma db push');
console.log('  npm run dev\n');
console.log('🌐 Buka http://localhost:3000');
console.log('🔑 Login: email & password apapun (demo mode)\n');