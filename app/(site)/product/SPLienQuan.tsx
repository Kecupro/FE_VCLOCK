import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Link from "next/link";
import { IProduct } from "../cautrucdata";
import AddToCart from "../components/AddToCart";
import BuyNow from "../components/BuyNow";
import { useEffect, useState  } from "react";
import WishlistButton from "../components/WishlistButton";
import { useAuth } from "../context/AuthContext";
import OptimizedImage from "../components/OptimizedImage";
import { getProductImageUrl } from '@/app/utils/imageUtils';
interface WishlistItem {
    _id: string;
    product_id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export default function SPLienQuan({id} : {id:string}) {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [wishlistStatus, setWishlistStatus] = useState<{[key: string]: boolean}>({});
    const { user } = useAuth();

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sp_lien_quan/${id}`)
            .then((res) => res.json())
            .then((data) => setProducts(data))
            .catch((err) => console.error("Lỗi tải sản phẩm:", err));
    }, [id]);
    
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
                            if (Array.isArray(data)) {
                                const statusMap: {[key: string]: boolean} = {};
                                data.forEach((item) => {
                                    statusMap[item.product_id] = true;
                                });
                                setWishlistStatus(statusMap);
                            } else {
                                setWishlistStatus({});
                            }
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
        <div className="w-full bg-gray-50 py-8">
			<h3 className="text-center font-bold text-2xl mb-3">
				SẢN PHẨM LIÊN QUAN
			</h3>
			<div className="mx-auto mb-8 w-30 h-1  bg-red-700 rounded"></div>
			<div className="max-w-6xl mx-auto">
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
                                        <OptimizedImage
                                            src={getProductImageUrl(sp.main_image?.image)}
                                            alt={sp.name}
                                            width={200}
                                            height={192}
                                            className="max-w-full max-h-full object-contain group-hover:scale-110 transition duration-300"
                                        />
                                    </Link>

                                    <div className="flex flex-col flex-grow min-h-[60px]">
                                        <div className="flex justify-between items-start mb-1">
                                            <Link href={`/product/${slug}`} className="font-semibold text-base text-gray-800 flex-grow mr-2 line-clamp-2">
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
			`}</style>
		</div>
    );
}