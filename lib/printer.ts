// lib/printer.ts - Bluetooth Thermal Printer Utility

let bluetoothDevice: any = null;
let bluetoothCharacteristic: any = null;

// Class ThermalPrinter untuk manajemen koneksi dan cetak
export class ThermalPrinter {
  private device: any = null;
  private characteristic: any = null;

  get isConnected(): boolean {
    return this.device !== null && this.characteristic !== null;
  }

  async connect(): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Bluetooth API is only available in the browser');
    }

    if (!(window as any).navigator.bluetooth) {
      throw new Error('Web Bluetooth API not supported. Please use Chrome or Edge.');
    }

    try {
      const device = await (window as any).navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'],
      });

      const server = await device.gatt?.connect();
      if (!server) throw new Error('Failed to connect to GATT server');

      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      this.device = device;
      this.characteristic = characteristic;
      bluetoothDevice = device;
      bluetoothCharacteristic = characteristic;
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
    bluetoothDevice = null;
    bluetoothCharacteristic = null;
  }

  async print(data: string): Promise<void> {
    if (!this.characteristic) {
      throw new Error('Printer not connected');
    }
    const encoder = new TextEncoder();
    const bytes = encoder.encode(data);
    await this.characteristic.writeValueWithoutResponse(bytes);
  }

  async printReceipt(receiptData: ReceiptData): Promise<void> {
    const text = formatReceipt(receiptData);
    await this.print(text);
  }
}

// Interface untuk data struk
export interface ReceiptData {
  storeName: string;
  address?: string;
  phone?: string;
  transactionNo: string;
  date: string;
  cashier?: string;
  items: Array<{
    name: string;
    qty: number;
    price: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  paid: number;
  change: number;
  paymentMethod?: string;
  customerName?: string;
}

// Format struk menjadi teks ESC/POS
function formatReceipt(data: ReceiptData): string {
  const line = '================================\n';
  const thinLine = '--------------------------------\n';
  let receipt = '';

  // Header
  receipt += '\n\n';
  receipt += centerText(data.storeName, 32) + '\n';
  if (data.address) receipt += centerText(data.address, 32) + '\n';
  if (data.phone) receipt += centerText(data.phone, 32) + '\n';
  receipt += line;

  // Info Transaksi
  receipt += 'No: ' + data.transactionNo + '\n';
  receipt += 'Tgl: ' + data.date + '\n';
  if (data.cashier) receipt += 'Kasir: ' + data.cashier + '\n';
  if (data.customerName) receipt += 'Pelanggan: ' + data.customerName + '\n';
  receipt += thinLine;

  // Items
  receipt += padRight('Item', 16) + padLeft('Qty', 4) + padLeft('Harga', 6) + padLeft('Total', 6) + '\n';
  receipt += thinLine;

  data.items.forEach((item) => {
    receipt += padRight(item.name.substring(0, 16), 16);
    receipt += padLeft(String(item.qty), 4);
    receipt += padLeft(formatNumber(item.price), 6);
    receipt += padLeft(formatNumber(item.subtotal), 6) + '\n';
  });

  receipt += thinLine;

  // Totals
  receipt += padRight('Subtotal', 22) + padLeft(formatNumber(data.subtotal), 10) + '\n';
  if (data.discount && data.discount > 0) {
    receipt += padRight('Diskon', 22) + padLeft('-' + formatNumber(data.discount), 10) + '\n';
  }
  if (data.tax && data.tax > 0) {
    receipt += padRight('Pajak', 22) + padLeft(formatNumber(data.tax), 10) + '\n';
  }
  receipt += line;
  receipt += padRight('TOTAL', 22) + padLeft(formatNumber(data.total), 10) + '\n';
  receipt += thinLine;
  receipt += padRight('Bayar (' + (data.paymentMethod || 'Cash') + ')', 22) + padLeft(formatNumber(data.paid), 10) + '\n';
  receipt += padRight('Kembalian', 22) + padLeft(formatNumber(data.change), 10) + '\n';
  receipt += line;

  // Footer
  receipt += '\n';
  receipt += centerText('Terima Kasih!', 32) + '\n';
  receipt += centerText('Barang yang sudah dibeli', 32) + '\n';
  receipt += centerText('tidak dapat ditukar/dikembalikan', 32) + '\n';
  receipt += '\n\n\n';

  return receipt;
}

// Helper functions
function centerText(text: string, width: number): string {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(padding) + text;
}

function padRight(text: string, length: number): string {
  return text.substring(0, length).padEnd(length);
}

function padLeft(text: string, length: number): string {
  return text.substring(0, length).padStart(length);
}

function formatNumber(num: number): string {
  return num.toLocaleString('id-ID');
}

// Export fungsi standalone untuk kompatibilitas
export async function connectBluetoothPrinter(): Promise<{ device: any; characteristic: any }> {
  if (typeof window === 'undefined') {
    throw new Error('Bluetooth API is only available in the browser');
  }

  if (!(window as any).navigator.bluetooth) {
    throw new Error('Web Bluetooth API not supported. Please use Chrome or Edge.');
  }

  try {
    const device = await (window as any).navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb'],
    });

    const server = await device.gatt?.connect();
    if (!server) throw new Error('Failed to connect to GATT server');

    const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

    bluetoothDevice = device;
    bluetoothCharacteristic = characteristic;

    return { device, characteristic };
  } catch (error) {
    console.error('Bluetooth connection failed:', error);
    throw error;
  }
}

export async function printReceipt(receiptData: ReceiptData): Promise<void> {
  if (!bluetoothCharacteristic) {
    throw new Error('Printer not connected. Please connect to a Bluetooth printer first.');
  }

  const text = formatReceipt(receiptData);
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  await bluetoothCharacteristic.writeValueWithoutResponse(bytes);
}

export async function printText(text: string): Promise<void> {
  if (!bluetoothCharacteristic) {
    throw new Error('Printer not connected');
  }
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text + '\n\n\n');
  await bluetoothCharacteristic.writeValueWithoutResponse(bytes);
}
