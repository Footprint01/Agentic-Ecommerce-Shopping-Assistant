import { create } from 'zustand';

// Product interface matching the new database structure
export interface Product {
  id: number | string;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  mainCategory: string; // Added to match productDatabase
  subcategory: string;  // Made required to match productDatabase
  thumbnail: string;
  images: string[];
}

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  currency: 'USD' | 'INR';
  addItem: (product: Product) => void;
  removeItem: (productId: number | string) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
  setCurrency: (currency: 'USD' | 'INR') => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  currency: 'USD',
  addItem: (product) => {
    const { items } = get();
    const existingItem = items.find((item) => item.id === product.id);
    if (existingItem) {
      set({
        items: items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      });
    } else {
      set({ items: [...items, { ...product, quantity: 1 }] });
    }
  },
  removeItem: (productId) => {
    set({ items: get().items.filter((item) => item.id !== productId) });
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
    } else {
      set({
        items: get().items.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        ),
      });
    }
  },
  toggleCart: () => set({ isOpen: !get().isOpen }),
  clearCart: () => set({ items: [] }),
  setCurrency: (currency) => set({ currency }),
  total: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
}));
