const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();

function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content.trim() + '\n');
  console.log(`✅ Created: ${path.relative(ROOT_DIR, filePath)}`);
}

console.log('\n🚀 POS PROFESSIONAL - SETUP TAHAP 3 (MASTER DATA)\n');
console.log('===================================================\n');

// Cek apakah package.json ada
const pkgPath = path.join(ROOT_DIR, 'package.json');
if (!fs.existsSync(pkgPath)) {
  console.error('❌ package.json tidak ditemukan! Jalankan di folder pos-professional');
  process.exit(1);
}

// ==========================================
// 1. TAMBAH DEPENDENCY
// ==========================================
console.log('📦 Checking dependencies...');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
if (!pkg.dependencies['file-saver']) {
  pkg.dependencies['file-saver'] = '^2.0.5';
  pkg.devDependencies['@types/file-saver'] = '^2.0.7';
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log('✅ Added: file-saver, @types/file-saver');
} else {
  console.log('⏭️  Dependencies already installed');
}

// ==========================================
// 2. HELPER: EXPORT EXCEL UTILITY
// ==========================================
console.log('\n📊 Membuat utility Export/Import Excel...');

createFile(path.join(ROOT_DIR, 'utils/excel.ts'), `
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export function exportToExcel(data: Record<string, any>[], filename: string, sheetName: string = 'Data') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/octet-stream' });
  saveAs(blob, \`\${filename}_\${new Date().toISOString().slice(0, 10)}.xlsx\`);
}

export function importFromExcel(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const wb = XLSX.read(data, { type: 'binary' });
        const firstSheet = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(firstSheet);
        resolve(json as Record<string, any>[]);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}
`);

// ==========================================
// 3. REUSABLE TABLE COMPONENT
// ==========================================
console.log('\n🧩 Membuat komponen Table & DataTable...');

createFile(path.join(ROOT_DIR, 'components/ui/Table.tsx'), `
import { cn } from '@/lib/utils';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}
export function Table({ className, ...props }: TableProps) {
  return <table className={cn('w-full text-sm', className)} {...props} />;
}

export function Thead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn('border-b border-white/10', className)} {...props} />;
}

export function Tbody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('divide-y divide-white/5', className)} {...props} />;
}

export function Tr({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('hover:bg-white/5 transition-colors', className)} {...props} />;
}

export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('text-left py-3 px-4 font-semibold text-[var(--text-secondary)] text-xs uppercase tracking-wider', className)} {...props} />;
}

export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('py-3 px-4', className)} {...props} />;
}
`);

createFile(path.join(ROOT_DIR, 'components/ui/DataTable.tsx'), `
'use client';
import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Download, Upload, Plus } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Table, Thead, Tbody, Tr, Th, Td } from './Table';
import { exportToExcel, importFromExcel } from '@/utils/excel';
import { toast } from 'sonner';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  title: string;
  columns: Column<T>[];
  data: T[];
  searchKeys?: (keyof T)[];
  onAdd?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  exportFilename?: string;
  onImport?: (rows: Record<string, any>[]) => Promise<void>;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  title, columns, data, searchKeys = [], onAdd, onEdit, onDelete,
  exportFilename = 'data', onImport, pageSize = 10,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search || searchKeys.length === 0) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(q))
    );
  }, [data, search, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleExport = () => {
    exportToExcel(filtered as Record<string, any>[], exportFilename);
    toast.success('Data berhasil di-export ke Excel');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !onImport) return;
      try {
        const rows = await importFromExcel(file);
        await onImport(rows);
        toast.success(\`\${rows.length} data berhasil di-import\`);
      } catch {
        toast.error('Gagal membaca file Excel');
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <Input
              placeholder="Cari..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 !py-2 !w-48 sm:!w-64"
            />
          </div>
          {onImport && <Button variant="outline" size="sm" onClick={handleImport}><Upload className="w-4 h-4" /> Import</Button>}
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="w-4 h-4" /> Export</Button>
          {onAdd && <Button size="sm" onClick={onAdd}><Plus className="w-4 h-4" /> Tambah</Button>}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <Thead>
              <Tr>
                {columns.map((col) => <Th key={String(col.key)}>{col.label}</Th>)}
                {(onEdit || onDelete) && <Th className="text-right">Aksi</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {paged.length === 0 ? (
                <Tr><Td colSpan={columns.length + 1} className="text-center py-10 text-[var(--text-secondary)]">Tidak ada data</Td></Tr>
              ) : (
                paged.map((row, idx) => (
                  <Tr key={row.id || idx}>
                    {columns.map((col) => (
                      <Td key={String(col.key)}>
                        {col.render ? col.render(row) : String(row[col.key] ?? '')}
                      </Td>
                    ))}
                    {(onEdit || onDelete) && (
                      <Td className="text-right space-x-1">
                        {onEdit && <Button variant="ghost" size="sm" onClick={() => onEdit(row)}>Edit</Button>}
                        {onDelete && <Button variant="danger" size="sm" onClick={() => onDelete(row)}>Hapus</Button>}
                      </Td>
                    )}
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 text-sm">
          <span className="text-[var(--text-secondary)]">
            Menampilkan {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} dari {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3 font-medium">{page} / {totalPages}</span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
`);

