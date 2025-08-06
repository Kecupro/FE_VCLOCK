"use client";
import { ICart, IProduct } from "../cautrucdata";
import { useCart } from "./CartContext";
import { useRouter } from "next/navigation";

export default function BuyNow({ sp }: { sp: IProduct }) {
  const { setSelectedItems, refreshCartFromStorage } = useCart();
  const router = useRouter();

  const handleBuyNow = () => {
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

    // Thêm vào giỏ hàng (không hiển thị toast)
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = existingCart.find((i: ICart) => i._id === item._id);
    
    if (existingItem) {
      const updatedCart = existingCart.map((i: ICart) =>
        i._id === item._id ? { ...i, so_luong: i.so_luong + item.so_luong } : i
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } else {
      localStorage.setItem("cart", JSON.stringify([...existingCart, item]));
    }
    
    // Refresh cart từ localStorage
    refreshCartFromStorage();
    
    // Chỉ chọn sản phẩm này để checkout (không phải tất cả sản phẩm trong giỏ hàng)
    setSelectedItems([item._id]);
    
    // Chuyển đến trang checkout
    router.push('/checkout');
  };

  return (
    <button
      className="flex-1 mx-auto font-normal block bg-black text-white p-3 rounded-sm mt-1 hover:bg-red-600 transition-colors duration-200"
      onClick={handleBuyNow}
    >
      <div className="flex items-center justify-center">
        <span className="text-sm font-medium">Mua ngay</span>
      </div>
    </button>
  );
} 