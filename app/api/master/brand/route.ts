import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const data = await prisma.brand.findMany({ orderBy: { nama: 'asc' } });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = await prisma.brand.create({ data: { nama: body.nama } });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const data = await prisma.brand.update({ where: { id: body.id }, data: { nama: body.nama } });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  await prisma.brand.delete({ where: { id: searchParams.get('id')! } });
  return NextResponse.json({ success: true });
}