// ==========================================
// 4. API ROUTES - MASTER DATA
// ==========================================
console.log('\n🔌 Membuat API Routes Master Data...');

// --- KATEGORI ---
createFile(path.join(ROOT_DIR, 'app/api/master/kategori/route.ts'), `
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const data = await prisma.kategori.findMany({ orderBy: { nama: 'asc' } });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = await prisma.kategori.create({ data: { nama: body.nama, deskripsi: body.deskripsi } });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const data = await prisma.kategori.update({ where: { id: body.id }, data: { nama: body.nama, deskripsi: body.deskripsi } });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await prisma.kategori.delete({ where: { id: id! } });
  return NextResponse.json({ success: true });
}
`);

// --- BRAND ---
createFile(path.join(ROOT_DIR, 'app/api/master/brand/route.ts'), `
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const data = await prisma.brand.findMany({ orderBy: { nama: 'asc' } });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = await prisma.brand.create({ data: { nama: body.nama } });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const data = await prisma.brand.update({ where: { id: body.id }, data: { nama: body.nama } });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  await prisma.brand.delete({ where: { id: searchParams.get('id')! } });
  return NextResponse.json({ success: true });
}
`);

// --- SUPPLIER ---
createFile(path.join(ROOT_DIR, 'app/api/master/supplier/route.ts'), `
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const data = await prisma.supplier.findMany({ orderBy: { nama: 'asc' } });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = await prisma.supplier.create({ data: body });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const data = await prisma.supplier.update({ where: { id: body.id }, data: body });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  await prisma.supplier.delete({ where: { id: searchParams.get('id')! } });
  return NextResponse.json({ success: true });
}
`);

// --- PELANGGAN ---
createFile(path.join(ROOT_DIR, 'app/api/master/pelanggan/route.ts'), `
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const data = await prisma.pelanggan.findMany({ orderBy: { nama: 'asc' } });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = await prisma.pelanggan.create({ data: body });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const data = await prisma.pelanggan.update({ where: { id: body.id }, data: body });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  await prisma.pelanggan.delete({ where: { id: searchParams.get('id')! } });
  return NextResponse.json({ success: true });
}
`);

// --- PRODUK (dengan relasi) ---
createFile(path.join(ROOT_DIR, 'app/api/master/produk/route.ts'), `
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const data = await prisma.produk.findMany({
    include: { kategori: true, brand: true, supplier: true },
    orderBy: { nama: 'asc' },
  });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = await prisma.produk.create({ data: body });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const data = await prisma.produk.update({ where: { id: body.id }, data: body });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // Soft delete: set statusAktif = false
  await prisma.produk.update({ where: { id: searchParams.get('id')! }, data: { statusAktif: false } });
  return NextResponse.json({ success: true });
}

// Bulk import
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const items = body.items as any[];
  let count = 0;
  for (const item of items) {
    try {
      await prisma.produk.upsert({
        where: { barcode: item.barcode },
        update: item,
        create: item,
      });
      count++;
    } catch (e) { /* skip duplicates */ }
  }
  return NextResponse.json({ success: true, imported: count });
}
`);

