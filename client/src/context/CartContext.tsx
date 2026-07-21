import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "../api/client";

export interface CartLine {
  product: Product;
  qty: number;
}

interface CartValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (product: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue>(null as unknown as CartValue);

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

const STORAGE_KEY = "kartly-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<CartValue>(() => {
    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotal: lines.reduce((s, l) => s + l.product.price * l.qty, 0),
      add(product, qty = 1) {
        setLines((prev) => {
          const existing = prev.find((l) => l.product.id === product.id);
          if (existing) {
            return prev.map((l) =>
              l.product.id === product.id ? { ...l, qty: Math.min(l.qty + qty, 99) } : l,
            );
          }
          return [...prev, { product, qty }];
        });
      },
      setQty(productId, qty) {
        setLines((prev) =>
          prev
            .map((l) => (l.product.id === productId ? { ...l, qty } : l))
            .filter((l) => l.qty > 0),
        );
      },
      remove(productId) {
        setLines((prev) => prev.filter((l) => l.product.id !== productId));
      },
      clear() {
        setLines([]);
      },
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
