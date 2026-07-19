import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const data = await prisma.pelanggan.findMany({ orderBy: { nama: 'asc' } });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const data = await prisma.pelanggan.create({ data: body });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const data = await prisma.pelanggan.update({ where: { id: body.id }, data: body });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  await prisma.pelanggan.delete({ where: { id: searchParams.get('id')! } });
  return NextResponse.json({ success: true });
}
