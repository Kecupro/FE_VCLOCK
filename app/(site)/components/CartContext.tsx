"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { ICart } from "../cautrucdata";
import { toast } from "react-toastify";

interface CartContextType {
  cart: ICart[];
  selectedItems: string[];
  total: number;
  cartCount: number;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  toggleSelectItem: (id: string) => void;
  toggleSelectAll: () => void;
  clearCart: () => void;
  addToCart: (item: ICart) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<ICart[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) setCart(JSON.parse(storedCart));

    const storedSelected = localStorage.getItem("selectedItems");
    if (storedSelected) setSelectedItems(JSON.parse(storedSelected));
  }, []);

  const calculateTotal = useCallback(() => {
    const sum = cart
      .filter(item => selectedItems.includes(item._id))
      .reduce(
        (acc, item) =>
          acc + (item.sale_price > 0 ? item.sale_price : item.price) * item.so_luong,
        0
      );
    setTotal(sum);
  }, [cart, selectedItems]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("selectedItems", JSON.stringify(selectedItems));
    calculateTotal();
  }, [cart, selectedItems, calculateTotal]);

  const updateQuantity = (id: string, quantity: number) => {
    setCart(prev =>
      prev.map(item =>
        item._id === id ? { ...item, so_luong: quantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item._id !== id));
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map(item => item._id));
    }
  };

  const clearCart = () => {
    setCart([]);
    setSelectedItems([]);
    toast.success("Đã xóa toàn bộ giỏ hàng!");
  };

  const addToCart = (item: ICart) => {
    setCart(prev => {
      const existingItem = prev.find(i => i._id === item._id);
      if (existingItem) {
        return prev.map(i =>
          i._id === item._id
            ? { ...i, so_luong: i.so_luong + item.so_luong }
            : i
        );
      }
      return [...prev, item];
    });
    toast.success("Đã thêm sản phẩm vào giỏ hàng!");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        selectedItems,
        total,
        cartCount: cart.length,
        updateQuantity,
        removeItem,
        toggleSelectItem,
        toggleSelectAll,
        clearCart,
        addToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
