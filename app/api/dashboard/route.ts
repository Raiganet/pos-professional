import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const NAMA_HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

// Hitung persentase pertumbuhan dengan aman (hindari bagi nol)
function safeTrend(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

export async function GET() {
  // Nilai default → dipakai kalau DB error, supaya UI tidak crash
  const defaults = {
    penjualanHariIni: 0, transaksiHariIni: 0, totalMember: 0, totalProduk: 0,
    trendPenjualan: 0, trendTransaksi: 0, trendMember: 0, trendProduk: 0,
    salesData: [] as any[], topProducts: [] as any[], lowStock: [] as any[], recent: [] as any[],
  };

  try {
    const now = new Date();
    const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
    const startYesterday = new Date(startToday); startYesterday.setDate(startYesterday.getDate() - 1);
    const start7 = new Date(startToday); start7.setDate(start7.getDate() - 6);
    const start14 = new Date(start7); start14.setDate(start14.getDate() - 7);

    const [
      aggToday, aggYesterday, countTxToday, countTxYesterday,
      totalMember, memberBaru7, memberPrev7,
      products, topGroup, recentTx, recentMv, sales7,
    ] = await Promise.all([
      prisma.transaction.aggregate({ _sum: { grandTotal: true }, where: { createdAt: { gte: startToday } } }),
      prisma.transaction.aggregate({ _sum: { grandTotal: true }, where: { createdAt: { gte: startYesterday, lt: startToday } } }),
      prisma.transaction.count({ where: { createdAt: { gte: startToday } } }),
      prisma.transaction.count({ where: { createdAt: { gte: startYesterday, lt: startToday } } }),
      prisma.pelanggan.count(),
      prisma.pelanggan.count({ where: { createdAt: { gte: start7 } } }),
      prisma.pelanggan.count({ where: { createdAt: { gte: start14, lt: start7 } } }),
      prisma.produk.findMany({ select: { id: true, nama: true, stok: true } }),
      prisma.detailTransaksi.groupBy({
        by: ['produkId'],
        _sum: { qty: true, subtotal: true },
        orderBy: { _sum: { subtotal: 'desc' } },
        take: 5,
      }),
      prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' }, take: 4,
        select: { nomor: true, createdAt: true, user: { select: { name: true } } },
      }),
      prisma.stokMovement.findMany({
        orderBy: { createdAt: 'desc' }, take: 4,
        include: { produk: { select: { nama: true } } },
      }),
      prisma.transaction.findMany({
        where: { createdAt: { gte: start7 } },
        select: { createdAt: true, grandTotal: true },
      }),
    ]);

    const penjualanHariIni = aggToday._sum.grandTotal || 0;
    const penjualanKemarin = aggYesterday._sum.grandTotal || 0;
    const transaksiHariIni = countTxToday;

    const nameMap: Record<string, string> = {};
    products.forEach((p) => { nameMap[p.id] = p.nama; });

    const perHari: Record<string, number> = {};
    sales7.forEach((t) => {
      const key = t.createdAt.toISOString().slice(0, 10);
      perHari[key] = (perHari[key] || 0) + t.grandTotal;
    });
    const salesData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(startToday); d.setDate(d.getDate() - i);
      salesData.push({ hari: NAMA_HARI[d.getDay()], penjualan: perHari[d.toISOString().slice(0, 10)] || 0 });
    }

    const recent = [
      ...recentTx.map((t) => ({ aksi: `Transaksi ${t.nomor}`, user: t.user?.name || 'Kasir', createdAt: t.createdAt })),
      ...recentMv.map((m) => {
        const sign = m.tipe === 'IN' ? '+' : m.tipe === 'OUT' ? '-' : '';
        return { aksi: `Stok ${m.tipe}: ${m.produk?.nama || '-'} ${sign}${m.jumlah}`, user: 'Gudang', createdAt: m.createdAt };
      }),
    ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 4);

    return NextResponse.json({
      penjualanHariIni,
      transaksiHariIni,
      totalMember,
      totalProduk: products.length,
      trendPenjualan: safeTrend(penjualanHariIni, penjualanKemarin),
      trendTransaksi: safeTrend(transaksiHariIni, countTxYesterday),
      trendMember: safeTrend(memberBaru7, memberPrev7),
      trendProduk: 0,
      salesData,
      topProducts: topGroup.map((g) => ({
        nama: nameMap[g.produkId] || 'Produk',
        terjual: g._sum.qty || 0,
        revenue: g._sum.subtotal || 0,
      })),
      lowStock: products.filter((p) => (p.stok ?? 0) <= 10).slice(0, 5).map((p) => ({
        nama: p.nama, stok: p.stok, min: 10,
      })),
      recent,
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    return NextResponse.json(defaults, { status: 200 });
  }
}