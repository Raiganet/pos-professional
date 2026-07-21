'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'sonner';
import { formatRupiah } from '@/lib/utils';
import type { Produk } from '@/types';

export default function ProdukPage() {
  const [products, setProducts] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produk | null>(null);
  const [formData, setFormData] = useState({
    barcode: '',
    nama: '',
    harga: '',
    stok: '',
    gambar: '',
    kategori: '',
    deskripsi: '',
  });

  // Fetch products dari database
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      toast.error('Gagal mengambil data produk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle submit (create/update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products';

      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      toast.success(editingProduct ? 'Produk berhasil diupdate' : 'Produk berhasil ditambahkan');
      setModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Terjadi kesalahan');
    }
  };

  // Handle delete
  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Yakin ingin menghapus produk "${nama}"?`)) return;

    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      toast.success('Produk berhasil dihapus');
      fetchProducts();
    } catch (error) {
      toast.error('Gagal menghapus produk');
    }
  };

  // Handle edit
  const handleEdit = (product: Produk) => {
    setEditingProduct(product);
    setFormData({
      barcode: product.barcode,
      nama: product.nama,
      harga: product.harga.toString(),
      stok: product.stok.toString(),
      gambar: product.gambar || '',
      kategori: product.kategoriId || '',
      deskripsi: product.deskripsi || '',
    });
    setModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      barcode: '',
      nama: '',
      harga: '',
      stok: '',
      gambar: '',
      kategori: '',
      deskripsi: '',
    });
    setEditingProduct(null);
  };

  // Filter products
  const filteredProducts = products.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Produk</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Kelola produk dan stok barang
          </p>
        </div>
        <Button onClick={() => { resetForm(); setModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Tambah Produk
        </Button>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <Input
            placeholder="Cari produk berdasarkan nama atau barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left py-3 px-4 font-semibold">Produk</th>
                <th className="text-left py-3 px-4 font-semibold">Barcode</th>
                <th className="text-left py-3 px-4 font-semibold">Harga</th>
                <th className="text-left py-3 px-4 font-semibold">Stok</th>
                <th className="text-left py-3 px-4 font-semibold">Kategori</th>
                <th className="text-right py-3 px-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--text-secondary)]">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--text-secondary)]">
                    Tidak ada produk. Klik &quot;Tambah Produk&quot; untuk menambahkan.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {product.gambar ? (
                          <img
                            src={product.gambar}
                            alt={product.nama}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-bold">
                              {product.nama.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{product.nama}</p>
                          {product.deskripsi && (
                            <p className="text-xs text-[var(--text-secondary)] truncate max-w-xs">
                              {product.deskripsi}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm">{product.barcode}</td>
                    <td className="py-3 px-4 font-semibold">{formatRupiah(product.harga)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stok > 0
                            ? 'bg-success/10 text-success'
                            : 'bg-danger/10 text-danger'
                        }`}
                      >
                        {product.stok}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{product.kategoriId || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.nama)}
                          className="p-2 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title={editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Barcode *</label>
              <Input
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="8996001600016"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Kategori ID</label>
              <Input
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                placeholder="Opsional"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nama Produk *</label>
            <Input
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder="Indomie Goreng"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Deskripsi</label>
            <Input
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              placeholder="Mie instan rasa goreng"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Harga *</label>
              <Input
                type="number"
                value={formData.harga}
                onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                placeholder="3500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stok</label>
              <Input
                type="number"
                value={formData.stok}
                onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">URL Gambar</label>
            <Input
              value={formData.gambar}
              onChange={(e) => setFormData({ ...formData, gambar: e.target.value })}
              placeholder="/produk/indomie.jpg"
            />
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Upload gambar ke folder public/produk/ lalu masukkan path-nya
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" /> {editingProduct ? 'Update' : 'Simpan'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setModalOpen(false); resetForm(); }}
            >
              <X className="w-4 h-4 mr-2" /> Batal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}