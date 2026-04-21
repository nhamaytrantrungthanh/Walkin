import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, UserProfile } from '../types';

interface StoreState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  cart: CartItem[];
  addToCart: (product: Product, size: number) => void;
  removeFromCart: (productId: string, size: number) => void;
  updateQuantity: (productId: string, size: number, quantity: number) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  compareList: string[];
  toggleCompare: (productId: string) => void;
  clearCompare: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      cart: [],
      addToCart: (product, size) => set((state) => {
        const existingItem = state.cart.find(item => item.id === product.id && item.selectedSize === size);
        if (existingItem) {
          return {
            cart: state.cart.map(item => 
              (item.id === product.id && item.selectedSize === size) 
                ? { ...item, quantity: item.quantity + 1 } 
                : item
            )
          };
        }
        return { cart: [...state.cart, { ...product, selectedSize: size, quantity: 1 }] };
      }),
      removeFromCart: (productId, size) => set((state) => ({
        cart: state.cart.filter(item => !(item.id === productId && item.selectedSize === size))
      })),
      updateQuantity: (productId, size, quantity) => set((state) => ({
        cart: state.cart.map(item => 
          (item.id === productId && item.selectedSize === size) 
            ? { ...item, quantity } 
            : item
        )
      })),
      clearCart: () => set({ cart: [] }),
      wishlist: [],
      toggleWishlist: (productId) => set((state) => ({
        wishlist: state.wishlist.includes(productId)
          ? state.wishlist.filter(id => id !== productId)
          : [...state.wishlist, productId]
      })),
      compareList: [],
      toggleCompare: (productId) => set((state) => {
        const isComparing = state.compareList.includes(productId);
        if (!isComparing && state.compareList.length >= 4) {
          return state; // Limit to 4
        }
        return {
          compareList: isComparing
            ? state.compareList.filter(id => id !== productId)
            : [...state.compareList, productId]
        };
      }),
      clearCompare: () => set({ compareList: [] })
    }),
    {
      name: 'walkin-storage',
      partialize: (state) => ({ cart: state.cart, wishlist: state.wishlist, compareList: state.compareList }),
    }
  )
);
