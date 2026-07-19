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
              <div className={`p-2.5 rounded-xl bg-${stat.color === 'purple' ? 'primary' : stat.color === 'indigo' ? 'secondary' : stat.color === 'cyan' ? 'accent' : 'success'}/15`}>
                <stat.icon className={`w-5 h-5 text-${stat.color === 'purple' ? 'primary' : stat.color === 'indigo' ? 'secondary' : stat.color === 'cyan' ? 'accent' : 'success'}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend >= 0 ? 'text-success' : 'text-danger'}`}>
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
