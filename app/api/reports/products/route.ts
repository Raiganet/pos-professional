import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');

  const where: any = {
    transaksi: {
      createdAt: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      },
      status: 'completed'
    }
  };

  // Group by Product
  const stats = await prisma.detailTransaksi.groupBy({
    by: ['produkId'],
    where,
    _sum: { qty: true, subtotal: true },
    _count: { id: true },
    orderBy: { _sum: { subtotal: 'desc' } },
    take: 20,
  });

  const products = await Promise.all(
    stats.map(async (s) => {
      const prod = await prisma.produk.findUnique({ where: { id: s.produkId } });
      return {
        nama: prod?.nama || 'Unknown',
        barcode: prod?.barcode || '-',
        terjual: s._sum.qty || 0,
        revenue: s._sum.subtotal || 0,
        count: s._count.id
      };
    })
  );

  return NextResponse.json(products);
}
