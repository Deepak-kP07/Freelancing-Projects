import { configureStore } from '@reduxjs/toolkit';
import cartReducer, { type CartState } from './cartSlice'; // Ensure CartState is exported from cartSlice or define it here

const CART_STATE_KEY = 'ozonxtCartState';

// Function to load state from localStorage
const loadState = (): { cart: CartState } | undefined => {
  try {
    if (typeof window === 'undefined') {
      return undefined; // Don't run on server
    }
    const serializedState = localStorage.getItem(CART_STATE_KEY);
    if (serializedState === null) {
      return undefined; // No state in localStorage, use initial state from reducers
    }
    const parsedState = JSON.parse(serializedState);
    return { cart: parsedState }; // Ensure it's nested under the 'cart' key
  } catch (err) {
    console.warn("Could not load cart state from localStorage", err);
    return undefined; // On error, return undefined to use initial state
  }
};

// Function to save state to localStorage
const saveState = (state: { cart: CartState }) => {
  try {
    if (typeof window === 'undefined') {
      return; // Don't run on server
    }
    const serializedState = JSON.stringify(state.cart); // Save only the cart slice
    localStorage.setItem(CART_STATE_KEY, serializedState);
  } catch (err) {
    console.warn("Could not save cart state to localStorage", err);
  }
};

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  preloadedState,
});

// Subscribe to store changes to save state
// Debounce this if performance becomes an issue with frequent updates
let saveTimeout: NodeJS.Timeout | null = null;
store.subscribe(() => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  saveTimeout = setTimeout(() => {
    saveState({ cart: store.getState().cart });
  }, 500); // Debounce to save at most every 500ms
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
