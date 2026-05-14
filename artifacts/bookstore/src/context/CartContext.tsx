import React, { createContext, useContext, useEffect, useState } from "react";

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
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

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
