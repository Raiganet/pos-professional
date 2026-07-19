import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const data = await prisma.kategori.findMany({ orderBy: { nama: 'asc' } });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = await prisma.kategori.create({ data: { nama: body.nama, deskripsi: body.deskripsi } });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const data = await prisma.kategori.update({ where: { id: body.id }, data: { nama: body.nama, deskripsi: body.deskripsi } });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  await prisma.kategori.delete({ where: { id: id! } });
  return NextResponse.json({ success: true });
}
