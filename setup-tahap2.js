const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();

function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content.trim() + '\n');
  console.log(`✅ Created: ${path.relative(ROOT_DIR, filePath)}`);
}

console.log('\n🚀 POS PROFESSIONAL - SETUP TAHAP 2 (MODUL KASIR)\n');
console.log('==================================================\n');

// ==========================================
// 1. UPDATE PACKAGE.JSON (Tambah Dependency)
// ==========================================
console.log('📦 Updating package.json...');
const pkgPath = path.join(ROOT_DIR, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.dependencies = {
    ...pkg.dependencies,
    "sonner": "^1.5.0",
    "@zxing/browser": "^0.1.5"
  };
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log('✅ Updated: package.json (added sonner, @zxing/browser)');
} else {
  console.error('❌ package.json tidak ditemukan! Pastikan jalankan di folder pos-professional');
  process.exit(1);
}

// ==========================================
// 2. UI COMPONENTS (Reusable)
// ==========================================
console.log('\n🧩 Membuat UI Components...');

createFile(path.join(ROOT_DIR, 'components/ui/Button.tsx'), `
'use client';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const variants = {
  primary: 'btn-primary text-white',
  secondary: 'bg-secondary/20 text-secondary hover:bg-secondary/30 border border-secondary/30',
  danger: 'bg-danger/20 text-danger hover:bg-danger/30 border border-danger/30',
  ghost: 'hover:bg-white/10 text-[var(--text-secondary)]',
  outline: 'border border-white/20 hover:bg-white/10',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    return (
      <motion.button
        whileHover={!disabled ? { scale: 1.02 } : undefined}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        ref={ref}
        disabled={disabled}
        className={cn(
          'rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
`);

createFile(path.join(ROOT_DIR, 'components/ui/Input.tsx'), `
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn('input-glass', className)} {...props} />
  )
);
Input.displayName = 'Input';
`);

createFile(path.join(ROOT_DIR, 'components/ui/Badge.tsx'), `
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning';
  className?: string;
}

const badgeVariants = {
  default: 'bg-primary/15 text-primary',
  success: 'bg-success/15 text-success',
  danger: 'bg-danger/15 text-danger',
  warning: 'bg-yellow-500/15 text-yellow-600',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('px-2.5 py-0.5 rounded-lg text-xs font-semibold', badgeVariants[variant], className)}>
      {children}
    </span>
  );
}
`);

createFile(path.join(ROOT_DIR, 'components/ui/Modal.tsx'), `
'use client';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className={cn('glass-card w-full max-w-lg p-6 pointer-events-auto', className)}>
              {title && (
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{title}</h3>
                  <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10"><X className="w-5 h-5" /></button>
                </div>
              )}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
`);

// ==========================================
// 3. TOAST NOTIFICATION (Sonner Wrapper)
// ==========================================
createFile(path.join(ROOT_DIR, 'components/ui/Toaster.tsx'), `
'use client';
import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '12px',
        },
      }}
    />
  );
}
`);

// Update layout.tsx root untuk include Toaster
const rootLayoutPath = path.join(ROOT_DIR, 'app/layout.tsx');
if (fs.existsSync(rootLayoutPath)) {
  let content = fs.readFileSync(rootLayoutPath, 'utf8');
  if (!content.includes('Toaster')) {
    content = content.replace(
      "import './globals.css';",
      "import './globals.css';\nimport { Toaster } from '@/components/ui/Toaster';"
    );
    content = content.replace(
      '<body className={inter.className}>{children}</body>',
      '<body className={inter.className}>{children}<Toaster /></body>'
    );
    fs.writeFileSync(rootLayoutPath, content);
    console.log('✅ Updated: app/layout.tsx (added Toaster)');
  }
}

// ==========================================
// 4. API ROUTE - SAVE TRANSACTION
// ==========================================
console.log('\n🔌 Membuat API Route...');

createFile(path.join(ROOT_DIR, 'app/api/transactions/route.ts'), `
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateNomorTransaksi } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, subtotal, diskon, pajak, grandTotal, bayar, kembalian, metodeBayar, catatan, userId, pelangganId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart kosong' }, { status: 400 });
    }

    const nomor = generateNomorTransaksi();

    const transaction = await prisma.transaction.create({
      data: {
        nomor,
        userId: userId || 'demo-user-id', // Ganti dengan auth user di tahap selanjutnya
        pelangganId: pelangganId || null,
        subtotal,
        diskon,
        pajak,
        grandTotal,
        bayar,
        kembalian,
        metodeBayar,
        catatan,
        details: {
          create: items.map((item: any) => ({
            produkId: item.id,
            qty: item.qty,
            harga: item.harga,
            diskon: item.diskon,
            subtotal: item.qty * item.harga - item.diskon,
            catatan: item.catatan,
          })),
        },
        payments: {
          create: {
            metode: metodeBayar,
            jumlah: bayar,
          },
        },
      },
      include: { details: true, payments: true },
    });

    // Kurangi stok
    for (const item of items) {
      await prisma.produk.update({
        where: { id: item.id },
        data: { stok: { decrement: item.qty } },
      });

      // Catat stok movement
      await prisma.stokMovement.create({
        data: {
          produkId: item.id,
          tipe: 'OUT',
          jumlah: item.qty,
          referensi: nomor,
          catatan: 'Penjualan POS',
        },
      });
    }

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    console.error('Transaction Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
`);