// ==========================================
// 5. HALAMAN MASTER DATA
// ==========================================
console.log('\n📄 Membuat halaman Master Data...');

// --- KATEGORI PAGE ---
createFile(path.join(ROOT_DIR, 'app/(dashboard)/master/kategori/page.tsx'), `
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
    if (!confirm(\`Hapus kategori "\${row.nama}"?\`)) return;
    await fetch(\`/api/master/kategori?id=\${row.id}\`, { method: 'DELETE' });
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
`);

// --- PRODUK PAGE (Lengkap dengan relasi dropdown) ---
createFile(path.join(ROOT_DIR, 'app/(dashboard)/master/produk/page.tsx'), `
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
    if (!confirm(\`Nonaktifkan produk "\${row.nama}"?\`)) return;
    await fetch(\`/api/master/produk?id=\${row.id}\`, { method: 'DELETE' });
    toast.success('Produk dinonaktifkan'); load();
  };

  const handleImport = async (rows: Record<string, any>[]) => {
    const res = await fetch('/api/master/produk', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: rows }),
    });
    const result = await res.json();
    toast.success(\`\${result.imported} produk berhasil di-import\`);
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
`);

// --- PELANGGAN PAGE ---
createFile(path.join(ROOT_DIR, 'app/(dashboard)/master/pelanggan/page.tsx'), `
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
    if (!confirm(\`Hapus pelanggan "\${row.nama}"?\`)) return;
    await fetch(\`/api/master/pelanggan?id=\${row.id}\`, { method: 'DELETE' });
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
`);

// Update Sidebar untuk navigasi master data
console.log('\n🔄 Updating Sidebar navigasi...');
const sidebarPath = path.join(ROOT_DIR, 'components/layout/Sidebar.tsx');
if (fs.existsSync(sidebarPath)) {
  let content = fs.readFileSync(sidebarPath, 'utf8');
  // Ganti menu Produk single link jadi dropdown/group
  const oldMenu = `{ label: 'Produk', icon: Package, href: '/master/produk' },`;
  const newMenu = `{ label: 'Produk', icon: Package, href: '/master/produk' },
  { label: 'Kategori', icon: Package, href: '/master/kategori' },
  { label: 'Pelanggan', icon: Users, href: '/master/pelanggan' },`;
  if (content.includes(oldMenu)) {
    content = content.replace(oldMenu, newMenu);
    fs.writeFileSync(sidebarPath, content);
    console.log('✅ Updated: Sidebar navigasi master data');
  }
}

// ==========================================
// SELESAI
// ==========================================
console.log('\n===================================================');
console.log('✅ TAHAP 3 SELESAI!');
console.log('===================================================\n');
console.log('Langkah selanjutnya:\n');
console.log('  npm install');
console.log('  npx prisma generate');
console.log('  npm run dev\n');
console.log('📋 Halaman baru tersedia:');
console.log('   /master/produk     → CRUD Produk + Import/Export Excel');
console.log('   /master/kategori   → CRUD Kategori + Export Excel');
console.log('   /master/pelanggan  → CRUD Pelanggan + Export Excel');
console.log('   /api/master/brand  → API Brand (CRUD)');
console.log('   /api/master/supplier → API Supplier (CRUD)\n');
console.log('💡 Tips:');
console.log('   • Buat Kategori & Brand dulu sebelum tambah Produk');
console.log('   • Gunakan tombol Export untuk download template Excel');
console.log('   • Edit file Excel lalu Import kembali untuk bulk add');
console.log('   • Semua data tersimpan di Supabase PostgreSQL\n');