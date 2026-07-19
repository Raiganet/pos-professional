'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Calendar, TrendingUp, ShoppingBag, 
  Users, Package, Printer 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatRupiah } from '@/lib/utils';
import { exportToExcel } from '@/utils/excel';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function LaporanPage() {
  const [activeTab, setActiveTab] = useState<'sales' | 'products' | 'cashier'>('sales');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'sales') {
        const res = await fetch(`/api/reports/sales?start=${dateRange.start}&end=${dateRange.end}`);
        setData(await res.json());
      } else if (activeTab === 'products') {
        const res = await fetch(`/api/reports/products?start=${dateRange.start}&end=${dateRange.end}`);
        setData(await res.json());
      }
    } catch (e) {
      toast.error('Gagal memuat laporan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const handleExport = () => {
    if (!data) return;
    const filename = activeTab === 'sales' ? 'laporan_penjualan' : 'laporan_produk';
    const exportData = activeTab === 'sales' 
      ? data.transactions.map((t: any) => ({
          No: t.nomor, Tanggal: new Date(t.createdAt).toLocaleDateString(), 
          Kasir: t.user?.name, Total: t.grandTotal, Metode: t.metodeBayar
        }))
      : data.map((p: any) => ({
          Produk: p.nama, Barcode: p.barcode, Terjual: p.terjual, Omzet: p.revenue
        }));
    
    exportToExcel(exportData, filename);
  };

  const tabs = [
    { id: 'sales', label: 'Penjualan & Profit', icon: TrendingUp },
    { id: 'products', label: 'Produk Terlaris', icon: Package },
    { id: 'cashier', label: 'Performa Kasir', icon: Users },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Laporan Bisnis</h1>
          <p className="text-[var(--text-secondary)] text-sm">Analisis performa toko Anda</p>
        </div>
        <div className="flex items-center gap-3 glass-card p-2">
          <Calendar className="w-4 h-4 text-[var(--text-secondary)] ml-2" />
          <input type="date" className="bg-transparent text-sm outline-none" onChange={e => setDateRange({...dateRange, start: e.target.value})} />
          <span className="text-[var(--text-secondary)]">-</span>
          <input type="date" className="bg-transparent text-sm outline-none" onChange={e => setDateRange({...dateRange, end: e.target.value})} />
          <Button size="sm" onClick={fetchData} disabled={loading}>Terapkan</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-primary text-white shadow-glow' : 'glass-card hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="h-64 flex items-center justify-center glass-card">Memuat data...</div>
      ) : (
        <>
          {activeTab === 'sales' && data && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-5 border-l-4 border-primary">
                  <p className="text-[var(--text-secondary)] text-sm">Total Omzet</p>
                  <p className="text-2xl font-bold mt-1">{formatRupiah(data.summary.omzet)}</p>
                </div>
                <div className="glass-card p-5 border-l-4 border-success">
                  <p className="text-[var(--text-secondary)] text-sm">Estimasi Profit</p>
                  <p className="text-2xl font-bold mt-1 text-success">{formatRupiah(data.summary.profit)}</p>
                </div>
                <div className="glass-card p-5 border-l-4 border-accent">
                  <p className="text-[var(--text-secondary)] text-sm">Jumlah Transaksi</p>
                  <p className="text-2xl font-bold mt-1">{data.summary.totalTransaksi}</p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export Excel</Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" /> Print</Button>
              </div>

              {/* Table */}
              <div className="glass-card overflow-hidden print:shadow-none print:border-0">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white/5 text-[var(--text-secondary)] uppercase text-xs">
                    <tr>
                      <th className="p-4">No Transaksi</th>
                      <th className="p-4">Tanggal</th>
                      <th className="p-4">Kasir</th>
                      <th className="p-4">Pelanggan</th>
                      <th className="p-4 text-right">Total</th>
                      <th className="p-4 text-center">Metode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.transactions.map((t: any) => (
                      <tr key={t.id} className="hover:bg-white/5">
                        <td className="p-4 font-medium">{t.nomor}</td>
                        <td className="p-4">{new Date(t.createdAt).toLocaleString('id-ID')}</td>
                        <td className="p-4">{t.user?.name || '-'}</td>
                        <td className="p-4">{t.pelanggan?.nama || 'Umum'}</td>
                        <td className="p-4 text-right font-bold">{formatRupiah(t.grandTotal)}</td>
                        <td className="p-4 text-center"><span className="px-2 py-1 rounded bg-white/10 text-xs">{t.metodeBayar}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && data && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-5 h-80">
                <h3 className="font-semibold mb-4">Grafik Penjualan Produk</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <XAxis dataKey="nama" hide />
                    <YAxis />
                    <Tooltip formatter={(v: number) => formatRupiah(v)} />
                    <Bar dataKey="revenue" fill="#7C3AED" radius={[4, 4, 0, 0]}>
                      {data.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={['#7C3AED', '#6366F1', '#06B6D4'][index % 3]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                  <h3 className="font-semibold">Top 10 Produk</h3>
                  <Button size="sm" variant="ghost" onClick={handleExport}>Export</Button>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-[var(--text-secondary)]">
                    <tr><th className="p-3 text-left">Produk</th><th className="p-3 text-right">Terjual</th><th className="p-3 text-right">Omzet</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.map((p: any, i: number) => (
                      <tr key={i}>
                        <td className="p-3">
                          <div className="font-medium">{p.nama}</div>
                          <div className="text-xs text-[var(--text-secondary)]">{p.barcode}</div>
                        </td>
                        <td className="p-3 text-right">{p.terjual} pcs</td>
                        <td className="p-3 text-right font-bold">{formatRupiah(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'cashier' && (
             <div className="glass-card p-10 text-center text-[var(--text-secondary)]">
               <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
               <p>Fitur Laporan Kasir akan tersedia di update selanjutnya.</p>
             </div>
          )}
        </>
      )}
    </div>
  );
}
