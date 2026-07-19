import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  heldTransactions: { id: string; items: CartItem[]; timestamp: number }[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  holdTransaction: () => void;
  recallTransaction: (id: string) => void;
  deleteHeldTransaction: (id: string) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      heldTransactions: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, qty: i.qty + item.qty } : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQty: (id, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, qty: Math.max(1, qty) } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      holdTransaction: () =>
        set((state) => ({
          heldTransactions: [
            ...state.heldTransactions,
            { id: crypto.randomUUID(), items: state.items, timestamp: Date.now() },
          ],
          items: [],
        })),
      recallTransaction: (id) =>
        set((state) => {
          const held = state.heldTransactions.find((t) => t.id === id);
          if (!held) return state;
          return {
            items: held.items,
            heldTransactions: state.heldTransactions.filter((t) => t.id !== id),
          };
        }),
      deleteHeldTransaction: (id) =>
        set((state) => ({
          heldTransactions: state.heldTransactions.filter((t) => t.id !== id),
        })),
    }),
    { name: 'pos-cart-storage' }
  )
);
