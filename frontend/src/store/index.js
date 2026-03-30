// src/store/index.js
// Zustand global state management

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, cartAPI } from '../utils/api';

// ── Auth Store ────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await authAPI.login({ email, password });
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        set({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          isAuthenticated: true,
        });
        // Fetch user profile
        const { data: user } = await authAPI.me();
        set({ user });
        return user;
      },

      register: async (payload) => {
        const { data: user } = await authAPI.register(payload);
        return user;
      },

      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          const { data } = await authAPI.me();
          set({ user: data, isAuthenticated: true });
        } catch {
          get().logout();
        }
      },
    }),
    { name: 'nexora-auth', partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken }) }
  )
);

// ── Cart Store ────────────────────────────────────────
export const useCartStore = create((set, get) => ({
  items: [],          // CartItemResponse[]
  totalItems: 0,
  subtotal: 0,
  estimatedTax: 0,
  total: 0,
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const { data } = await cartAPI.get();
      set({
        items: data.items,
        totalItems: data.total_items,
        subtotal: data.subtotal,
        estimatedTax: data.estimated_tax,
        total: data.total,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    const { data } = await cartAPI.addItem(productId, quantity);
    set({
      items: data.items,
      totalItems: data.total_items,
      subtotal: data.subtotal,
      estimatedTax: data.estimated_tax,
      total: data.total,
    });
  },

  updateItem: async (productId, quantity) => {
    const { data } = await cartAPI.updateItem(productId, quantity);
    set({
      items: data.items,
      totalItems: data.total_items,
      subtotal: data.subtotal,
      estimatedTax: data.estimated_tax,
      total: data.total,
    });
  },

  removeItem: async (productId) => {
    const { data } = await cartAPI.removeItem(productId);
    set({
      items: data.items,
      totalItems: data.total_items,
      subtotal: data.subtotal,
      estimatedTax: data.estimated_tax,
      total: data.total,
    });
  },

  clearCart: async () => {
    await cartAPI.clear();
    set({ items: [], totalItems: 0, subtotal: 0, estimatedTax: 0, total: 0 });
  },

  // Optimistic local update (for instant UI feedback)
  localAdd: (product, quantity = 1) => {
    const items = get().items;
    const existing = items.find((i) => i.product_id === product.id);
    let newItems;
    if (existing) {
      newItems = items.map((i) =>
        i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      newItems = [...items, { id: Date.now(), product_id: product.id, product, quantity }];
    }
    const totalItems = newItems.reduce((s, i) => s + i.quantity, 0);
    set({ items: newItems, totalItems });
  },
}));

// ── UI Store ──────────────────────────────────────────
export const useUIStore = create((set) => ({
  sidebarOpen: false,
  cartOpen: false,
  searchOpen: false,
  theme: 'dark',

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
  closeAll: () => set({ sidebarOpen: false, cartOpen: false, searchOpen: false }),
}));

// ── Wishlist Store ─────────────────────────────────────
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      toggle: (product) => {
        const items = get().items;
        const exists = items.find((i) => i.id === product.id);
        set({ items: exists ? items.filter((i) => i.id !== product.id) : [...items, product] });
      },

      has: (productId) => get().items.some((i) => i.id === productId),
    }),
    { name: 'nexora-wishlist' }
  )
);
