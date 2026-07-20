const fs = require('fs');
const path = require('path');

console.log('🔧 Memperbaiki halaman POS secara menyeluruh...\n');

const posPath = path.join(process.cwd(), 'app', '(dashboard)', 'pos', 'page.tsx');

if (fs.existsSync(posPath)) {
  let content = fs.readFileSync(posPath, 'utf8');
  
  // 1. Pastikan 'use client' ada di paling atas
  if (!content.startsWith("'use client'") && !content.startsWith('"use client"')) {
    content = "'use client';\n\n" + content;
  }
  
  // 2. Bungkus semua kode yang menggunakan window/navigator dengan check
  content = content.replace(
    /if \(!navigator\.bluetooth\)/g,
    "if (typeof window === 'undefined' || !(window as any).bluetooth)"
  );
  
  content = content.replace(
    /navigator\.bluetooth\.requestDevice/g,
    "(window as any).bluetooth.requestDevice"
  );
  
  // 3. Pastikan semua useState ada di top level (bukan di dalam if/loop)
  // Ini perlu diperiksa manual
  
  fs.writeFileSync(posPath, content);
  console.log('✅ File POS page.tsx diperbaiki\n');
}

// 4. Periksa file lib/printer.ts
const printerPath = path.join(process.cwd(), 'lib', 'printer.ts');
if (fs.existsSync(printerPath)) {
  let content = fs.readFileSync(printerPath, 'utf8');
  
  // Pastikan ada check untuk window
  if (!content.includes("typeof window !== 'undefined'")) {
    content = content.replace(
      /export async function connectBluetoothPrinter\(\)/,
      "export async function connectBluetoothPrinter()\n  if (typeof window === 'undefined') {\n    throw new Error('Bluetooth API only available in browser');\n  }"
    );
  }
  
  fs.writeFileSync(printerPath, content);
  console.log('✅ File printer.ts diperbaiki\n');
}

console.log('📝 Periksa manual file POS page.tsx:');
console.log('   1. Pastikan semua useState/useEffect ada di TOP LEVEL');
console.log('   2. JANGAN panggil hooks di dalam if/for/while');
console.log('   3. Akses window/navigator HANYA di dalam useEffect');
console.log('   4. Jangan akses browser API di level module/component body');