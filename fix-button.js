const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'components', 'ui', 'Button.tsx');

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Ganti {...props} dengan {...(props as any)} untuk menghindari konflik tipe framer-motion
  content = content.replace('{...props}', '{...(props as any)}');
  
  fs.writeFileSync(filePath, content);
  console.log('✅ File Button.tsx berhasil diperbaiki!');
} else {
  console.log('❌ File Button.tsx tidak ditemukan.');
}