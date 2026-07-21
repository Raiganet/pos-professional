'use client';
import { useState, useEffect } from 'react';
import {
  Package, ArrowDownCircle, ArrowUpCircle, RefreshCw,
  History, AlertTriangle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { formatRupiah } from '@/lib/utils';
import { toast } from 'sonner';

type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';

export default function StokPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<MovementType>('IN');
  const [items, setItems] = useState<{ produkId: string; jumlah: number }[]>([]);
  const [referensi, setReferensi] = useState('');
  const [catatan, setCatatan] = useState('');

  // Data REAL dari database
  const [products, setProducts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [todayMutasi, setTodayMutasi] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      setProducts(Array.isArray(json) ? json : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await fetch('/api/stock?limit=50');
      const json = await res.json();
      setHistory(Array.isArray(json?.data) ? json.data : []);
      setTodayMutasi(typeof json?.todayCount === 'number' ? json.todayCount : 0);
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    loadProducts();
    loadHistory();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { produkId: '', jumlah: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (items.some((i) => !i.produkId || !i.jumlah || i.jumlah <= 0)) {
      toast.error('Lengkapi data produk dan jumlah!');
      return;
    }
    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipe: selectedType, items, referensi, catatan }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal');
      toast.success(`Stok ${selectedType} berhasil diproses!`);
      setModalOpen(false);
      setItems([]);
      setReferensi('');
      setCatatan('');
      loadProducts(); // refresh stok di tabel & dropdown
      loadHistory();  // refresh riwayat
    } catch (e: any) {
      toast.error(e.message || 'Gagal memproses stok');
    }
  };

  // ===== Hitungan REAL dari database =====
  const totalItem = products.reduce((s, p) => s + (Number(p.stok) || 0), 0);
  const totalAset = products.reduce(
    (s, p) => s + (Number(p.stok) || 0) * (Number(p.hargaModal) || 0),
    0
  );
  const lowStock = products.filter(
    (p) => (Number(p.stok) || 0) <= (Number(p.minimalStok ?? 10))
  );

  const tabs = [
    { id: 'overview', label: 'Ringkasan Stok', icon: Package },
    { id: 'history', label: 'Riwayat Mutasi', icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Stok</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Kelola persediaan barang masuk, keluar, dan opname
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { setSelectedType('IN'); setModalOpen(true); }}>
            <ArrowDownCircle className="w-4 h-4" /> Stock In
          </Button>
          <Button variant="danger" onClick={() => { setSelectedType('OUT'); setModalOpen(true); }}>
            <ArrowUpCircle className="w-4 h-4" /> Stock Out
          </Button>
          <Button variant="outline" onClick={() => { setSelectedType('ADJUSTMENT'); setModalOpen(true); }}>
            <RefreshCw className="w-4 h-4" /> Opname
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-primary/20 text-primary font-semibold'
                : 'hover:bg-white/5 text-[var(--text-secondary)]'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="h-64 flex items-center justify-center glass-card">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : activeTab === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Low Stock Alert */}
          <div className="glass-card p-5 col-span-1 md:col-span-3">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-danger">
              <AlertTriangle className="w-5 h-5" /> Peringatan Stok Menipis
            </h3>
            <div className="overflow-x-auto">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Produk</Th>
                    <Th>Stok Saat Ini</Th>
                    <Th>Min. Stok</Th>
                    <Th>Status</Th>
                    <Th>Aksi</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {lowStock.map((p) => (
                    <Tr key={p.id}>
                      <Td className="font-medium">{p.nama}</Td>
                      <Td>{p.stok ?? 0}</Td>
                      <Td>{p.minimalStok ?? 10}</Td>
                      <Td>
                        <Badge variant={(p.stok ?? 0) <= 0 ? 'danger' : 'warning'}>
                          {(p.stok ?? 0) <= 0 ? 'Habis' : 'Menipis'}
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setSelectedType('IN'); setModalOpen(true); }}
                        >
                          Restock
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                  {lowStock.length === 0 && (
                    <Tr>
                      <Td colSpan={5} className="text-center py-8 text-[var(--text-secondary)]">
                        {products.length === 0
                          ? 'Belum ada produk. Tambah di menu Produk dulu.'
                          : 'Semua stok aman 👍'}
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </div>
          </div>

          {/* Stats Cards - REAL */}
          <div className="glass-card p-5">
            <p className="text-[var(--text-secondary)] text-sm">Total Nilai Aset</p>
            <p className="text-2xl font-bold mt-1 text-primary">{formatRupiah(totalAset)}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              *Hitung dari harga modal
            </p>
          </div>
          <div className="glass-card p-5">
            <p className="text-[var(--text-secondary)] text-sm">Total Item Produk</p>
            <p className="text-2xl font-bold mt-1">{totalItem}</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-[var(--text-secondary)] text-sm">Mutasi Hari Ini</p>
            <p className="text-2xl font-bold mt-1">{todayMutasi} Transaksi</p>
          </div>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <Table>
            <Thead>
              <Tr>
                <Th>Tanggal</Th>
                <Th>Tipe</Th>
                <Th>Produk</Th>
                <Th>Jumlah</Th>
                <Th>Referensi</Th>
                <Th>Catatan</Th>
              </Tr>
            </Thead>
            <Tbody>
              {history.map((h) => (
                <Tr key={h.id}>
                  <Td>{new Date(h.createdAt).toLocaleString('id-ID')}</Td>
                  <Td>
                    <Badge
                      variant={
                        h.tipe === 'IN' ? 'success' : h.tipe === 'OUT' ? 'danger' : 'warning'
                      }
                    >
                      {h.tipe}
                    </Badge>
                  </Td>
                  <Td>{h.produk?.nama || '-'}</Td>
                  <Td className="font-bold">{h.jumlah}</Td>
                  <Td>{h.referensi || '-'}</Td>
                  <Td className="text-[var(--text-secondary)]">{h.catatan || '-'}</Td>
                </Tr>
              ))}
              {history.length === 0 && (
                <Tr>
                  <Td colSpan={6} className="text-center py-10">
                    Belum ada riwayat mutasi
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </div>
      )}

      {/* MODAL INPUT STOK */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Input Stok ${selectedType}`}
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Referensi / No. Bukti</label>
              <Input
                placeholder="Contoh: PO-001 / OPNAME-JULI"
                value={referensi}
                onChange={(e) => setReferensi(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipe</label>
              <div className="input-glass flex items-center gap-2 h-[46px]">
                <Badge
                  variant={
                    selectedType === 'IN'
                      ? 'success'
                      : selectedType === 'OUT'
                      ? 'danger'
                      : 'warning'
                  }
                >
                  {selectedType}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium">Daftar Produk</label>
              <Button size="sm" variant="ghost" onClick={handleAddItem}>
                + Tambah Baris
              </Button>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center glass-card !p-2">
                <select
                  className="input-glass flex-1 !py-2"
                  value={item.produkId}
                  onChange={(e) => updateItem(idx, 'produkId', e.target.value)}
                >
                  <option value="">Pilih Produk...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama} (Stok: {p.stok ?? 0})
                    </option>
                  ))}
                  {products.length === 0 && (
                    <option disabled>— Tambah produk dulu di menu Produk —</option>
                  )}
                </select>
                <Input
                  type="number"
                  placeholder={selectedType === 'ADJUSTMENT' ? 'Stok akhir' : 'Jml'}
                  className="!w-24 !py-2"
                  value={item.jumlah || ''}
                  onChange={(e) => updateItem(idx, 'jumlah', parseInt(e.target.value))}
                />
                <button
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                  className="p-2 text-danger hover:bg-danger/10 rounded-lg"
                >
                  ✕
                </button>
              </div>
            ))}
            {items.length === 0 && (
              <p className="text-sm text-center text-[var(--text-secondary)] py-4">
                Klik &quot;+ Tambah Baris&quot; untuk mulai
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Catatan</label>
            <textarea
              className="input-glass w-full min-h-[80px] p-3 resize-none"
              placeholder="Keterangan tambahan..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handleSubmit}>
            Simpan Perubahan Stok
          </Button>
        </div>
      </Modal>
    </div>
  );
}