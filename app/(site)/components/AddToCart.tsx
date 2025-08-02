"use client";
import { ICart, IProduct } from "../cautrucdata";
import { useCart } from "./CartContext"; // Dùng context thay vì localStorage

export default function AddToCart({ sp }: { sp: IProduct }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    const item: ICart = {
      _id: sp._id,
      product_id: sp._id,
      so_luong: 1,
      price: sp.price,
      sale_price: sp.sale_price,
      name: sp.name,
      main_image: sp.main_image ?? { image: "", alt: "" },
      brand: sp.brand,
      quantity: sp.quantity,
    };

    addToCart(item); // 👈 gọi context
  };

  return (
    <button
      className="w-full mx-auto font-normal block bg-black text-white p-2 rounded-sm mt-1 hover:bg-red-700"
      onClick={handleAddToCart}
    >
      {/* Desktop: Show text */}
      <span className="hidden sm:block">THÊM GIỎ HÀNG</span>
      
      {/* Mobile: Show icon */}
      <div className="block sm:hidden flex items-center justify-center">
        <i className="fa-solid fa-cart-plus text-lg"></i>
      </div>
    </button>
  );
}
