import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useEffect, useState, useRef } from "react";
import { IBrand } from "../cautrucdata";
import OptimizedImage from "./OptimizedImage";
import { getBrandImageUrl } from '@/app/utils/imageUtils';
import type { Swiper as SwiperType } from 'swiper';

export default function Categories() {
	const [brands, setBrands] = useState<IBrand[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const swiperRef = useRef<SwiperType | null>(null);

	useEffect(() => {
		setLoading(true);
		setError(null);
		
		fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brand`)
			.then((res) => {
				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`);
				}
				return res.json();
			})
			.then((data) => {
				if (Array.isArray(data)) {
					setBrands(data);
				} else if (data && Array.isArray(data.brands)) {
					setBrands(data.brands);
				} else if (data && Array.isArray(data.data)) {
					setBrands(data.data);
				} else {
					        console.warn("API trả về định dạng dữ liệu không mong đợi:", data);
					setBrands([]);
				}
			})
			.catch((err) => {
				        console.error("Lỗi tải thương hiệu:", err);
				setError(err.message);
				setBrands([]);
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	if (loading) {
		return (
			<div className="w-full py-8">
				<h3 className="text-center font-bold text-2xl mb-4 text-gray-800">
					THƯƠNG HIỆU SẢN PHẨM
				</h3>
				<div className="mx-auto mb-10 w-32 h-1 bg-gradient-to-r from-red-600 to-red-800 rounded-full shadow-lg"></div>
				<div className="max-w-6xl mx-auto flex justify-center items-center h-32">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="w-full py-8">
				<h3 className="text-center font-bold text-2xl mb-4 text-gray-800">
					THƯƠNG HIỆU SẢN PHẨM
				</h3>
				<div className="mx-auto mb-10 w-32 h-1 bg-gradient-to-r from-red-600 to-red-800 rounded-full shadow-lg"></div>
				<div className="max-w-6xl mx-auto text-center text-red-600">
					Không thể tải danh sách thương hiệu
				</div>
			</div>
		);
	}

	if (!brands || brands.length === 0) {
		return (
			<div className="w-full py-8">
				<h3 className="text-center font-bold text-2xl mb-4 text-gray-800">
					THƯƠNG HIỆU SẢN PHẨM
				</h3>
				<div className="mx-auto mb-10 w-32 h-1 bg-gradient-to-r from-red-600 to-red-800 rounded-full shadow-lg"></div>
				<div className="max-w-6xl mx-auto text-center text-gray-500">
					Không có thương hiệu nào
				</div>
			</div>
		);
	}

	const handleMouseEnter = () => {
		if (swiperRef.current && swiperRef.current.autoplay) {
			swiperRef.current.autoplay.stop();
		}
	};

	const handleMouseLeave = () => {
		if (swiperRef.current && swiperRef.current.autoplay) {
			swiperRef.current.autoplay.start();
		}
	};

	return (
		<div className="w-full py-12 bg-gradient-to-b from-gray-50 to-white">
			<h3 className="text-center font-bold text-xl mb-4 text-gray-800">
				THƯƠNG HIỆU SẢN PHẨM
			</h3>
			<div className="mx-auto mb-10 w-32 h-1 bg-gradient-to-r from-red-600 to-red-800 rounded-full shadow-lg"></div>
			<div 
                className="max-w-6xl mx-auto px-4"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
				<Swiper
					modules={[Navigation, Autoplay]}
					spaceBetween={16}
					slidesPerView={5}
					autoplay={{ 
						delay: 0, 
						disableOnInteraction: false,
						pauseOnMouseEnter: true
					}}
					speed={3000}
					effect="slide"
					breakpoints={{
						1280: { slidesPerView: 5 },
						1024: { slidesPerView: 5 },
						768: { slidesPerView: 5 },
						480: { slidesPerView: 4 },
					}}
					loop
					loopAdditionalSlides={4}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
				>
					{brands.map((cat, idx) => (
						<SwiperSlide key={cat._id || idx}>
							<div className="w-full h-full p-2">
								<Link
									href={`/shop?brand=${encodeURIComponent(cat.name)}`}
									className="flex flex-col items-center text-center bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 group w-full h-full border border-gray-100 hover:border-red-200 overflow-hidden"
								>
									<div className="w-full h-24 p-2 bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
										<OptimizedImage
											src={getBrandImageUrl(cat.image)}
											alt={cat.name}
											width={120}
											height={100}
											className="w-full h-full object-contain transition-all duration-500 group-hover:scale-105"
										/>
									</div>
									<div className="w-full px-2 py-2 bg-gradient-to-r from-gray-50 to-white transition-all duration-300 group-hover:from-red-50 group-hover:to-red-100">
										<span className="block font-semibold text-xs text-gray-800 group-hover:text-red-700 transition-colors duration-300 mb-1 truncate w-full">
											{cat.name}
										</span>
										<span className="block text-[10px] text-gray-600 group-hover:text-red-600 transition-colors duration-300">
											{cat.productCount || 0} SẢN PHẨM
										</span>
									</div>
								</Link>
							</div>
						</SwiperSlide>
					))}
				</Swiper>
			</div>
		</div>
	);
}