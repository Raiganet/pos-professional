import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Riwayat mutasi + jumlah mutasi hari ini
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const tipe = searchParams.get('tipe');

  const where: any = {};
  if (tipe) where.tipe = tipe;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [data, total, todayCount] = await Promise.all([
    prisma.stokMovement.findMany({
      where,
      include: { produk: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stokMovement.count({ where }),
    prisma.stokMovement.count({ where: { createdAt: { gte: startOfDay } } }),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    todayCount,
  });
}

// POST - Stock In / Out / Opname
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tipe, items, referensi, catatan } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Daftar produk kosong' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const { produkId, jumlah } = item;
        if (!produkId || !jumlah || jumlah <= 0) {
          throw new Error('Produk dan jumlah wajib diisi (> 0)');
        }

        const prod = await tx.produk.findUnique({
          where: { id: produkId },
          select: { stok: true },
        });
        const stokLama = prod?.stok ?? 0;
        let jumlahMovement = jumlah;

        if (tipe === 'IN') {
          await tx.produk.update({
            where: { id: produkId },
            data: { stok: { increment: jumlah } },
          });
        } else if (tipe === 'OUT') {
          if (stokLama < jumlah) {
            throw new Error(`Stok tidak cukup (sisa ${stokLama})`);
          }
          await tx.produk.update({
            where: { id: produkId },
            data: { stok: { decrement: jumlah } },
          });
        } else if (tipe === 'ADJUSTMENT') {
          // Opname: "jumlah" = stok fisik akhir yang diinginkan
          jumlahMovement = Math.abs(jumlah - stokLama);
          await tx.produk.update({
            where: { id: produkId },
            data: { stok: { set: jumlah } },
          });
        }
        // TRANSFER / lainnya: stok tidak diubah, hanya dicatat

        await tx.stokMovement.create({
          data: {
            produkId,
            tipe,
            jumlah: jumlahMovement,
            referensi: referensi || null,
            catatan: catatan || null,
          },
        });
      }
      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Stock Error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}