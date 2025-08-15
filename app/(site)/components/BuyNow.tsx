import { ICart, IProduct, IHinh } from "../cautrucdata";
import { useCart } from "./CartContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function BuyNow({ sp, disabled }: { sp: IProduct; disabled?: boolean }) {
  const { setSelectedItems } = useCart();
  const router = useRouter();
  
  const isOutOfStock = sp.quantity === 0 || disabled;

  const handleBuyNow = () => {
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
    const buyNowSession = {
      items: [item],
      isBuyNow: true,
      timestamp: new Date().getTime()
    };
    
    localStorage.setItem("buyNowSession", JSON.stringify(buyNowSession));
    
    setSelectedItems([item._id]);
    
    router.push('/checkout?buyNow=true');
  };

  return (
    <button
      className={`flex-1 mx-auto font-normal block p-3 rounded-sm mt-1 transition-colors duration-200 ${
        isOutOfStock 
          ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
          : 'bg-black text-white hover:bg-red-600'
      }`}
      onClick={handleBuyNow}
      disabled={isOutOfStock}
      title={isOutOfStock ? "Sản phẩm đã hết hàng" : "Mua ngay"}
    >
      <div className="flex items-center justify-center">
        <span className={`text-sm font-medium ${isOutOfStock ? 'opacity-50' : ''}`}>
          Mua ngay
        </span>
      </div>
    </button>
  );
} 