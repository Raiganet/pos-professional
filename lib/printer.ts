// ESC/POS Command Constants
const ESC = '\x1B';
const GS = '\x1D';

export class ThermalPrinter {
  private buffer: number[] = [];

  // Initialize Printer
  init() {
    this.buffer.push(...this.stringToBytes(ESC + '@'));
    return this;
  }

  // Text Formatting
  align(alignment: 'left' | 'center' | 'right') {
    const alignments = { left: 0, center: 1, right: 2 };
    this.buffer.push(...this.stringToBytes(ESC + 'a' + String.fromCharCode(alignments[alignment])));
    return this;
  }

  bold(isBold: boolean) {
    this.buffer.push(...this.stringToBytes(ESC + 'E' + String.fromCharCode(isBold ? 1 : 0)));
    return this;
  }

  size(width: 1 | 2, height: 1 | 2) {
    this.buffer.push(...this.stringToBytes(GS + '!' + String.fromCharCode((width - 1) * 16 + (height - 1))));
    return this;
  }

  // Printing Actions
  feed(lines: number = 1) {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(...this.stringToBytes('\n'));
    }
    return this;
  }

  cut() {
    this.buffer.push(...this.stringToBytes(GS + 'V' + String.fromCharCode(66) + String.fromCharCode(0)));
    return this;
  }

  // Content Helpers
  text(content: string) {
    this.buffer.push(...this.stringToBytes(content + '\n'));
    return this;
  }

  line() {
    this.text('--------------------------------');
    return this;
  }

  row(left: string, right: string) {
    // Simple padding logic for 32-char width printer (58mm)
    const totalWidth = 32;
    const leftLen = left.length;
    const rightLen = right.length;
    const spaces = Math.max(1, totalWidth - leftLen - rightLen);
    this.text(`${left}${' '.repeat(spaces)}${right}`);
    return this;
  }

  qrCode(url: string) {
    // Simplified QR placeholder - in real app use a library to generate bitmap
    // For now, we just print the URL as text or a dummy box
    this.align('center');
    this.text('[ QR CODE PLACEHOLDER ]');
    this.text(url);
    this.align('left');
    return this;
  }

  getBuffer() {
    return new Uint8Array(this.buffer);
  }

  private stringToBytes(str: string): number[] {
    return str.split('').map(c => c.charCodeAt(0));
  }
}

export async function connectBluetoothPrinter() {
  if (!navigator.bluetooth) {
    throw new Error('Web Bluetooth API not supported. Use Chrome/Edge.');
  }

  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['000018f0-0000-1000-8000-00805f9b34fb'] }] // Generic ESC/POS Service UUID
    });
    
    const server = await device.gatt?.connect();
    const service = await server?.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
    const characteristic = await service?.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');
    
    return characteristic;
  } catch (error) {
    console.error('Connection failed:', error);
    throw error;
  }
}

export async function printReceipt(characteristic: any, data: Uint8Array) {
  if (!characteristic) throw new Error('Printer not connected');
  
  // Split data into chunks if necessary (MTU limit usually ~20 bytes, but modern printers handle more)
  const chunkSize = 500; 
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await characteristic.writeValueWithoutResponse(chunk);
  }
}
