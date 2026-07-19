'use client';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';

export default function PelangganPage() {
  const [data, setData] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<any>({ nama: '', telepon: '', email: '', isMember: false, level: 'Regular' });

  const load = async () => {
    const res = await fetch('/api/master/pelanggan');
    setData(await res.json());
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const method = form.id ? 'PUT' : 'POST';
    await fetch('/api/master/pelanggan', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    toast.success(form.id ? 'Pelanggan diperbarui' : 'Pelanggan ditambahkan');
    setModalOpen(false); setForm({ nama: '', telepon: '', email: '', isMember: false, level: 'Regular' }); load();
  };

  const handleDelete = async (row: any) => {
    if (!confirm(`Hapus pelanggan "${row.nama}"?`)) return;
    await fetch(`/api/master/pelanggan?id=${row.id}`, { method: 'DELETE' });
    toast.success('Pelanggan dihapus'); load();
  };

  return (
    <>
      <DataTable
        title="👥 Master Pelanggan"
        columns={[
          { key: 'nama', label: 'Nama' },
          { key: 'telepon', label: 'Telepon' },
          { key: 'email', label: 'Email' },
          { key: 'isMember', label: 'Member', render: (r: any) => <Badge variant={r.isMember ? 'success' : 'default'}>{r.isMember ? 'Ya' : 'Tidak'}</Badge> },
          { key: 'level', label: 'Level' },
          { key: 'poin', label: 'Poin', render: (r: any) => r.poin?.toLocaleString() || '0' },
        ]}
        data={data}
        searchKeys={['nama', 'telepon']}
        onAdd={() => { setForm({ nama: '', telepon: '', email: '', isMember: false, level: 'Regular' }); setModalOpen(true); }}
        onEdit={(row) => { setForm(row); setModalOpen(true); }}
        onDelete={handleDelete}
        exportFilename="pelanggan"
      />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={form.id ? 'Edit Pelanggan' : 'Tambah Pelanggan'}>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Nama *</label><Input value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Telepon</label><Input value={form.telepon} onChange={e => setForm({...form, telepon: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div><label className="block text-sm font-medium mb-1">Level</label>
            <select className="input-glass" value={form.level} onChange={e => setForm({...form, level: e.target.value})}>
              <option>Regular</option><option>Silver</option><option>Gold</option><option>Platinum</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isMember} onChange={e => setForm({...form, isMember: e.target.checked})} className="rounded" />
            <span className="text-sm">Daftarkan sebagai Member</span>
          </label>
          <Button className="w-full" onClick={save}>Simpan</Button>
        </div>
      </Modal>
    </>
  );
}
