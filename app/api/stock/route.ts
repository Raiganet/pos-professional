import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const tipe = searchParams.get('tipe'); // IN, OUT, ADJUSTMENT, TRANSFER

  const where: any = {};
  if (tipe) where.tipe = tipe;

  const [data, total] = await Promise.all([
    prisma.stokMovement.findMany({
      where,
      include: { produk: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.stokMovement.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tipe, items, referensi, catatan } = body;

    // Mulai transaksi database untuk konsistensi data
    const result = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const { produkId, jumlah } = item;
        
        // Update stok di tabel Produk
        let newStok = 0;
        if (tipe === 'IN') {
          await tx.produk.update({ where: { id: produkId }, data: { stok: { increment: jumlah } } });
        } else if (tipe === 'OUT' || tipe === 'ADJUSTMENT') {
          // Cek stok cukup tidak
          const prod = await tx.produk.findUnique({ where: { id: produkId }, select: { stok: true } });
          if (prod && prod.stok < jumlah && tipe === 'OUT') {
            throw new Error(`Stok ${produkId} tidak cukup!`);
          }
          await tx.produk.update({ 
            where: { id: produkId }, 
            data: { stok: tipe === 'ADJUSTMENT' ? { set: jumlah } : { decrement: jumlah } } 
          });
        }

        // Catat di StokMovement
        await tx.stokMovement.create({
          data: {
            produkId,
            tipe,
            jumlah: tipe === 'ADJUSTMENT' ? Math.abs(jumlah - (await tx.produk.findUnique({where:{id:produkId},select:{stok:true}}))!.stok + jumlah) : jumlah, // Simplified logic for demo
            referensi,
            catatan,
          }
        });
      }
      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
