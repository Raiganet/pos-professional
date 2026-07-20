const fs = require('fs');
const path = require('path');

console.log(' Memperbaiki halaman POS...\n');

const posPath = path.join(process.cwd(), 'app', '(dashboard)', 'pos', 'page.tsx');

if (fs.existsSync(posPath)) {
  let content = fs.readFileSync(posPath, 'utf8');
  
  // 1. Pastikan semua kode yang menggunakan window/navigator dibungkus dengan useEffect
  // atau conditional check untuk typeof window !== 'undefined'
  
  // 2. Tambahkan 'use client' di paling atas jika belum ada
  if (!content.startsWith("'use client'") && !content.startsWith('"use client"')) {
    content = "'use client';\n" + content;
  }
  
  // 3. Fix Bluetooth access - bungkus dengan check window
  content = content.replace(
    /if \(!navigator\.bluetooth\)/g,
    "if (typeof window === 'undefined' || !(window as any).bluetooth)"
  );
  
  content = content.replace(
    /navigator\.bluetooth\.requestDevice/g,
    "(window as any).bluetooth.requestDevice"
  );
  
  // 4. Pastikan semua useState hooks ada di top level (tidak di dalam if/loop)
  // Ini sudah seharusnya benar, tapi kita pastikan
  
  fs.writeFileSync(posPath, content);
  console.log('✅ Halaman POS diperbaiki\n');
  
  console.log('📝 Periksa manual hal-hal berikut di file POS:');
  console.log('   1. Pastikan semua useState/useEffect ada di top level');
  console.log('   2. Jangan panggil hooks di dalam if/for/while');
  console.log('   3. Akses window/navigator hanya di useEffect atau setelah check typeof window');
  console.log('   4. Pastikan tidak ada kode yang mengakses browser API di level module');
} else {
  console.log('❌ File POS tidak ditemukan');
}