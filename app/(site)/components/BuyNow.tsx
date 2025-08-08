import { ICart, IProduct, IHinh } from "../cautrucdata";
import { useCart } from "./CartContext";
import { useRouter } from "next/navigation";

export default function BuyNow({ sp }: { sp: IProduct }) {
  const { setSelectedItems, refreshCartFromStorage } = useCart();
  const router = useRouter();

  const handleBuyNow = () => {
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
    const existingItem = existingCart.find((i: ICart) => i._id === item._id);
    
    if (existingItem) {
      const updatedCart = existingCart.map((i: ICart) =>
        i._id === item._id ? { ...i, so_luong: i.so_luong + item.so_luong } : i
      );
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } else {
      localStorage.setItem("cart", JSON.stringify([...existingCart, item]));
    }
    

    refreshCartFromStorage();
    
    setSelectedItems([item._id]);
    
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