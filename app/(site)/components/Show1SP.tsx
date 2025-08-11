import Link from "next/link";
import { IProduct } from "../cautrucdata";
import AddToCart from "./AddToCart";
import BuyNow from "./BuyNow";
import WishlistButton from "./WishlistButton";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import OptimizedImage from "./OptimizedImage";
import { getProductImageUrl } from '@/app/utils/imageUtils';
interface WishlistItem {
    _id: string;
    product_id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export default function Show1SP(props: { sp: IProduct }) {
    const sp = props.sp;

    const [wishlistStatus, setWishlistStatus] = useState<{[key: string]: boolean}>({});
    const { user } = useAuth();
        useEffect(() => {
            const fetchWishlist = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/wishlist`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (res.ok) {
                        const data: WishlistItem[] = await res.json();
                        const statusMap: {[key: string]: boolean} = {};
                        if (Array.isArray(data)) {
                            data.forEach((item) => {
                                statusMap[item.product_id] = true;
                            });
                        }
                        setWishlistStatus(statusMap);
                    } else {
                        setWishlistStatus({});
                    }
                } catch (err) {
                    console.error("Lỗi tải danh sách yêu thích:", err);
                    setWishlistStatus({});
                }
            } else {
                setWishlistStatus({});
            }
        };
    
            fetchWishlist();
        }, [user]); 

    return (
        <div className="relative flex flex-col bg-white rounded shadow hover:shadow-lg transition p-4 group h-full">
                                <Link href={`/product/${sp._id}`} className="flex-shrink-0 flex items-center justify-center h-48 mb-3 overflow-hidden relative">
                                    <OptimizedImage
                                        src={getProductImageUrl(
                                            typeof sp.main_image === 'string' ? 
                                                sp.main_image : 
                                                sp.main_image?.image
                                        )}
                                        alt={sp.name}
                                        width={200}
                                        height={192}
                                        className={`max-w-full max-h-full object-contain transition duration-300 ${
                                            sp.quantity > 0 ? 'group-hover:scale-110' : 'grayscale opacity-50'
                                        }`}
                                    />
                                    
                                                            {/* Overlay "Đã bán hết" khi quantity = 0 */}
                        {sp.quantity === 0 && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                                <div className="bg-black text-white w-40 h-6 flex items-center justify-center font-bold text-xs shadow-lg relative overflow-hidden">
                                    <div className="absolute inset-0 bg-red-600 transform rotate-45 translate-x-8 -translate-y-2"></div>
                                    <div className="absolute inset-0 bg-red-600 transform -rotate-45 -translate-x-8 -translate-y-2"></div>
                                    <span className="relative z-10 text-white font-bold text-xs">HẾT HÀNG</span>
                                </div>
                            </div>
                        )}
                                </Link>

                                <div className="flex flex-col flex-grow min-h-[60px]">
                                    <div className="flex justify-between items-start mb-1">
                                        <h6 className="font-semibold text-base text-gray-800 flex-grow mr-2 line-clamp-2 overflow-hidden">
                                            {sp.name}
                                        </h6>
                                    </div>
                                    <p className="text-[12px] text-gray-600 mb-2 truncate">
                                        {(sp.brand_id?.name || sp.brand?.name) ?? "Không rõ thương hiệu"}
                                    </p>
                                </div>

                                <div className="mt-auto flex flex-col">
                                    {sp.sale_price > 0 && (
                                        <>
                                            <div className="absolute top-0 left-0 z-10">
                                                <div className="relative">
                                                    {/* Bookmark ribbon style */}
                                                    <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[11px] font-bold px-2 py-1.5 min-w-[45px] text-center shadow-lg">
                                                        -{Math.round(((sp.price - sp.sale_price) / sp.price) * 100)}%
                                                    </div>
                                                    {/* Bookmark tail - tạo hình tam giác ở dưới */}
                                                    <div className="absolute left-1/2 top-full transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-700"></div>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-1">
                                                <span className="text-gray-600 font-normal line-through text-sm">
                                                    {sp.price.toLocaleString("vi-VN")}đ
                                                </span>
                                                <span className="text-red-600 font-bold text-[16px]">
                                                    {sp.sale_price.toLocaleString("vi-VN")}đ
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    {sp.sale_price === 0 && (
                                        <div>
                                            <span className="text-gray-900 font-bold text-[16px]">
                                                {sp.price.toLocaleString("vi-VN")}đ
                                            </span>
                                        </div>
                                    )}
                                    <div className="mt-2 flex gap-2">
                                        <AddToCart sp={sp} disabled={sp.quantity === 0} />
                                        <BuyNow sp={sp} disabled={sp.quantity === 0} />
                                    </div>
                                </div>

                                <div className="absolute top-2 right-2 z-10">
                                    <WishlistButton 
                                        productId={sp._id} 
                                        initialIsWishlisted={wishlistStatus[sp._id] || false}
                                    />
                                </div>
                            </div>
    );
}