'use client';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { formatRupiah } from '@/lib/utils';
import { toast } from 'sonner';

export default function ProdukPage() {
  const [data, setData] = useState<any[]>([]);
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [brandList, setBrandList] = useState<any[]>([]);
  const [supplierList, setSupplierList] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<any>({});

  const emptyForm = {
    id: '', barcode: '', sku: '', nama: '', kategoriId: '', brandId: '', supplierId: '',
    hargaModal: 0, hargaJual: 0, diskon: 0, pajak: 0, satuan: 'pcs',
    berat: 0, stok: 0, minStok: 10, statusAktif: true,
  };

  const load = async () => {
    const [prod, kat, br, sup] = await Promise.all([
      fetch('/api/master/produk').then(r => r.json()),
      fetch('/api/master/kategori').then(r => r.json()),
      fetch('/api/master/brand').then(r => r.json()),
      fetch('/api/master/supplier').then(r => r.json()),
    ]);
    setData(prod); setKategoriList(kat); setBrandList(br); setSupplierList(sup);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const method = form.id ? 'PUT' : 'POST';
    const payload = { ...form, hargaModal: Number(form.hargaModal), hargaJual: Number(form.hargaJual), stok: Number(form.stok), minStok: Number(form.minStok) };
    await fetch('/api/master/produk', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    toast.success(form.id ? 'Produk diperbarui' : 'Produk ditambahkan');
    setModalOpen(false); setForm(emptyForm); load();
  };

  const handleDelete = async (row: any) => {
    if (!confirm(`Nonaktifkan produk "${row.nama}"?`)) return;
    await fetch(`/api/master/produk?id=${row.id}`, { method: 'DELETE' });
    toast.success('Produk dinonaktifkan'); load();
  };

  const handleImport = async (rows: Record<string, any>[]) => {
    const res = await fetch('/api/master/produk', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: rows }),
    });
    const result = await res.json();
    toast.success(`${result.imported} produk berhasil di-import`);
    load();
  };

  const columns = [
    { key: 'barcode', label: 'Barcode' },
    { key: 'nama', label: 'Nama Produk' },
    { key: 'kategori', label: 'Kategori', render: (r: any) => r.kategori?.nama || '-' },
    { key: 'hargaJual', label: 'Harga Jual', render: (r: any) => formatRupiah(r.hargaJual) },
    { key: 'stok', label: 'Stok', render: (r: any) => (
      <Badge variant={r.stok <= r.minStok ? 'danger' : 'success'}>{r.stok} {r.satuan}</Badge>
    )},
    { key: 'statusAktif', label: 'Status', render: (r: any) => (
      <Badge variant={r.statusAktif ? 'success' : 'danger'}>{r.statusAktif ? 'Aktif' : 'Nonaktif'}</Badge>
    )},
  ];

  return (
    <>
      <DataTable
        title="📦 Master Produk"
        columns={columns}
        data={data.filter(d => d.statusAktif)}
        searchKeys={['nama', 'barcode', 'sku']}
        onAdd={() => { setForm(emptyForm); setModalOpen(true); }}
        onEdit={(row) => { setForm(row); setModalOpen(true); }}
        onDelete={handleDelete}
        exportFilename="produk"
        onImport={handleImport}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={form.id ? 'Edit Produk' : 'Tambah Produk'} className="max-w-2xl">
        <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
          <div><label className="block text-sm font-medium mb-1">Barcode *</label><Input value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">SKU *</label><Input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} /></div>
          <div className="col-span-2"><label className="block text-sm font-medium mb-1">Nama Produk *</label><Input value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Kategori *</label>
            <select className="input-glass" value={form.kategoriId} onChange={e => setForm({...form, kategoriId: e.target.value})}>
              <option value="">Pilih Kategori</option>
              {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <select className="input-glass" value={form.brandId || ''} onChange={e => setForm({...form, brandId: e.target.value})}>
              <option value="">-</option>
              {brandList.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium mb-1">Harga Modal</label><Input type="number" value={form.hargaModal} onChange={e => setForm({...form, hargaModal: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Harga Jual *</label><Input type="number" value={form.hargaJual} onChange={e => setForm({...form, hargaJual: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Stok</label><Input type="number" value={form.stok} onChange={e => setForm({...form, stok: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Min Stok</label><Input type="number" value={form.minStok} onChange={e => setForm({...form, minStok: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Satuan</label><Input value={form.satuan} onChange={e => setForm({...form, satuan: e.target.value})} /></div>
          <div>
            <label className="block text-sm font-medium mb-1">Supplier</label>
            <select className="input-glass" value={form.supplierId || ''} onChange={e => setForm({...form, supplierId: e.target.value})}>
              <option value="">-</option>
              {supplierList.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
            </select>
          </div>
        </div>
        <Button className="w-full mt-4" onClick={save}>Simpan Produk</Button>
      </Modal>
    </>
  );
}
