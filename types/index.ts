export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  color: 'purple' | 'indigo' | 'cyan' | 'emerald' | 'rose';
}

export interface CartItem {
  id: string;
  barcode: string;
  nama: string;
  harga: number;
  qty: number;
  diskon: number;
  catatan?: string;
}

export interface DashboardStats {
  totalPenjualanHariIni: number;
  totalPenjualanBulanIni: number;
  omzet: number;
  profit: number;
  jumlahProduk: number;
  jumlahMember: number;
  jumlahTransaksi: number;
}
