// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.produk.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barcode, nama, harga, stok, gambar, kategori, deskripsi } = body;

    if (!barcode || !nama || !harga) {
      return NextResponse.json({ error: 'Barcode, nama, dan harga wajib diisi' }, { status: 400 });
    }

    const existing = await prisma.produk.findUnique({ where: { barcode } });
    if (existing) {
      return NextResponse.json({ error: 'Barcode sudah digunakan' }, { status: 400 });
    }

    const product = await prisma.produk.create({
      data: {
        barcode, nama, harga: parseInt(harga), stok: parseInt(stok) || 0,
        gambar: gambar || null, kategoriId: kategori || null, deskripsi: deskripsi || null,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menambah produk' }, { status: 500 });
  }
}