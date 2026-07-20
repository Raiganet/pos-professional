const fs = require('fs');
const path = require('path');

const printerPath = path.join(process.cwd(), 'lib', 'printer.ts');

const printerContent = `export async function connectBluetoothPrinter() {
  // 1. Pastikan kode ini hanya berjalan di browser (menghindari error di Vercel/SSR)
  if (typeof window === 'undefined') {
    throw new Error('Bluetooth API is only available in the browser');
  }

  // 2. Cek apakah browser mendukung Web Bluetooth
  if (!(window as any).navigator.bluetooth) {
    throw new Error('Web Bluetooth API not supported. Please use Chrome or Edge.');
  }

  try {
    const device = await (window as any).navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'], // UUID Service Printer Thermal
    });

    const server = await device.gatt?.connect();
    if (!server) throw new Error('Failed to connect to GATT server');

    const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

    return { device, characteristic };
  } catch (error) {
    console.error('Bluetooth connection failed:', error);
    throw error;
  }
}

export async function printText(characteristic: any, text: string) {
  if (!characteristic) throw new Error('No printer connected');
  
  // Konversi teks ke Uint8Array untuk dikirim ke printer
  const encoder = new TextEncoder();
  const data = encoder.encode(text + '\\n\\n\\n'); // Tambahkan line feed di akhir
  
  await characteristic.writeValueWithoutResponse(data);
}
`;

fs.writeFileSync(printerPath, printerContent);
console.log('✅ lib/printer.ts berhasil diperbaiki dengan syntax yang valid!');