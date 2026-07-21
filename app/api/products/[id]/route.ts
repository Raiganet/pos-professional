// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { barcode, nama, harga, stok, gambar, kategori, deskripsi } = body;

    const product = await prisma.produk.update({
      where: { id: params.id },
      data: {
        barcode, nama, harga: parseInt(harga), stok: parseInt(stok),
        gambar: gambar || null, kategoriId: kategori || null, deskripsi: deskripsi || null,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update produk' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.produk.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal hapus produk' }, { status: 500 });
  }
}