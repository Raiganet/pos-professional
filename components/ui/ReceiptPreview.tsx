'use client';
import { formatRupiah } from '@/lib/utils';

interface ReceiptProps {
  storeName: string;
  address: string;
  transaction: any;
}

export function ReceiptPreview({ storeName, address, transaction }: ReceiptProps) {
  if (!transaction) return null;

  return (
    <div className="bg-white text-black p-4 font-mono text-xs w-[300px] mx-auto shadow-lg">
      <div className="text-center mb-2">
        <h2 className="font-bold text-sm uppercase">{storeName}</h2>
        <p>{address}</p>
        <p>Telp: 0812-3456-7890</p>
      </div>
      
      <div className="border-b border-dashed border-black my-2"></div>
      
      <div className="flex justify-between">
        <span>No: {transaction.nomor}</span>
        <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="flex justify-between">
        <span>Kasir: {transaction.user?.name || 'Admin'}</span>
      </div>

      <div className="border-b border-dashed border-black my-2"></div>

      <div className="space-y-1">
        {transaction.details.map((item: any) => (
          <div key={item.id}>
            <div className="flex justify-between">
              <span>{item.produk?.nama}</span>
              <span>{formatRupiah(item.harga * item.qty)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{item.qty} x {formatRupiah(item.harga)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-b border-dashed border-black my-2"></div>

      <div className="flex justify-between font-bold">
        <span>Total</span>
        <span>{formatRupiah(transaction.grandTotal)}</span>
      </div>
      <div className="flex justify-between">
        <span>Bayar ({transaction.metodeBayar})</span>
        <span>{formatRupiah(transaction.bayar)}</span>
      </div>
      <div className="flex justify-between">
        <span>Kembali</span>
        <span>{formatRupiah(transaction.kembalian)}</span>
      </div>

      <div className="border-b border-dashed border-black my-2"></div>
      
      <div className="text-center mt-4">
        <p>Terima Kasih</p>
        <p>Selamat Berbelanja Kembali</p>
        <div className="mt-2 h-16 bg-gray-100 flex items-center justify-center text-gray-400">
          [QR CODE]
        </div>
      </div>
    </div>
  );
}
