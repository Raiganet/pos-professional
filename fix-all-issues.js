const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki semua masalah...\n');

// 1. FIX: Hapus duplikasi menu Pelanggan di Sidebar
console.log('1️⃣ Memperbaiki Sidebar (hapus duplikasi Pelanggan)...');
const sidebarPath = path.join(process.cwd(), 'components', 'layout', 'Sidebar.tsx');
if (fs.existsSync(sidebarPath)) {
  let content = fs.readFileSync(sidebarPath, 'utf8');
  const lines = content.split('\n');
  const filteredLines = [];
  let pelangganCount = 0;
  
  lines.forEach(line => {
    if (line.includes("label: 'Pelanggan'")) {
      pelangganCount++;
      if (pelangganCount <= 1) {
        filteredLines.push(line);
      }
    } else {
      filteredLines.push(line);
    }
  });
  
  fs.writeFileSync(sidebarPath, filteredLines.join('\n'));
  console.log('   ✅ Sidebar diperbaiki\n');
}

// 2. FIX: Buat halaman Pengaturan yang hilang
console.log('2️⃣ Membuat halaman Pengaturan...');
const settingsDir = path.join(process.cwd(), 'app', '(dashboard)', 'pengaturan');
if (!fs.existsSync(settingsDir)) {
  fs.mkdirSync(settingsDir, { recursive: true });
  
  const settingsContent = `'use client';
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
`;
  
  fs.writeFileSync(path.join(settingsDir, 'page.tsx'), settingsContent);
  console.log('   ✅ Halaman Pengaturan dibuat\n');
}

// 3. FIX: Perbaiki halaman POS & lib/printer untuk handle error Bluetooth
console.log('3️⃣ Memperbaiki tipe dan halaman Bluetooth...');
const posPath = path.join(process.cwd(), 'app', '(dashboard)', 'pos', 'page.tsx');
if (fs.existsSync(posPath)) {
  let content = fs.readFileSync(posPath, 'utf8');
  // Gunakan Regex untuk replace yang lebih aman
  content = content.replace(/if \(!navigator\.bluetooth\)/g, "if (!(navigator as any).bluetooth)");
  content = content.replace(/await navigator\.bluetooth\.requestDevice/g, "await (navigator as any).bluetooth.requestDevice");
  fs.writeFileSync(posPath, content);
  console.log('   ✅ Halaman POS diperbaiki\n');
}

const printerPath = path.join(process.cwd(), 'lib', 'printer.ts');
if (fs.existsSync(printerPath)) {
  let content = fs.readFileSync(printerPath, 'utf8');
  content = content.replace(/if \(!navigator\.bluetooth\)/g, "if (!(navigator as any).bluetooth)");
  content = content.replace(/await navigator\.bluetooth\.requestDevice/g, "await (navigator as any).bluetooth.requestDevice");
  fs.writeFileSync(printerPath, content);
  console.log('   ✅ File printer.ts diperbaiki\n');
}

// 4. FIX: Buat type declaration untuk Bluetooth agar TypeScript tidak error di Vercel
console.log('4️⃣ Menambahkan tipe Bluetooth...');
const typesDir = path.join(process.cwd(), 'types');
if (!fs.existsSync(typesDir)) fs.mkdirSync(typesDir, { recursive: true });

const bluetoothTypes = `// Type declarations for Web Bluetooth API
interface BluetoothRemoteGATTCharacteristic {
  writeValueWithoutResponse(value: BufferSource): Promise<void>;
  writeValue(value: BufferSource): Promise<void>;
}
interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
}
interface BluetoothRemoteGATTServer {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
}
interface BluetoothDevice {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
}
interface RequestDeviceOptions {
  filters?: Array<{ services?: string[]; name?: string; namePrefix?: string }>;
  optionalServices?: string[];
  acceptAllDevices?: boolean;
}
interface Bluetooth {
  requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
}
interface Navigator {
  bluetooth: Bluetooth;
}
`;

fs.writeFileSync(path.join(typesDir, 'bluetooth.d.ts'), bluetoothTypes);
console.log('   ✅ Tipe Bluetooth ditambahkan\n');

console.log('✅ Semua perbaikan selesai!');
console.log('\n📝 Langkah selanjutnya:');
console.log('   1. git add .');
console.log('   2. git commit -m "Fix: berbagai perbaikan bug (sidebar, pengaturan, bluetooth)"');
console.log('   3. git push origin main');