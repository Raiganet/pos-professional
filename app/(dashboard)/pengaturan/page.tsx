'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Store, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'sonner';

export default function PengaturanPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    namaToko: 'POS Professional',
    alamat: 'Jl. Contoh No. 123',
    telepon: '0812-3456-7890',
    pajak: '11',
    mataUang: 'IDR',
  });

  const handleSave = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Pengaturan berhasil disimpan');
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pengaturan</h1>
        <p className="text-[var(--text-secondary)] text-sm">Konfigurasi aplikasi dan toko</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" /> Profil Toko
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Toko</label>
              <Input value={settings.namaToko} onChange={(e) => setSettings({...settings, namaToko: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alamat</label>
              <textarea className="input-glass w-full min-h-[80px] p-3" value={settings.alamat} onChange={(e) => setSettings({...settings, alamat: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telepon</label>
              <Input value={settings.telepon} onChange={(e) => setSettings({...settings, telepon: e.target.value})} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-accent" /> Konfigurasi
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pajak (%)</label>
              <Input type="number" value={settings.pajak} onChange={(e) => setSettings({...settings, pajak: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mata Uang</label>
              <select className="input-glass" value={settings.mataUang} onChange={(e) => setSettings({...settings, mataUang: e.target.value})}>
                <option value="IDR">IDR - Rupiah</option>
                <option value="USD">USD - Dollar</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" /> {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </div>
    </div>
  );
}
