import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export type CartItem = {
  bookId: number;
  title: string;
  price: number;
  salePrice?: number | null;
  isOnSale: boolean;
  coverImage: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (bookId: number) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  clearCart: () => void;
  pruneUnavailableItems: (bookIds: number[]) => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const cartBookIdsKey = items
    .map((item) => Number(item.bookId))
    .filter((bookId) => Number.isFinite(bookId))
    .sort((a, b) => a - b)
    .join(",");

  useEffect(() => {
    const savedCart = localStorage.getItem("bookstore_cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (!Array.isArray(parsedCart)) {
          setItems([]);
          return;
        }

        setItems(
          parsedCart
            .map((item) => ({
              ...item,
              bookId: Number(item.bookId),
              price: Number(item.price),
              salePrice:
                item.salePrice == null
                  ? null
                  : Number(item.salePrice),
              quantity: Number(item.quantity),
            }))
            .filter(
              (item) =>
                Number.isFinite(item.bookId) &&
                Number.isFinite(item.price) &&
                Number.isFinite(item.quantity) &&
                item.quantity > 0
            )
        );
      } catch (e) {
        console.error("Failed to parse cart");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bookstore_cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!cartBookIdsKey) return;

    let cancelled = false;

    const syncWithLiveCatalog = async () => {
      try {
        const response = await apiFetch("/api/books?limit=1000");
        if (!response.ok) return;

        const data = await response.json() as { books?: Array<{ id: number }> };
        const validBookIds = new Set(
          (data.books ?? [])
            .map((book) => Number(book.id))
            .filter((id) => Number.isFinite(id))
        );

        if (cancelled) return;

        setItems((prev) => {
          const next = prev.filter((item) => validBookIds.has(Number(item.bookId)));
          return next.length === prev.length ? prev : next;
        });
      } catch (error) {
        console.error("Failed to validate cart items", error);
      }
    };

    void syncWithLiveCatalog();

    return () => {
      cancelled = true;
    };
  }, [cartBookIdsKey]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.bookId === item.bookId);
      if (existing) {
        return prev.map((i) =>
          i.bookId === item.bookId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (bookId: number) => {
    setItems((prev) => prev.filter((i) => i.bookId !== bookId));
  };

  const updateQuantity = (bookId: number, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.bookId === bookId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const pruneUnavailableItems = (bookIds: number[]) => {
    if (bookIds.length === 0) return;

    const unavailable = new Set(
      bookIds
        .map((bookId) => Number(bookId))
        .filter((bookId) => Number.isFinite(bookId))
    );

    setItems((prev) => prev.filter((item) => !unavailable.has(Number(item.bookId))));
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce(
    (acc, item) =>
      acc + (item.isOnSale && item.salePrice ? item.salePrice : item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        pruneUnavailableItems,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
