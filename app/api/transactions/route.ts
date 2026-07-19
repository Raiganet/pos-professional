import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateNomorTransaksi } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, subtotal, diskon, pajak, grandTotal, bayar, kembalian, metodeBayar, catatan, userId, pelangganId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart kosong' }, { status: 400 });
    }

    const nomor = generateNomorTransaksi();

    const transaction = await prisma.transaction.create({
      data: {
        nomor,
        userId: userId || 'demo-user-id', // Ganti dengan auth user di tahap selanjutnya
        pelangganId: pelangganId || null,
        subtotal,
        diskon,
        pajak,
        grandTotal,
        bayar,
        kembalian,
        metodeBayar,
        catatan,
        details: {
          create: items.map((item: any) => ({
            produkId: item.id,
            qty: item.qty,
            harga: item.harga,
            diskon: item.diskon,
            subtotal: item.qty * item.harga - item.diskon,
            catatan: item.catatan,
          })),
        },
        payments: {
          create: {
            metode: metodeBayar,
            jumlah: bayar,
          },
        },
      },
      include: { details: true, payments: true },
    });

    // Kurangi stok
    for (const item of items) {
      await prisma.produk.update({
        where: { id: item.id },
        data: { stok: { decrement: item.qty } },
      });

      // Catat stok movement
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
