import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/lib/constants';

export interface CartItem extends Product {
  quantity: number;
}

export interface CartState { // Exporting CartState
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState, // This will be overridden by preloadedState from localStorage if available
  reducers: {
    addItem: (state, action: PayloadAction<Product>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        if (action.payload.quantity <= 0) {
           // If quantity is 0 or less, remove the item
          state.items = state.items.filter(i => i.id !== action.payload.id);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    // Potentially, a reducer to fully replace cart state if needed for hydration from localStorage,
    // but usually preloadedState in configureStore handles this.
    // setCartState: (state, action: PayloadAction<CartItem[]>) => {
    //   state.items = action.payload;
    // }
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
