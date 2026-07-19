'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ArrowDownCircle, ArrowUpCircle, RefreshCw, History, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import { formatRupiah } from '@/lib/utils';
import { toast } from 'sonner';

// Mock data produk untuk dropdown (nanti ganti fetch API)
const MOCK_PRODUCTS = [
  { id: '1', nama: 'Indomie Goreng', stok: 50, hargaModal: 3000 },
  { id: '2', nama: 'Aqua 600ml', stok: 120, hargaModal: 2000 },
  { id: '3', nama: 'Kopi Kapal Api', stok: 5, hargaModal: 1200 },
];

type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';

export default function StokPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<MovementType>('IN');
  const [items, setItems] = useState<{produkId: string, jumlah: number}[]>([]);
  const [referensi, setReferensi] = useState('');
  const [catatan, setCatatan] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = async () => {
    const res = await fetch('/api/stock?limit=50');
    const json = await res.json();
    setHistory(json.data);
  };

  useEffect(() => { loadHistory(); }, []);

  const handleAddItem = () => {
    setItems([...items, { produkId: '', jumlah: 0 }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async () => {
    if (items.some(i => !i.produkId || i.jumlah <= 0)) {
      toast.error('Lengkapi data produk dan jumlah!');
      return;
    }

    try {
      await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipe: selectedType, items, referensi, catatan }),
      });
      toast.success(`Stok ${selectedType} berhasil diproses!`);
      setModalOpen(false);
      setItems([]);
      setReferensi('');
      setCatatan('');
      loadHistory();
    } catch (e) {
      toast.error('Gagal memproses stok');
    }
  };

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
          <p className="text-[var(--text-secondary)] text-sm">Kelola persediaan barang masuk, keluar, dan opname</p>
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
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              activeTab === tab.id ? 'bg-primary/20 text-primary font-semibold' : 'hover:bg-white/5 text-[var(--text-secondary)]'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Low Stock Alert */}
          <div className="glass-card p-5 col-span-1 md:col-span-3">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-danger">
              <AlertTriangle className="w-5 h-5" /> Peringatan Stok Menipis
            </h3>
            <div className="overflow-x-auto">
              <Table>
                <Thead>
                  <Tr><Th>Produk</Th><Th>Stok Saat Ini</Th><Th>Min. Stok</Th><Th>Status</Th><Th>Aksi</Th></Tr>
                </Thead>
                <Tbody>
                  {MOCK_PRODUCTS.filter(p => p.stok <= 10).map(p => (
                    <Tr key={p.id}>
                      <Td className="font-medium">{p.nama}</Td>
                      <Td>{p.stok}</Td>
                      <Td>10</Td>
                      <Td><Badge variant="danger">Kritis</Badge></Td>
                      <Td>
                        <Button size="sm" variant="outline" onClick={() => { setSelectedType('IN'); setModalOpen(true); }}>Restock</Button>
                      </Td>
                    </Tr>
                  ))}
                  {MOCK_PRODUCTS.filter(p => p.stok <= 10).length === 0 && (
                    <Tr><Td colSpan={5} className="text-center py-8 text-[var(--text-secondary)]">Semua stok aman 👍</Td></Tr>
                  )}
                </Tbody>
              </Table>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="glass-card p-5">
            <p className="text-[var(--text-secondary)] text-sm">Total Nilai Aset</p>
            <p className="text-2xl font-bold mt-1 text-primary">{formatRupiah(45200000)}</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-[var(--text-secondary)] text-sm">Total Item Produk</p>
            <p className="text-2xl font-bold mt-1">342</p>
          </div>
          <div className="glass-card p-5">
            <p className="text-[var(--text-secondary)] text-sm">Mutasi Hari Ini</p>
            <p className="text-2xl font-bold mt-1">12 Transaksi</p>
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
                    <Badge variant={h.tipe === 'IN' ? 'success' : h.tipe === 'OUT' ? 'danger' : 'warning'}>
                      {h.tipe}
                    </Badge>
                  </Td>
                  <Td>{h.produk?.nama}</Td>
                  <Td className="font-bold">{h.jumlah}</Td>
                  <Td>{h.referensi || '-'}</Td>
                  <Td className="text-[var(--text-secondary)]">{h.catatan}</Td>
                </Tr>
              ))}
              {history.length === 0 && (
                <Tr><Td colSpan={6} className="text-center py-10">Belum ada riwayat mutasi</Td></Tr>
              )}
            </Tbody>
          </Table>
        </div>
      )}

      {/* MODAL INPUT STOK */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`Input Stok ${selectedType}`}>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Referensi / No. Bukti</label>
              <Input placeholder="Contoh: PO-001 / OPNAME-JULI" value={referensi} onChange={e => setReferensi(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipe</label>
              <div className="input-glass flex items-center gap-2 h-[46px]">
                <Badge variant={selectedType === 'IN' ? 'success' : selectedType === 'OUT' ? 'danger' : 'warning'}>{selectedType}</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium">Daftar Produk</label>
              <Button size="sm" variant="ghost" onClick={handleAddItem}>+ Tambah Baris</Button>
            </div>
            
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center glass-card !p-2">
                <select 
                  className="input-glass flex-1 !py-2"
                  value={item.produkId}
                  onChange={e => updateItem(idx, 'produkId', e.target.value)}
                >
                  <option value="">Pilih Produk...</option>
                  {MOCK_PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.nama} (Stok: {p.stok})</option>)}
                </select>
                <Input 
                  type="number" 
                  placeholder="Jml" 
                  className="!w-24 !py-2"
                  value={item.jumlah || ''}
                  onChange={e => updateItem(idx, 'jumlah', parseInt(e.target.value))}
                />
                <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="p-2 text-danger hover:bg-danger/10 rounded-lg">
                  ✕
                </button>
              </div>
            ))}
            {items.length === 0 && <p className="text-sm text-center text-[var(--text-secondary)] py-4">Klik "+ Tambah Baris" untuk mulai</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Catatan</label>
            <textarea 
              className="input-glass w-full min-h-[80px] p-3 resize-none"
              placeholder="Keterangan tambahan..."
              value={catatan}
              onChange={e => setCatatan(e.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handleSubmit}>Simpan Perubahan Stok</Button>
        </div>
      </Modal>
    </div>
  );
}
