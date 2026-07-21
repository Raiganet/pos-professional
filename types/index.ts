// types/index.ts
export interface CartItem {
  id: string;
  barcode: string;
  nama: string;
  harga: number;
  qty: number;
  diskon: number;
  gambar?: string;
}

export interface Produk {
  id: string;
  barcode: string;
  nama: string;
  harga: number;
  stok: number;
  gambar?: string | null;
  kategoriId?: string | null;
  deskripsi?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  nomor: string;
  subtotal: number;
  diskon: number;
  pajak: number;
  grandTotal: number;
  bayar: number;
  kembalian: number;
  metodeBayar: string;
  userId: string;
  createdAt: string;
  details: TransactionDetail[];
}

export interface TransactionDetail {
  id: string;
  transaksiId: string;
  produkId: string;
  qty: number;
  harga: number;
  subtotal: number;
  produk?: Produk;
}