// ==========================================
// 5. HALAMAN POS KASIR
// ==========================================
console.log('\n🛒 Membuat Halaman POS Kasir...');

createFile(path.join(ROOT_DIR, 'app/(dashboard)/pos/page.tsx'), `
'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, CreditCard,
  Banknote, QrCode, Smartphone, Check, Loader2, Barcode
} from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { formatRupiah } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import type { CartItem } from '@/types';

// Mock data produk - ganti dengan fetch dari API/Supabase di production
const MOCK_PRODUCTS: CartItem[] = [
  { id: '1', barcode: '8996001600016', nama: 'Indomie Goreng', harga: 3500, qty: 1, diskon: 0 },
  { id: '2', barcode: '8996001600023', nama: 'Aqua 600ml', harga: 3000, qty: 1, diskon: 0 },
  { id: '3', barcode: '8996001600030', nama: 'Kopi Kapal Api Special', harga: 1500, qty: 1, diskon: 0 },
  { id: '4', barcode: '8996001600047', nama: 'Telur Ayam 1kg', harga: 30000, qty: 1, diskon: 0 },
  { id: '5', barcode: '8996001600054', nama: 'Minyak Goreng Bimoli 1L', harga: 22000, qty: 1, diskon: 0 },
  { id: '6', barcode: '8996001600061', nama: 'Gula Pasir Gulaku 1kg', harga: 16000, qty: 1, diskon: 0 },
  { id: '7', barcode: '8996001600078', nama: 'Sabun Lifebuoy', harga: 4500, qty: 1, diskon: 0 },
  { id: '8', barcode: '8996001600085', nama: 'Shampoo Sunsilk 180ml', harga: 28000, qty: 1, diskon: 0 },
  { id: '9', barcode: '8996001600092', nama: 'Pasta Gigi Pepsodent 120g', harga: 9500, qty: 1, diskon: 0 },
  { id: '10', barcode: '8996001600108', nama: 'Teh Botol Sosro 350ml', harga: 4000, qty: 1, diskon: 0 },
  { id: '11', barcode: '8996001600115', nama: 'Roti Sari Roti Tawar', harga: 15000, qty: 1, diskon: 0 },
  { id: '12', barcode: '8996001600122', nama: 'Susu Ultra Milk 250ml', harga: 7500, qty: 1, diskon: 0 },
];

const PAYMENT_METHODS = [
  { id: 'Cash', label: 'Tunai', icon: Banknote, color: 'emerald' },
  { id: 'QRIS', label: 'QRIS', icon: QrCode, color: 'primary' },
  { id: 'Transfer', label: 'Transfer Bank', icon: CreditCard, color: 'indigo' },
  { id: 'E-Wallet', label: 'E-Wallet', icon: Smartphone, color: 'cyan' },
];

export default function POSPage() {
  const { items, addItem, removeItem, updateQty, clearCart } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('Cash');
  const [bayarAmount, setBayarAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Focus search dengan F2
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter produk berdasarkan search/barcode
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return MOCK_PRODUCTS;
    const q = searchQuery.toLowerCase();
    return MOCK_PRODUCTS.filter(
      (p) => p.nama.toLowerCase().includes(q) || p.barcode.includes(q)
    );
  }, [searchQuery]);

  // Kalkulasi cart
  const subtotal = items.reduce((sum, i) => sum + i.harga * i.qty, 0);
  const totalDiskon = items.reduce((sum, i) => sum + i.diskon, 0);
  const pajak = Math.round((subtotal - totalDiskon) * 0.11); // PPN 11%
  const grandTotal = subtotal - totalDiskon + pajak;
  const bayarNum = parseFloat(bayarAmount) || 0;
  const kembalian = bayarNum - grandTotal;

  // Handle barcode scan (enter di search box)
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery) {
      const product = MOCK_PRODUCTS.find(
        (p) => p.barcode === searchQuery || p.nama.toLowerCase() === searchQuery.toLowerCase()
      );
      if (product) {
        addItem({ ...product, qty: 1 });
        toast.success(\`\${product.nama} ditambahkan\`);
        setSearchQuery('');
      } else {
        toast.error('Produk tidak ditemukan');
      }
    }
  };

  // Checkout handler
  const handleCheckout = async () => {
    if (bayarNum < grandTotal) {
      toast.error('Jumlah bayar kurang!');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          subtotal,
          diskon: totalDiskon,
          pajak,
          grandTotal,
          bayar: bayarNum,
          kembalian,
          metodeBayar: selectedPayment,
          userId: 'demo-user-id',
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(\`Transaksi \${data.transaction.nomor} berhasil!\`, { duration: 5000 });
        clearCart();
        setCheckoutOpen(false);
        setBayarAmount('');
      } else {
        toast.error(data.error || 'Transaksi gagal');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      {/* LEFT: Product Catalog */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search Bar */}
        <div className="glass-card p-3 mb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <Input
              ref={searchRef}
              placeholder="Scan barcode atau cari produk... (F2)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-10 !py-2.5"
            />
          </div>
          <Button variant="outline" size="md">
            <Barcode className="w-4 h-4" /> Scan
          </Button>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    addItem({ ...product, qty: 1 });
                    toast.success(\`\${product.nama} ditambahkan\`);
                  }}
                  className="glass-card p-4 cursor-pointer group"
                >
                  <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-3">
                    <ShoppingCart className="w-8 h-8 text-primary/40 group-hover:text-primary transition-colors" />
                  </div>
                  <p className="font-semibold text-sm truncate">{product.nama}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{product.barcode}</p>
                  <p className="text-primary font-bold mt-2">{formatRupiah(product.harga)}</p>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredProducts.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
                <Search className="w-12 h-12 mb-3 opacity-30" />
                <p>Produk tidak ditemukan</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Cart Panel */}
      <div className="w-96 flex flex-col glass-card !rounded-2xl overflow-hidden flex-shrink-0">
        {/* Cart Header */}
        <div className="p-4 border-b border-white/10">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" /> Keranjang
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{items.length} item</p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                className="glass-card !p-3 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm flex-1 pr-2">{item.nama}</p>
                  <button onClick={() => removeItem(item.id)} className="text-danger hover:bg-danger/10 p-1 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-7 h-7 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-bold text-sm">{formatRupiah(item.harga * item.qty)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] py-10">
              <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Keranjang kosong</p>
            </div>
          )}
        </div>

        {/* Cart Summary */}
        <div className="p-4 border-t border-white/10 space-y-2 bg-white/5">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Pajak (11%)</span>
            <span>{formatRupiah(pajak)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
            <span>Total</span>
            <span className="text-primary">{formatRupiah(grandTotal)}</span>
          </div>

          <Button
            className="w-full mt-3 !py-3"
            disabled={items.length === 0}
            onClick={() => setCheckoutOpen(true)}
          >
            Bayar Sekarang
          </Button>
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      <Modal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} title="💳 Pembayaran">
        <div className="space-y-5">
          {/* Payment Methods */}
          <div>
            <label className="block text-sm font-medium mb-2">Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={\`p-3 rounded-xl border transition-all flex items-center gap-3 \${
                    selectedPayment === method.id
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-white/10 hover:bg-white/5'
                  }\`}
                >
                  <method.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{method.label}</span>
                  {selectedPayment === method.id && <Check className="w-4 h-4 ml-auto text-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Display */}
          <div className="glass-card !p-4 text-center">
            <p className="text-sm text-[var(--text-secondary)]">Total Tagihan</p>
            <p className="text-3xl font-bold text-primary mt-1">{formatRupiah(grandTotal)}</p>
          </div>

          {/* Bayar Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Jumlah Bayar</label>
            <Input
              type="number"
              placeholder="Masukkan nominal..."
              value={bayarAmount}
              onChange={(e) => setBayarAmount(e.target.value)}
              className="!text-lg !font-bold text-center"
              autoFocus
            />
            {/* Quick Amount Buttons */}
            <div className="flex gap-2 mt-2">
              {[grandTotal, Math.ceil(grandTotal / 10000) * 10000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setBayarAmount(String(amt))}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {formatRupiah(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Kembalian */}
          {bayarNum >= grandTotal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card !p-4 !bg-success/10 !border-success/20 flex justify-between items-center"
            >
              <span className="font-medium text-success">Kembalian</span>
              <span className="text-xl font-bold text-success">{formatRupiah(kembalian)}</span>
            </motion.div>
          )}

          {/* Process Button */}
          <Button
            className="w-full !py-3.5 !text-base"
            disabled={processing || bayarNum < grandTotal}
            onClick={handleCheckout}
          >
            {processing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
            ) : (
              <><Check className="w-5 h-5" /> Proses Pembayaran</>
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
`);

// ==========================================
// SELESAI
// ==========================================
console.log('\n==================================================');
console.log('✅ TAHAP 2 SELESAI!');
console.log('==================================================\n');
console.log('Langkah selanjutnya:\n');
console.log('  npm install');
console.log('  npm run dev\n');
console.log('🛒 Buka http://localhost:3000/pos');
console.log('⌨️  Tekan F2 untuk fokus ke search');
console.log('📱 Scan barcode atau klik produk untuk menambah ke cart');
console.log('💳 Klik "Bayar Sekarang" untuk checkout\n');
console.log('📋 Fitur Tahap 2:');
console.log('   ✅ Product catalog dengan search & barcode');
console.log('   ✅ Cart management (add/remove/update qty)');
console.log('   ✅ Auto kalkulasi pajak & total');
console.log('   ✅ Multi payment methods');
console.log('   ✅ Checkout modal dengan kalkulasi kembalian');
console.log('   ✅ Save transaction ke database');
console.log('   ✅ Auto reduce stock setelah transaksi');
console.log('   ✅ Toast notifications');
console.log('   ✅ Keyboard shortcut (F2)\n');