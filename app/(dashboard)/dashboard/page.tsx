'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, ShoppingBag, Users, Package, TrendingUp,
  AlertTriangle, Clock, ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatRupiah } from '@/lib/utils';

const DEFAULT_DATA = {
  penjualanHariIni: 0, transaksiHariIni: 0, totalMember: 0, totalProduk: 0,
  trendPenjualan: 0, trendTransaksi: 0, trendMember: 0, trendProduk: 0,
  salesData: [] as any[], topProducts: [] as any[], lowStock: [] as any[], recent: [] as any[],
};

function formatRelative(t: string) {
  const diff = Date.now() - new Date(t).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'baru saja';
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function DashboardPage() {
  const [data, setData] = useState<any>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        setData({ ...DEFAULT_DATA, ...json });
      } catch {
        setData(DEFAULT_DATA);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = [
    { title: 'Penjualan Hari Ini', value: data.penjualanHariIni, icon: DollarSign, trend: data.trendPenjualan, color: 'purple', isRupiah: true },
    { title: 'Transaksi', value: data.transaksiHariIni, icon: ShoppingBag, trend: data.trendTransaksi, color: 'indigo', isRupiah: false },
    { title: 'Total Member', value: data.totalMember, icon: Users, trend: data.trendMember, color: 'cyan', isRupiah: false },
    { title: 'Total Produk', value: data.totalProduk, icon: Package, trend: data.trendProduk, color: 'emerald', isRupiah: false },
  ];

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center glass-card">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-[var(--text-secondary)] text-sm">Ringkasan performa toko Anda</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const trend = stat.trend ?? 0;
          return (
            <motion.div key={stat.title} variants={itemVariants} className="glass-card p-5">
              <div className={`flex items-start justify-between mb-3`}>
                <div className={`p-2.5 rounded-xl bg-${stat.color === 'purple' ? 'primary' : stat.color === 'indigo' ? 'secondary' : stat.color === 'cyan' ? 'accent' : 'success'}/15`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color === 'purple' ? 'primary' : stat.color === 'indigo' ? 'secondary' : stat.color === 'cyan' ? 'accent' : 'success'}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
                  {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(trend)}%
                </div>
              </div>
              <p className="text-[var(--text-secondary)] text-sm">{stat.title}</p>
              <p className="text-2xl font-bold mt-1">
                {stat.isRupiah ? formatRupiah(stat.value || 0) : (stat.value || 0).toLocaleString('id-ID')}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div variants={itemVariants} className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Grafik Penjualan 7 Hari
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.salesData}>
              <defs>
                <linearGradient id="colorPenjualan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.1)" />
              <XAxis dataKey="hari" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${v / 1000000}jt`} />
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
            {data.topProducts.length > 0 ? data.topProducts.map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div>
                    <p className="text-sm font-medium">{p.nama}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{p.terjual} terjual</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">{formatRupiah(p.revenue)}</span>
              </div>
            )) : (
              <p className="text-sm text-center text-[var(--text-secondary)] py-8">Belum ada penjualan</p>
            )}
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
            {data.lowStock.length > 0 ? data.lowStock.map((item: any) => (
              <div key={item.nama} className="flex items-center justify-between p-3 rounded-xl bg-danger/5 border border-danger/10">
                <span className="text-sm font-medium">{item.nama}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-danger">{item.stok}</span>
                  <span className="text-xs text-[var(--text-secondary)]"> / min {item.min}</span>
                </div>
              </div>
            )) : (
              <p className="text-sm text-center text-[var(--text-secondary)] py-6">
                {data.totalProduk === 0 ? 'Belum ada produk' : 'Semua stok aman 👍'}
              </p>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="glass-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-secondary" /> Aktivitas Terbaru
          </h3>
          <div className="space-y-3">
            {data.recent.length > 0 ? data.recent.map((log: any, i: number) => (
              <div key={i} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">{log.aksi}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{log.user} • {formatRelative(log.createdAt)}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-center text-[var(--text-secondary)] py-6">Belum ada aktivitas</p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}