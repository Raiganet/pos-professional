const fs = require('fs');
const path = require('path');

// 1. Buat file deklarasi tipe untuk Web Bluetooth API
const bluetoothTypes = `// Type declarations for Web Bluetooth API
interface BluetoothRemoteGATTCharacteristic {
  writeValueWithoutResponse(value: BufferSource): Promise<void>;
  writeValue(value: BufferSource): Promise<void>;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTServer {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothDevice {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
}

interface RequestDeviceOptions {
  filters?: Array<{ services?: string[]; name?: string; namePrefix?: string }>;
  optionalServices?: string[];
  acceptAllDevices?: boolean;
}

interface Bluetooth {
  requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
}

interface Navigator {
  bluetooth: Bluetooth;
}
`;

const typesDir = path.join(process.cwd(), 'types');
if (!fs.existsSync(typesDir)) fs.mkdirSync(typesDir, { recursive: true });
fs.writeFileSync(path.join(typesDir, 'bluetooth.d.ts'), bluetoothTypes);
console.log('✅ Created: types/bluetooth.d.ts');

// 2. Fix lib/printer.ts - cast navigator to any sebagai fallback
const printerPath = path.join(process.cwd(), 'lib', 'printer.ts');
if (fs.existsSync(printerPath)) {
  let content = fs.readFileSync(printerPath, 'utf8');
  content = content.replace(
    'if (!navigator.bluetooth)',
    'if (!(navigator as any).bluetooth)'
  );
  content = content.replace(
    'const device = await navigator.bluetooth.requestDevice',
    'const device = await (navigator as any).bluetooth.requestDevice'
  );
  fs.writeFileSync(printerPath, content);
  console.log('✅ Fixed: lib/printer.ts');
}

console.log('\n✅ Semua perbaikan Bluetooth selesai!');