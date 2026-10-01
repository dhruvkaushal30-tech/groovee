import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { calcTotals } from '../utils/money';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);
const GUEST_KEY = 'veld_cart';

function readGuest() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY)) || [];
  } catch {
    return [];
  }
}

function writeGuest(items) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items));
}

function guestView(items, coupon) {
  const normalized = items.map((item) => ({
    ...item,
    _id: item._id || `${item.productId}-${item.size}-${item.color}`,
    stock: item.stock ?? 99,
    available: true,
  }));
  const subtotal = normalized.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return {
    items: normalized,
    couponCode: coupon?.code || '',
    discountPercent: coupon?.discountPercent || 0,
    ...calcTotals(subtotal, coupon?.discountPercent || 0),
  };
}

export function CartProvider({ children }) {
  const { user, loading } = useAuth();
  const [cart, setCart] = useState(guestView([]));
  const [guestCoupon, setGuestCoupon] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return undefined;
    let active = true;

    async function load() {
      if (!user) {
        if (active) {
          setGuestCoupon(null);
          setCart(guestView(readGuest()));
          setReady(true);
        }
        return;
      }
      const guest = readGuest();
      if (guest.length) {
        localStorage.removeItem(GUEST_KEY);
        await api.post('/cart/merge', {
          items: guest.map((item) => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          })),
        });
      }
      const res = await api.get('/cart');
      if (active) {
        setCart(res.data.cart);
        setReady(true);
      }
    }

    setReady(false);
    load().catch(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [user, loading]);

  const count = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items]
  );

  async function addItem(payload) {
    if (!user) {
      const items = readGuest();
      const existing = items.find(
        (item) => item.productId === payload.productId && item.size === payload.size && item.color === payload.color
      );
      if (existing) existing.quantity += payload.quantity;
      else items.push(payload);
      writeGuest(items);
      setCart(guestView(items, guestCoupon));
      return;
    }
    const res = await api.post('/cart', payload);
    setCart(res.data.cart);
  }

  async function updateItem(itemId, quantity) {
    if (!user) {
      const items = readGuest().map((item) =>
        (item._id || `${item.productId}-${item.size}-${item.color}`) === itemId ? { ...item, quantity } : item
      );
      writeGuest(items);
      setCart(guestView(items, guestCoupon));
      return;
    }
    const res = await api.patch(`/cart/${itemId}`, { quantity });
    setCart(res.data.cart);
  }

  async function removeItem(itemId) {
    if (!user) {
      const items = readGuest().filter(
        (item) => (item._id || `${item.productId}-${item.size}-${item.color}`) !== itemId
      );
      writeGuest(items);
      setCart(guestView(items, guestCoupon));
      return;
    }
    const res = await api.delete(`/cart/${itemId}`);
    setCart(res.data.cart);
  }

  async function applyCoupon(code) {
    if (!user) {
      if (!code) {
        setGuestCoupon(null);
        setCart(guestView(readGuest()));
        return;
      }
      const subtotal = readGuest().reduce((sum, item) => sum + item.price * item.quantity, 0);
      const res = await api.post('/coupons/validate', { code, subtotal });
      setGuestCoupon(res.data.coupon);
      setCart(guestView(readGuest(), res.data.coupon));
      return;
    }
    const res = await api.post('/cart/coupon', { code });
    setCart(res.data.cart);
  }

  async function refresh() {
    if (!user) {
      setCart(guestView(readGuest(), guestCoupon));
      return;
    }
    const res = await api.get('/cart');
    setCart(res.data.cart);
  }

  return (
    <CartContext.Provider value={{ cart, ready, count, addItem, updateItem, removeItem, applyCoupon, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
