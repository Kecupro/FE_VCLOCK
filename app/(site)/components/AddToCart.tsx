"use client";
import { ICart, IProduct, IHinh } from "../cautrucdata";
import { useCart } from "./CartContext"; // Dùng context thay vì localStorage

export default function AddToCart({ sp }: { sp: IProduct }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    // Xử lý main_image để đảm bảo cấu trúc đúng
    let mainImage: IHinh = {
      _id: "",
      is_main: true,
      image: "",
      alt: "",
      created_at: "",
      updated_at: ""
    };
    
    if (sp.main_image) {
      if (typeof sp.main_image === 'string') {
        mainImage = {
          _id: sp._id,
          is_main: true,
          image: sp.main_image,
          alt: sp.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      } else {
        mainImage = sp.main_image;
      }
    } else if (sp.images && sp.images.length > 0) {
      // Fallback: lấy ảnh đầu tiên từ images array
      const firstImage = sp.images[0];
      if (typeof firstImage === 'string') {
        mainImage = {
          _id: sp._id,
          is_main: true,
          image: firstImage,
          alt: sp.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      } else {
        mainImage = firstImage;
      }
    }

    const item: ICart = {
      _id: sp._id,
      product_id: sp,
      so_luong: 1,
      price: sp.price,
      sale_price: sp.sale_price,
      name: sp.name,
      main_image: mainImage,
      brand: sp.brand_id,
      quantity: sp.quantity,
    };

    addToCart(item); // 👈 gọi context
  };

  return (
    <button
      className="flex-1 mx-auto font-normal block bg-gray-300 text-black p-2 rounded-sm mt-1 hover:bg-gray-400 transition-colors duration-200"
      onClick={handleAddToCart}
    >
      {/* Show icon only */}
      <div className="flex items-center justify-center">
        <i className="fa-solid fa-cart-plus text-base"></i>
      </div>
    </button>
  );
}
