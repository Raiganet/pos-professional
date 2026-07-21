'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Minus, Trash2, ShoppingCart, CreditCard,
  Banknote, QrCode, Smartphone, Check, Loader2, Barcode,
  Printer, Bluetooth
} from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { formatRupiah } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import { ThermalPrinter, connectBluetoothPrinter, printReceipt } from '@/lib/printer';
import type { CartItem, Produk } from '@/types';

const PAYMENT_METHODS = [
  { id: 'Cash', label: 'Tunai', icon: Banknote },
  { id: 'QRIS', label: 'QRIS', icon: QrCode },
  { id: 'Transfer', label: 'Transfer Bank', icon: CreditCard },
  { id: 'E-Wallet', label: 'E-Wallet', icon: Smartphone },
];

export default function POSPage() {
  const { items, addItem, removeItem, updateQty, clearCart } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('Cash');
  const [bayarAmount, setBayarAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [products, setProducts] = useState<Produk[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error('Gagal mengambil data produk');
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handlePrint = async () => {
    if (!lastTransaction) return;
    setIsPrinting(true);
    try {
      const { characteristic } = await connectBluetoothPrinter();
      const printer = new ThermalPrinter();
      printer.init()
        .align('center').bold(true).size(2, 2).text('TOKO MAJU JAYA')
        .bold(false).size(1, 1).text('Jl. Sudirman No. 10')
        .align('left').line()
        .row('No Trans', lastTransaction.nomor)
        .row('Tanggal', new Date(lastTransaction.createdAt).toLocaleString('id-ID'))
        .line();
      lastTransaction.details.forEach((item: any) => {
        printer.text(item.produk?.nama || 'Produk');
        printer.row(`${item.qty} x ${formatRupiah(item.harga)}`, formatRupiah(item.subtotal));
      });
      printer.line()
        .row('Subtotal', formatRupiah(lastTransaction.subtotal))
        .row('Pajak', formatRupiah(lastTransaction.pajak))
        .row('TOTAL', formatRupiah(lastTransaction.grandTotal))
        .line()
        .row('Bayar', formatRupiah(lastTransaction.bayar))
        .row('Kembali', formatRupiah(lastTransaction.kembalian))
        .feed(3)
        .cut();
      await printReceipt(characteristic, printer.getBuffer());
      toast.success('Struk berhasil dicetak!');
      setPrintModalOpen(false);
    } catch (e) {
      toast.error('Gagal mencetak. Pastikan printer Bluetooth terhubung.');
    } finally {
      setIsPrinting(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) => p.nama.toLowerCase().includes(q) || p.barcode.includes(q)
    );
  }, [searchQuery, products]);

  const subtotal = items.reduce((sum, i) => sum + i.harga * i.qty, 0);
  const totalDiskon = items.reduce((sum, i) => sum + i.diskon, 0);
  const pajak = Math.round((subtotal - totalDiskon) * 0.11);
  const grandTotal = subtotal - totalDiskon + pajak;
  const bayarNum = parseFloat(bayarAmount) || 0;
  const kembalian = bayarNum - grandTotal;

  const handleAddToCart = (product: Produk) => {
    if (product.stok <= 0) {
      toast.error(`${product.nama} stok habis!`);
      return;
    }
    addItem({
      id: product.id,
      barcode: product.barcode,
      nama: product.nama,
      harga: product.harga,
      qty: 1,
      diskon: 0,
      gambar: product.gambar || undefined,
    });
    toast.success(`${product.nama} ditambahkan`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery) {
      const product = products.find(
        (p) => p.barcode === searchQuery || p.nama.toLowerCase() === searchQuery.toLowerCase()
      );
      if (product) {
        handleAddToCart(product);
        setSearchQuery('');
      } else {
        toast.error('Produk tidak ditemukan');
      }
    }
  };

  const handleCheckout = async () => {
    if (bayarNum < grandTotal) {
      toast.error('Jumlah bayar kurang!');
      return;
    }
    setProcessing(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items, subtotal, diskon: totalDiskon, pajak, grandTotal,
          bayar: bayarNum, kembalian, metodeBayar: selectedPayment, userId: 'demo-user-id',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Transaksi ${data.transaction.nomor} berhasil!`, { duration: 5000 });
        setLastTransaction(data.transaction);
        setPrintModalOpen(true);
        clearCart();
        setCheckoutOpen(false);
        setBayarAmount('');
      } else {
        toast.error(data.error || 'Transaksi gagal');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan koneksi');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="glass-card p-3 mb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <Input
              ref={searchRef}
              placeholder="Scan barcode atau cari produk... (F2)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-10 !py-2.5"
            />
          </div>
          <Button variant="outline" size="md">
            <Barcode className="w-4 h-4" /> Scan
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {loadingProducts ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p>Memuat produk...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleAddToCart(product)}
                    className={`glass-card p-4 cursor-pointer group ${product.stok <= 0 ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-3 overflow-hidden">
                      {product.gambar ? (
                        <img src={product.gambar} alt={product.nama} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingCart className="w-8 h-8 text-primary/40 group-hover:text-primary transition-colors" />
                      )}
                    </div>
                    <p className="font-semibold text-sm truncate">{product.nama}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{product.barcode}</p>
                    <p className="text-primary font-bold mt-2">{formatRupiah(product.harga)}</p>
                    <p className={`text-xs mt-1 font-medium ${product.stok > 0 ? 'text-success' : 'text-danger'}`}>
                      Stok: {product.stok}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredProducts.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-[var(--text-secondary)]">
                  <Search className="w-12 h-12 mb-3 opacity-30" />
                  <p>Produk tidak ditemukan</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-96 flex flex-col glass-card !rounded-2xl overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-white/10">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" /> Keranjang
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{items.length} item</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                className="glass-card !p-3 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <p className="font-medium text-sm flex-1 pr-2">{item.nama}</p>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-danger hover:bg-danger/10 p-1 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center font-semibold text-sm">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-7 h-7 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="font-bold text-sm">{formatRupiah(item.harga * item.qty)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] py-10">
              <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Keranjang kosong</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 space-y-2 bg-white/5">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Pajak (11%)</span>
            <span>{formatRupiah(pajak)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-white/10">
            <span>Total</span>
            <span className="text-primary">{formatRupiah(grandTotal)}</span>
          </div>
          <Button
            className="w-full mt-3 !py-3"
            disabled={items.length === 0}
            onClick={() => setCheckoutOpen(true)}
          >
            Bayar Sekarang
          </Button>
        </div>
      </div>

      <Modal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} title="💳 Pembayaran">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                    selectedPayment === method.id
                      ? 'border-primary bg-primary/10 ring-1 ring-primary'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  <method.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{method.label}</span>
                  {selectedPayment === method.id && <Check className="w-4 h-4 ml-auto text-primary" />}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card !p-4 text-center">
            <p className="text-sm text-[var(--text-secondary)]">Total Tagihan</p>
            <p className="text-3xl font-bold text-primary mt-1">{formatRupiah(grandTotal)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Jumlah Bayar</label>
            <Input
              type="number"
              placeholder="Masukkan nominal..."
              value={bayarAmount}
              onChange={(e) => setBayarAmount(e.target.value)}
              className="!text-lg !font-bold text-center"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              {[grandTotal, Math.ceil(grandTotal / 10000) * 10000, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setBayarAmount(String(amt))}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {formatRupiah(amt)}
                </button>
              ))}
            </div>
          </div>

          {bayarNum >= grandTotal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card !p-4 !bg-success/10 !border-success/20 flex justify-between items-center"
            >
              <span className="font-medium text-success">Kembalian</span>
              <span className="text-xl font-bold text-success">{formatRupiah(kembalian)}</span>
            </motion.div>
          )}

          <Button
            className="w-full !py-3.5 !text-base"
            disabled={processing || bayarNum < grandTotal}
            onClick={handleCheckout}
          >
            {processing ? (
              <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Memproses...</>
            ) : (
              <><Check className="w-5 h-5 mr-2" /> Proses Pembayaran</>
            )}
          </Button>
        </div>
      </Modal>

      <Modal open={printModalOpen} onClose={() => setPrintModalOpen(false)} title="🖨️ Cetak Struk">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Printer className="w-8 h-8 text-primary" />
          </div>
          <p className="text-[var(--text-secondary)]">
            Transaksi berhasil! Apakah Anda ingin mencetak struk?
          </p>
          {lastTransaction && (
            <div className="glass-card !p-3 text-left text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">No. Transaksi</span>
                <span className="font-medium">{lastTransaction.nomor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-secondary)]">Total</span>
                <span className="font-bold text-primary">{formatRupiah(lastTransaction.grandTotal)}</span>
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-center pt-2">
            <Button variant="outline" onClick={() => setPrintModalOpen(false)}>
              Lewati
            </Button>
            <Button onClick={handlePrint} disabled={isPrinting}>
              {isPrinting ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Mencetak...</>
              ) : (
                <><Bluetooth className="w-4 h-4 mr-2" /> Cetak Struk</>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}