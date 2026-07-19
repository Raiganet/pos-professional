import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const data = await prisma.produk.findMany({
    include: { kategori: true, brand: true, supplier: true },
    orderBy: { nama: 'asc' },
  });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = await prisma.produk.create({ data: body });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const data = await prisma.produk.update({ where: { id: body.id }, data: body });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // Soft delete: set statusAktif = false
  await prisma.produk.update({ where: { id: searchParams.get('id')! }, data: { statusAktif: false } });
  return NextResponse.json({ success: true });
}

// Bulk import
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const items = body.items as any[];
  let count = 0;
  for (const item of items) {
    try {
      await prisma.produk.upsert({
        where: { barcode: item.barcode },
        update: item,
        create: item,
      });
      count++;
    } catch (e) { /* skip duplicates */ }
  }
  return NextResponse.json({ success: true, imported: count });
}
