'use client';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatRupiah } from '@/lib/utils';
import { ReceiptPreview } from '@/components/ui/ReceiptPreview';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';

export default function HistoryPage() {
  const [data, setData] = useState([]);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  useEffect(() => {
    fetch('/api/reports/sales').then(r => r.json()).then(d => setData(d.transactions));
  }, []);

  const columns = [
    { key: 'nomor', label: 'No Transaksi' },
    { key: 'createdAt', label: 'Waktu', render: (r: any) => new Date(r.createdAt).toLocaleString('id-ID') },
    { key: 'grandTotal', label: 'Total', render: (r: any) => formatRupiah(r.grandTotal) },
    { key: 'metodeBayar', label: 'Metode' },
  ];

  return (
    <>
      <DataTable
        title="📜 Riwayat Transaksi"
        columns={[...columns, { key: 'action', label: 'Aksi', render: (r: any) => (
          <Button size="sm" variant="outline" onClick={() => setSelectedTx(r)}>
            <Printer className="w-4 h-4 mr-2" /> Cetak Ulang
          </Button>
        )}]}
        data={data}
        searchKeys={['nomor']}
        exportFilename="riwayat_transaksi"
      />

      <Modal open={!!selectedTx} onClose={() => setSelectedTx(null)} title="Preview Struk">
        <div className="flex flex-col items-center">
          <ReceiptPreview 
            storeName="TOKO MAJU JAYA" 
            address="Jl. Sudirman No. 10" 
            transaction={selectedTx} 
          />
          <Button className="w-full mt-6" onClick={() => {
            toast.info('Fitur cetak ulang via Bluetooth aktif');
            // Call print logic here similar to POS page
          }}>
            Cetak ke Printer Thermal
          </Button>
        </div>
      </Modal>
    </>
  );
}
