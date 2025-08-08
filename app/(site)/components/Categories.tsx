import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useEffect, useState  } from "react";
import { IBrand } from "../cautrucdata";
export default function Categories() {
	const [brands, setBrands] = useState<IBrand[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch danh sách thương hiệu
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
				// Ensure data is an array
				if (Array.isArray(data)) {
					setBrands(data);
				} else if (data && Array.isArray(data.brands)) {
					setBrands(data.brands);
				} else if (data && Array.isArray(data.data)) {
					setBrands(data.data);
				} else {
					console.warn("API returned unexpected data format:", data);
					setBrands([]);
				}
			})
			.catch((err) => {
				console.error("Lỗi fetch brand:", err);
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
				<h3 className="text-center font-bold text-2xl mb-3">
					THƯƠNG HIỆU SẢN PHẨM
				</h3>
				<div className="mx-auto mb-8 w-30 h-1 bg-red-700 rounded"></div>
				<div className="max-w-6xl mx-auto flex justify-center items-center h-32">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="w-full py-8">
				<h3 className="text-center font-bold text-2xl mb-3">
					THƯƠNG HIỆU SẢN PHẨM
				</h3>
				<div className="mx-auto mb-8 w-30 h-1 bg-red-700 rounded"></div>
				<div className="max-w-6xl mx-auto text-center text-red-600">
					Không thể tải danh sách thương hiệu
				</div>
			</div>
		);
	}

	if (!brands || brands.length === 0) {
		return (
			<div className="w-full py-8">
				<h3 className="text-center font-bold text-2xl mb-3">
					THƯƠNG HIỆU SẢN PHẨM
				</h3>
				<div className="mx-auto mb-8 w-30 h-1 bg-red-700 rounded"></div>
				<div className="max-w-6xl mx-auto text-center text-gray-500">
					Không có thương hiệu nào
				</div>
			</div>
		);
	}

	return (
		<div className="w-full py-8">
			<h3 className="text-center font-bold text-2xl mb-3">
				THƯƠNG HIỆU SẢN PHẨM
			</h3>
			<div className="mx-auto mb-8 w-30 h-1 bg-red-700 rounded"></div>
			<div className="max-w-6xl mx-auto">
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
					{brands.map((cat, idx) => (
						<SwiperSlide key={cat._id || idx}>
							<div className="w-full h-full p-2">
								<Link
									href={`/shop?brand=${encodeURIComponent(cat.name)}`}
									className="flex flex-col items-center text-center bg-white rounded shadow hover:shadow-lg transition group w-full h-full"
								>
									<img
										src={`/images/brand/${cat.image}`}
										alt={cat.name}
										className="w-full h-full object-contain mb-3 transition-transform duration-700 group-hover:-translate-y-2"
									/>
									<div className="w-full px-2 py-2 transition-all duration-300 group-hover:bg-gray-900 group-hover:text-white group-hover:-translate-y-2">
										<span className="block font-semibold text-base text-gray-800 group-hover:text-white transition">
											{cat.name}
										</span>
										<span className="block text-[10px] text-gray-500 group-hover:text-white transition">
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