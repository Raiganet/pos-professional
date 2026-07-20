// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - Update produk
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { barcode, nama, harga, stok, gambar, kategori, deskripsi } = body;

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        barcode,
        nama,
        harga: parseInt(harga),
        stok: parseInt(stok),
        gambar: gambar || null,
        kategori: kategori || null,
        deskripsi: deskripsi || null,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Gagal update produk' },
      { status: 500 }
    );
  }
}

// DELETE - Hapus produk
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Gagal hapus produk' },
      { status: 500 }
    );
  }
}