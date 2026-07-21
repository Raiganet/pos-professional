'use client';
import { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatRupiah } from '@/lib/utils';
import { ReceiptPreview } from '@/components/ui/ReceiptPreview';
import { Printer, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function HistoryPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/transactions');
        if (!res.ok) throw new Error('Gagal memuat riwayat');
        const json = await res.json();
        // Jaring pengaman: pastikan selalu array
        const list = Array.isArray(json)
          ? json
          : Array.isArray(json?.transactions)
          ? json.transactions
          : [];
        setData(list);
      } catch (e) {
        toast.error('Gagal memuat riwayat transaksi');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const columns = [
    { key: 'nomor', label: 'No Transaksi' },
    {
      key: 'createdAt',
      label: 'Waktu',
      render: (r: any) => new Date(r.createdAt).toLocaleString('id-ID'),
    },
    {
      key: 'grandTotal',
      label: 'Total',
      render: (r: any) => formatRupiah(r.grandTotal),
    },
    { key: 'metodeBayar', label: 'Metode' },
  ];

  return (
    <>
      {loading ? (
        <div className="h-64 flex items-center justify-center glass-card">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <DataTable
          title="📜 Riwayat Transaksi"
          columns={[
            ...columns,
            {
              key: 'action',
              label: 'Aksi',
              render: (r: any) => (
                <Button size="sm" variant="outline" onClick={() => setSelectedTx(r)}>
                  <Printer className="w-4 h-4 mr-2" /> Cetak Ulang
                </Button>
              ),
            },
          ]}
          data={data}
          searchKeys={['nomor']}
          exportFilename="riwayat_transaksi"
        />
      )}

      <Modal open={!!selectedTx} onClose={() => setSelectedTx(null)} title="Preview Struk">
        <div className="flex flex-col items-center">
          {selectedTx && (
            <ReceiptPreview
              storeName="TOKO MAJU JAYA"
              address="Jl. Sudirman No. 10"
              transaction={selectedTx}
            />
          )}
          <Button
            className="w-full mt-6"
            onClick={() => {
              toast.info('Fitur cetak ulang via Bluetooth aktif');
            }}
          >
            Cetak ke Printer Thermal
          </Button>
        </div>
      </Modal>
    </>
  );
}