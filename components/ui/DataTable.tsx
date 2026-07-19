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
        toast.success(`${rows.length} data berhasil di-import`);
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
