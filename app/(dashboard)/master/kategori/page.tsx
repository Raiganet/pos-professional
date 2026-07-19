'use client';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export default function KategoriPage() {
  const [data, setData] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ id: '', nama: '', deskripsi: '' });

  const load = async () => {
    const res = await fetch('/api/master/kategori');
    setData(await res.json());
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const method = form.id ? 'PUT' : 'POST';
    await fetch('/api/master/kategori', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    toast.success(form.id ? 'Kategori diperbarui' : 'Kategori ditambahkan');
    setModalOpen(false);
    setForm({ id: '', nama: '', deskripsi: '' });
    load();
  };

  const handleDelete = async (row: any) => {
    if (!confirm(`Hapus kategori "${row.nama}"?`)) return;
    await fetch(`/api/master/kategori?id=${row.id}`, { method: 'DELETE' });
    toast.success('Kategori dihapus');
    load();
  };

  return (
    <>
      <DataTable
        title="📂 Master Kategori"
        columns={[
          { key: 'nama', label: 'Nama Kategori' },
          { key: 'deskripsi', label: 'Deskripsi' },
          { key: 'createdAt', label: 'Dibuat', render: (r: any) => new Date(r.createdAt).toLocaleDateString('id-ID') },
        ]}
        data={data}
        searchKeys={['nama']}
        onAdd={() => { setForm({ id: '', nama: '', deskripsi: '' }); setModalOpen(true); }}
        onEdit={(row) => { setForm(row); setModalOpen(true); }}
        onDelete={handleDelete}
        exportFilename="kategori"
      />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={form.id ? 'Edit Kategori' : 'Tambah Kategori'}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nama</label><Input value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Deskripsi</label><Input value={form.deskripsi} onChange={e => setForm({...form, deskripsi: e.target.value})} /></div>
          <Button className="w-full" onClick={save}>Simpan</Button>
        </div>
      </Modal>
    </>
  );
}
