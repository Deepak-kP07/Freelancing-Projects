
import { configureStore } from '@reduxjs/toolkit';
import cartReducer, { type CartState } from './cartSlice';
import authReducer, { type AuthState } from './authSlice'; // Import new auth reducer and state

const CART_STATE_KEY = 'ozonxtCartState';
// const AUTH_STATE_KEY = 'ozonxtAuthState'; // Optional: if you want to persist auth state

// Function to load state from localStorage
const loadCartState = (): { cart: CartState } | undefined => {
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
const saveCartState = (state: { cart: CartState }) => {
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

const preloadedCartState = loadCartState();

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer, // Add auth reducer
  },
  preloadedState: preloadedCartState, // Only preloading cart state for now
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types, or customize the check for User object
        ignoredActions: ['auth/setUser'],
        // Or, customize the check for specific paths
        ignoredPaths: ['auth.user'],
      },
    }),
});

// Subscribe to store changes to save cart state
let saveCartTimeout: NodeJS.Timeout | null = null;
store.subscribe(() => {
  if (saveCartTimeout) {
    clearTimeout(saveCartTimeout);
  }
  saveCartTimeout = setTimeout(() => {
    saveCartState({ cart: store.getState().cart });
  }, 500); // Debounce to save at most every 500ms
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
