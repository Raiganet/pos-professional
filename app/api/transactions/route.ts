import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateNomorTransaksi } from '@/lib/utils';

// GET - Ambil semua transaksi (untuk halaman Riwayat)
export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        details: { include: { produk: true } },
        user: true,
        pelanggan: true,
        payments: true,
      },
    });
    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error('GET transactions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Buat transaksi baru (dari POS)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items, subtotal, diskon, pajak, grandTotal,
      bayar, kembalian, metodeBayar, catatan, userId, pelangganId,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart kosong' }, { status: 400 });
    }

    // userId aman: pakai hanya kalau user-nya benar-benar ada di DB (hindari FK error)
    let safeUserId: string | null = null;
    if (userId && userId !== 'demo-user-id') {
      const u = await prisma.user.findUnique({ where: { id: userId } });
      if (u) safeUserId = userId;
    }

    // pelangganId aman: cek keberadaan dulu
    let safePelangganId: string | null = null;
    if (pelangganId) {
      const p = await prisma.pelanggan.findUnique({ where: { id: pelangganId } });
      if (p) safePelangganId = pelangganId;
    }

    const nomor = generateNomorTransaksi();

    const transaction = await prisma.transaction.create({
      data: {
        nomor,
        userId: safeUserId,
        pelangganId: safePelangganId,
        subtotal,
        diskon: diskon || 0,
        pajak,
        grandTotal,
        bayar,
        kembalian,
        metodeBayar,
        catatan: catatan || null,
        details: {
          create: items.map((item: any) => ({
            produkId: item.id,
            qty: item.qty,
            harga: item.harga,
            diskon: item.diskon || 0,
            subtotal: item.qty * item.harga - (item.diskon || 0),
            catatan: item.catatan || null,
          })),
        },
        payments: {
          create: {
            metode: metodeBayar,
            jumlah: bayar,
          },
        },
      },
      include: {
        details: { include: { produk: true } },
        payments: true,
      },
    });

    // Kurangi stok + catat pergerakan stok
    for (const item of items) {
      await prisma.produk.update({
        where: { id: item.id },
        data: { stok: { decrement: item.qty } },
      });
      await prisma.stokMovement.create({
        data: {
          produkId: item.id,
          tipe: 'OUT',
          jumlah: item.qty,
          referensi: nomor,
          catatan: 'Penjualan POS',
        },
      });
    }

    return NextResponse.json({ success: true, transaction });
  } catch (error: any) {
    console.error('Transaction Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}