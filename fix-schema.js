const fs = require('fs');
const path = require('path');

const schemaContent = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  name          String
  role          String   @default("KASIR")
  avatar        String?
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  transactions  Transaction[]
  auditLogs     AuditLog[]
}

model Kategori {
  id        String    @id @default(uuid())
  nama      String    @unique
  deskripsi String?
  createdAt DateTime  @default(now())
  produk    Produk[]
}

model Brand {
  id        String    @id @default(uuid())
  nama      String    @unique
  createdAt DateTime  @default(now())
  produk    Produk[]
}

model Supplier {
  id        String    @id @default(uuid())
  nama      String
  kontak    String?
  alamat    String?
  createdAt DateTime  @default(now())
  produk    Produk[]
}

model Produk {
  id           String    @id @default(uuid())
  barcode      String    @unique
  sku          String    @unique
  nama         String
  kategoriId   String
  brandId      String?
  supplierId   String?
  hargaModal   Float     @default(0)
  hargaJual    Float     @default(0)
  diskon       Float     @default(0)
  pajak        Float     @default(0)
  satuan       String    @default("pcs")
  berat        Float     @default(0)
  stok         Int       @default(0)
  minStok      Int       @default(10)
  foto         String?
  statusAktif  Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  kategori     Kategori  @relation(fields: [kategoriId], references: [id])
  brand        Brand?    @relation(fields: [brandId], references: [id])
  supplier     Supplier? @relation(fields: [supplierId], references: [id])
  detailTransaksi DetailTransaksi[]
  stokMovements StokMovement[]
}

model Pelanggan {
  id          String   @id @default(uuid())
  nama        String
  telepon     String?  @unique
  email       String?
  isMember    Boolean  @default(false)
  poin        Int      @default(0)
  level       String   @default("Regular")
  createdAt   DateTime @default(now())
  transactions Transaction[]
}

model Transaction {
  id          String    @id @default(uuid())
  nomor       String    @unique
  userId      String
  pelangganId String?
  subtotal    Float     @default(0)
  diskon      Float     @default(0)
  pajak       Float     @default(0)
  grandTotal  Float     @default(0)
  bayar       Float     @default(0)
  kembalian   Float     @default(0)
  metodeBayar String    @default("Cash")
  catatan     String?
  status      String    @default("completed")
  createdAt   DateTime  @default(now())
  user        User      @relation(fields: [userId], references: [id])
  pelanggan   Pelanggan? @relation(fields: [pelangganId], references: [id])
  details     DetailTransaksi[]
  payments    Pembayaran[]
}

model DetailTransaksi {
  id            String      @id @default(uuid())
  transaksiId   String
  produkId      String
  qty           Int         @default(1)
  harga         Float       @default(0)
  diskon        Float       @default(0)
  subtotal      Float       @default(0)
  catatan       String?
  transaksi     Transaction @relation(fields: [transaksiId], references: [id], onDelete: Cascade)
  produk        Produk      @relation(fields: [produkId], references: [id])
}

model Pembayaran {
  id          String      @id @default(uuid())
  transaksiId String
  metode      String
  jumlah      Float
  referensi   String?
  createdAt   DateTime    @default(now())
  transaksi   Transaction @relation(fields: [transaksiId], references: [id], onDelete: Cascade)
}

model StokMovement {
  id        String   @id @default(uuid())
  produkId  String
  tipe      String
  jumlah    Int
  referensi String?
  catatan   String?
  createdAt DateTime @default(now())
  produk    Produk   @relation(fields: [produkId], references: [id])
}

model Pengaturan {
  id           String @id @default(uuid())
  key          String @unique
  value        String
  description  String?
}

model AuditLog {
  id        String   @id @default(uuid())
  userId    String
  aksi      String
  entitas   String
  entitasId String?
  detail    String?
  ip        String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
`;

fs.writeFileSync(path.join(__dirname, 'prisma', 'schema.prisma'), schemaContent);
console.log('✅ File prisma/schema.prisma berhasil diperbarui dengan model lengkap!');