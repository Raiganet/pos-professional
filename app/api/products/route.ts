// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Ambil semua produk
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    );
  }
}

// POST - Tambah produk baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { barcode, nama, harga, stok, gambar, kategori, deskripsi } = body;

    // Validasi
    if (!barcode || !nama || !harga) {
      return NextResponse.json(
        { error: 'Barcode, nama, dan harga wajib diisi' },
        { status: 400 }
      );
    }

    // Cek barcode duplikat
    const existing = await prisma.product.findUnique({
      where: { barcode },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Barcode sudah digunakan' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        barcode,
        nama,
        harga: parseInt(harga),
        stok: parseInt(stok) || 0,
        gambar: gambar || null,
        kategori: kategori || null,
        deskripsi: deskripsi || null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Gagal menambah produk' },
      { status: 500 }
    );
  }
}