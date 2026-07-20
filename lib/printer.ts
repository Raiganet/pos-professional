// lib/printer.ts - Bluetooth Thermal Printer with Fluent API
let bluetoothDevice: any = null;
let bluetoothCharacteristic: any = null;

export class ThermalPrinter {
  private device: any = null;
  private characteristic: any = null;
  private buffer: number[] = [];

  get isConnected(): boolean {
    return this.device !== null && this.characteristic !== null;
  }

  async connect(): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("Bluetooth API is only available in the browser");
    }
    if (!(window as any).navigator.bluetooth) {
      throw new Error("Web Bluetooth API not supported. Please use Chrome or Edge.");
    }
    try {
      const device = await (window as any).navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
      });
      const server = await device.gatt?.connect();
      if (!server) throw new Error("Failed to connect to GATT server");
      const service = await server.getPrimaryService("000018f0-0000-1000-8000-00805f9b34fb");
      const characteristic = await service.getCharacteristic("00002af1-0000-1000-8000-00805f9b34fb");
      this.device = device;
      this.characteristic = characteristic;
      bluetoothDevice = device;
      bluetoothCharacteristic = characteristic;
    } catch (error) {
      console.error("Bluetooth connection failed:", error);
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

  init(): this {
    this.buffer = [];
    this.buffer.push(0x1B, 0x40);
    return this;
  }

  align(alignment: "left" | "center" | "right"): this {
    const alignMap: Record<string, number> = { left: 0, center: 1, right: 2 };
    this.buffer.push(0x1B, 0x61, alignMap[alignment] || 0);
    return this;
  }

  bold(enabled: boolean): this {
    this.buffer.push(0x1B, 0x45, enabled ? 1 : 0);
    return this;
  }

  size(width: number, height: number): this {
    const w = Math.min(Math.max(width - 1, 0), 7);
    const h = Math.min(Math.max(height - 1, 0), 7);
    this.buffer.push(0x1D, 0x21, (w << 4) | h);
    return this;
  }

  text(content: string): this {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(content);
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
    this.buffer.push(0x0A);
    return this;
  }

  textRaw(content: string): this {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(content);
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
    return this;
  }

  line(char: string = "-"): this {
    return this.text(char.repeat(32));
  }

  doubleLine(): this {
    return this.text("=".repeat(32));
  }

  row(leftText: string, rightText: string, maxWidth: number = 32): this {
    const totalLength = leftText.length + rightText.length;
    const spaceCount = maxWidth - totalLength;
    const padding = " ".repeat(spaceCount > 0 ? spaceCount : 1);
    return this.text(`${leftText}${padding}${rightText}`);
  }

  feed(lines: number = 1): this {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(0x0A);
    }
    return this;
  }

  space(lines: number = 1): this {
    return this.feed(lines);
  }

  getBuffer(): number[] {
    return this.buffer;
  }

  cut(): this {
    this.buffer.push(0x1D, 0x56, 0x00);
    return this;
  }

  async send(): Promise<void> {
    if (!this.characteristic) {
      throw new Error("Printer not connected. Call connect() first.");
    }
    const data = new Uint8Array(this.buffer);
    const chunkSize = 512;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await this.characteristic.writeValueWithoutResponse(chunk);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    this.buffer = [];
  }

  async print(data: string): Promise<void> {
    if (!this.characteristic) {
      throw new Error("Printer not connected");
    }
    const encoder = new TextEncoder();
    const bytes = encoder.encode(data);
    await this.characteristic.writeValueWithoutResponse(bytes);
  }
}

// Fungsi yang dipanggil di page.tsx: printReceipt(characteristic, printer.getBuffer())
export async function printReceipt(characteristic: any, buffer: number[]): Promise<void> {
  if (!characteristic) {
    throw new Error("Printer not connected. Please connect to a Bluetooth printer first.");
  }
  const data = new Uint8Array(buffer);
  const chunkSize = 512;
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await characteristic.writeValueWithoutResponse(chunk);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

export async function connectBluetoothPrinter(): Promise<{ device: any; characteristic: any }> {
  if (typeof window === "undefined") {
    throw new Error("Bluetooth API is only available in the browser");
  }
  if (!(window as any).navigator.bluetooth) {
    throw new Error("Web Bluetooth API not supported. Please use Chrome or Edge.");
  }
  try {
    const device = await (window as any).navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb"],
    });
    const server = await device.gatt?.connect();
    if (!server) throw new Error("Failed to connect to GATT server");
    const service = await server.getPrimaryService("000018f0-0000-1000-8000-00805f9b34fb");
    const characteristic = await service.getCharacteristic("00002af1-0000-1000-8000-00805f9b34fb");
    bluetoothDevice = device;
    bluetoothCharacteristic = characteristic;
    return { device, characteristic };
  } catch (error) {
    console.error("Bluetooth connection failed:", error);
    throw error;
  }
}

export async function printText(text: string): Promise<void> {
  if (!bluetoothCharacteristic) {
    throw new Error("Printer not connected");
  }
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text + "\n\n\n");
  await bluetoothCharacteristic.writeValueWithoutResponse(bytes);
}