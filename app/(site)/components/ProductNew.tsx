"use client";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useEffect, useState } from "react";
import { IProduct } from "../cautrucdata";
import WishlistButton from "./WishlistButton";
import AddToCart from "./AddToCart";
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
    const { user } = useAuth();

    useEffect(() => {
        fetch("https://bevclock-production.up.railway.app/api/sp_moi")
            .then((res) => res.json())
            .then((data) => setProducts(data))
            .catch((err) => console.error("Lỗi fetch sp:", err));
    }, []);

    // Fetch wishlist status for all products
    useEffect(() => {
        const fetchWishlist = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const res = await fetch("https://bevclock-production.up.railway.app/user/wishlist", {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    const data: WishlistItem[] = await res.json();
                    
                    const statusMap: {[key: string]: boolean} = {};
                    data.forEach((item) => {
                        statusMap[item.product_id] = true;
                    });
                    setWishlistStatus(statusMap);
                } catch (err) {
                    console.error("Lỗi fetch wishlist:", err);
                }
            } else {
                setWishlistStatus({});
            }
        };

        fetchWishlist();
    }, [user]); // Re-fetch when user state changes

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
                    navigation
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
                                            <Link href={`/product/${slug}`} className="font-semibold text-base text-gray-800 flex-grow mr-2 line-clamp-2">
                                                {sp.name}
                                            </Link>
                                            <div className="flex-shrink-0 text-gray-500 text-[12px] flex items-center">
                                                <i className="fa-solid fa-star text-orange-400 mr-1"></i>4.0
                                            </div>
                                        </div>
                                        <p className="text-[12px] text-gray-600 mb-2 truncate">
                                            {sp.brand?.name ?? "Không rõ thương hiệu"}
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
                                        <div className="mt-2">
                                            <AddToCart sp={sp} />
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
            <style jsx global>{`
                .swiper-button-next,
                .swiper-button-prev {
                    color: #6b7280 !important;
                }
                .swiper-button-next {
                    right: -32px;
                }
                .swiper-button-prev {
                    left: -32px;
                }
                .swiper-button-prev,
                .swiper-button-next {
                    top: 50%;
                    transform: translateY(-50%);
                    z-index: 10;
                }
                @media (max-width: 767px) {
                    .swiper-button-next,
                    .swiper-button-prev {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}