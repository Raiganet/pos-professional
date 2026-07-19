import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');

  const where: any = {
    createdAt: {
      gte: startDate ? new Date(startDate) : undefined,
      lte: endDate ? new Date(endDate) : undefined,
    },
    status: 'completed'
  };

  // Aggregate Data
  const [summary, transactions] = await Promise.all([
    prisma.transaction.aggregate({
      where,
      _sum: { grandTotal: true, subtotal: true },
      _count: { id: true },
    }),
    prisma.transaction.findMany({
      where,
      include: { user: true, pelanggan: true, details: { include: { produk: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit for demo
    })
  ]);

  // Calculate Profit (Simple: Jual - Modal)
  let totalProfit = 0;
  transactions.forEach(t => {
    t.details.forEach(d => {
      if (d.produk) {
        totalProfit += (d.harga - d.produk.hargaModal) * d.qty;
      }
    });
  });

  return NextResponse.json({
    summary: {
      omzet: summary._sum.grandTotal || 0,
      totalTransaksi: summary._count.id,
      profit: totalProfit
    },
    transactions
  });
}
