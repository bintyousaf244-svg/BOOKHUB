import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
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
  syncCartWithCatalog: () => Promise<{
    availableItems: CartItem[];
    removedBookIds: number[];
    unresolvedBookIds: number[];
  }>;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = "bookstore_cart";
const CART_STORAGE_VERSION = 2;

function sanitizeCartItems(rawItems: unknown[]): CartItem[] {
  return rawItems
    .map((item) => {
      const candidate = item as Partial<CartItem>;

      return {
        ...candidate,
        bookId: Number(candidate.bookId),
        title: typeof candidate.title === "string" ? candidate.title : "",
        price: Number(candidate.price),
        salePrice: candidate.salePrice == null ? null : Number(candidate.salePrice),
        isOnSale: Boolean(candidate.isOnSale),
        coverImage: typeof candidate.coverImage === "string" ? candidate.coverImage : "",
        quantity: Number(candidate.quantity),
      };
    })
    .filter(
      (item) =>
        Number.isInteger(item.bookId) &&
        item.bookId > 0 &&
        item.title.trim().length > 0 &&
        Number.isFinite(item.price) &&
        item.price >= 0 &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0
    );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const itemsRef = useRef<CartItem[]>([]);
  const cartBookIdsKey = items
    .map((item) => Number(item.bookId))
    .filter((bookId) => Number.isFinite(bookId))
    .sort((a, b) => a - b)
    .join(",");

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart) as
          | { version?: number; items?: unknown[] }
          | unknown[];

        if (Array.isArray(parsedCart)) {
          setItems([]);
          return;
        }

        if (
          !parsedCart ||
          parsedCart.version !== CART_STORAGE_VERSION ||
          !Array.isArray(parsedCart.items)
        ) {
          setItems([]);
          return;
        }

        setItems(sanitizeCartItems(parsedCart.items));
      } catch (e) {
        console.error("Failed to parse cart");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({
        version: CART_STORAGE_VERSION,
        items,
      })
    );
  }, [items]);

  const syncCartWithCatalog = useCallback(async () => {
    const sourceItems = itemsRef.current;
    const uniqueBookIds = Array.from(
      new Set(
        sourceItems
          .map((item) => Number(item.bookId))
          .filter((bookId) => Number.isInteger(bookId) && bookId > 0)
      )
    );

    if (uniqueBookIds.length === 0) {
      return {
        availableItems: sourceItems,
        removedBookIds: [],
        unresolvedBookIds: [],
      };
    }

    const checks = await Promise.all(
      uniqueBookIds.map(async (bookId) => {
        try {
          const response = await apiFetch(`/api/books/${bookId}`);
          return {
            bookId,
            status: response.status,
            isAvailable: response.ok,
          };
        } catch (error) {
          console.error(`Failed to validate book ${bookId}`, error);
          return {
            bookId,
            status: 0,
            isAvailable: false,
          };
        }
      })
    );

    const removedBookIds = checks
      .filter((result) => result.status === 404)
      .map((result) => result.bookId);
    const unresolvedBookIds = checks
      .filter((result) => !result.isAvailable && result.status !== 404)
      .map((result) => result.bookId);
    const removedSet = new Set(removedBookIds);
    const availableItems = sourceItems.filter((item) => !removedSet.has(Number(item.bookId)));

    if (removedBookIds.length > 0) {
      setItems((prev) => prev.filter((item) => !removedSet.has(Number(item.bookId))));
    }

    return {
      availableItems,
      removedBookIds,
      unresolvedBookIds,
    };
  }, []);

  useEffect(() => {
    if (!cartBookIdsKey) return;
    void syncCartWithCatalog();
  }, [cartBookIdsKey, syncCartWithCatalog]);

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
        syncCartWithCatalog,
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
