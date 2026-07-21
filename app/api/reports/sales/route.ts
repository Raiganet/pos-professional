import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    // Validasi parameter
    if (!start || !end) {
      return NextResponse.json(
        { error: 'Parameter start dan end wajib diisi' },
        { status: 400 }
      );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // Validasi date
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { error: 'Format tanggal tidak valid' },
        { status: 400 }
      );
    }

    // Query transaksi
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        details: {
          include: {
            produk: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Hitung statistik
    const totalRevenue = transactions.reduce((sum, t) => sum + t.grandTotal, 0);
    const totalTransactions = transactions.length;
    const totalItems = transactions.reduce((sum, t) => 
      sum + t.details.reduce((dSum, d) => dSum + d.qty, 0), 0
    );

    // Group by product untuk best sellers
    const productSales: Record<string, any> = {};
    transactions.forEach((t) => {
      t.details.forEach((d) => {
        if (!productSales[d.produkId]) {
          productSales[d.produkId] = {
            nama: d.produk?.nama || 'Unknown',
            qty: 0,
            revenue: 0,
          };
        }
        productSales[d.produkId].qty += d.qty;
        productSales[d.produkId].revenue += d.subtotal;
      });
    });

    const bestSellers = Object.values(productSales)
      .sort((a: any, b: any) => b.qty - a.qty)
      .slice(0, 5);

    return NextResponse.json({
      totalRevenue,
      totalTransactions,
      totalItems,
      bestSellers,
      transactions,
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data laporan' },
      { status: 500 }
    );
  }
}