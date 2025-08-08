import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useEffect, useState } from "react";
import { IProduct } from "../cautrucdata";
import WishlistButton from "./WishlistButton";
import AddToCart from "./AddToCart";
import BuyNow from "./BuyNow";
import { useAuth } from "../context/AuthContext";
interface WishlistItem {
    _id: string;
    product_id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export default function ProductNew() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [wishlistStatus, setWishlistStatus] = useState<{[key: string]: boolean}>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        setLoading(true);
        setError(null);
        
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sp_moi`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setProducts(data);
                } else if (data && Array.isArray(data.products)) {
                    setProducts(data.products);
                } else if (data && Array.isArray(data.data)) {
                    setProducts(data.data);
                } else {
                    console.warn("API trả về định dạng dữ liệu không mong đợi:", data);
                    setProducts([]);
                }
            })
            .catch((err) => {
                console.error("Lỗi tải sản phẩm:", err);
                setError(err.message);
                setProducts([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

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

    if (loading) {
        return (
            <div className="w-full bg-gray-50 py-8">
                <h3 className="text-center font-bold text-2xl mb-3">
                    SẢN PHẨM MỚI NHẤT
                </h3>
                <div className="mx-auto mb-8 w-30 h-1 bg-red-700 rounded"></div>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full bg-gray-50 py-8">
                <h3 className="text-center font-bold text-2xl mb-3">
                    SẢN PHẨM MỚI NHẤT
                </h3>
                <div className="mx-auto mb-8 w-30 h-1 bg-red-700 rounded"></div>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-red-600">
                    Không thể tải sản phẩm mới
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="w-full bg-gray-50 py-8">
                <h3 className="text-center font-bold text-2xl mb-3">
                    SẢN PHẨM MỚI NHẤT
                </h3>
                <div className="mx-auto mb-8 w-30 h-1 bg-red-700 rounded"></div>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                    Không có sản phẩm mới nào
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-gray-50 py-8">
            <h3 className="text-center font-bold text-2xl mb-3">
                SẢN PHẨM MỚI NHẤT
            </h3>
            <div className="mx-auto mb-8 w-30 h-1 bg-red-700 rounded"></div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <Swiper
                    modules={[Navigation, Autoplay]}
                    spaceBetween={24}
                    slidesPerView={2}
                    autoplay={{ delay: 2500, disableOnInteraction: false }}
                    breakpoints={{
                        768: { slidesPerView: 4 },
                        480: { slidesPerView: 3 },
                    }}
                    loop
                >
                    {products.map((sp, idx) => {
                        const slug = `${sp.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}-${sp._id}`;

                        return (
                            <SwiperSlide key={sp._id || idx}>
                                <div className="relative flex flex-col bg-white rounded shadow hover:shadow-lg transition p-4 group h-full">
                                    <Link href={`/product/${slug}`} className="flex-shrink-0 flex items-center justify-center h-48 mb-3 overflow-hidden">
                                        <img
                                            src={`/images/product/${sp.main_image?.image}`}
                                            alt={sp.name}
                                            className="max-w-full max-h-full object-contain group-hover:scale-110 transition duration-300"
                                        />
                                    </Link>

                                    <div className="flex flex-col flex-grow min-h-[60px]">
                                        <div className="flex justify-between items-start mb-1">
                                            <Link href={`/product/${slug}`} className="font-semibold text-base text-gray-800 flex-grow mr-2 line-clamp-2 overflow-hidden">
                                                {sp.name}
                                            </Link>
                                        </div>
                                        <p className="text-[12px] text-gray-600 mb-2 truncate">
                                            {(sp.brand_id?.name || sp.brand?.name) ?? "Không rõ thương hiệu"}
                                        </p>
                                    </div>

                                    <div className="mt-auto flex flex-col">
                                        {sp.sale_price > 0 ? (
                                            <>
                                                <span className="text-[14px] w-10 text-center font-bold text-gray-500 absolute top-2 left-2 bg-red-600 text-white px-1 py-2 rounded-sm z-10">
                                                    -{Math.round(((sp.price - sp.sale_price) / sp.price) * 100)}%
                                                </span>
                                                <div className="flex flex-wrap items-center gap-1">
                                                    <span className="text-gray-600 font-normal line-through text-sm">
                                                        {sp.price.toLocaleString("vi-VN")}đ
                                                    </span>
                                                    <span className="text-red-600 font-bold text-[16px]">
                                                        {sp.sale_price.toLocaleString("vi-VN")}đ
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div>
                                                <span className="text-gray-900 font-bold text-[16px]">
                                                    {sp.price.toLocaleString("vi-VN")}đ
                                                </span>
                                            </div>
                                        )}
                                        <div className="mt-2 flex gap-2">
                                            <AddToCart sp={sp} />
                                            <BuyNow sp={sp} />
                                        </div>
                                    </div>

                                    <div className="absolute top-2 right-2 z-10">
                                        <WishlistButton 
                                            productId={sp._id} 
                                            initialIsWishlisted={wishlistStatus[sp._id] || false}
                                        />
                                    </div>
                                </div>
                            </SwiperSlide>
                        );
                    })}

                </Swiper>
            </div>
        </div>
    );
}