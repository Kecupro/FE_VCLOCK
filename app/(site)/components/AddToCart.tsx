import { ICart, IProduct, IHinh } from "../cautrucdata";
import { useCart } from "./CartContext";
import { toast } from "react-toastify";

export default function AddToCart({ sp, disabled }: { sp: IProduct; disabled?: boolean }) {
  const { addToCart } = useCart();
  
  const isOutOfStock = sp.quantity === 0 || disabled;

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("Sản phẩm đã hết hàng!");
      return;
    }
    
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

    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = existingCart.find((i: ICart) => i._id === sp._id);
    const currentQuantityInCart = existingItem ? existingItem.so_luong : 0;
    
    if (currentQuantityInCart + 1 > 10) {
      toast.error("Số lượng tối đa cho mỗi sản phẩm là 10");
      return;
    }
    
    // if (currentQuantityInCart + 1 > sp.quantity) {
    //   toast.error(`Chỉ còn ${sp.quantity} sản phẩm trong kho`);
    //   return;
    // }

    addToCart(item);
  };

  return (
    <button
      className={`flex-1 mx-auto font-normal block p-2 rounded-sm mt-1 transition-colors duration-200 ${
        isOutOfStock 
          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
          : 'bg-gray-300 text-black hover:bg-gray-400'
      }`}
      onClick={handleAddToCart}
      disabled={isOutOfStock}
      title={isOutOfStock ? "Sản phẩm đã hết hàng" : "Thêm vào giỏ hàng"}
    >
      <div className="flex items-center justify-center">
        <i className={`fa-solid fa-cart-plus text-base ${isOutOfStock ? 'opacity-50' : ''}`}></i>
      </div>
    </button>
  );
}
