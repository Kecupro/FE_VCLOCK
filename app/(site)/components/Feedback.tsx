import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import AddToCart from "./AddToCart";
import BuyNow from "./BuyNow";
import { IProduct } from "../cautrucdata";
import OptimizedImage from "./OptimizedImage";
import { getProductImageUrl } from '@/app/utils/imageUtils';
import type { Swiper as SwiperType } from 'swiper';

interface TopRatedProduct {
  _id: string;
  name: string;
  price: number;
  sale_price: number;
  quantity: number;
  averageRating: number;
  reviewCount: number;
  main_image: {
    image: string;
    alt: string;
  };
  brand: {
    _id: string;
    name: string;
  };
}

export default function Feedback() {
  const [products, setProducts] = useState<TopRatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const fetchTopRatedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/top-rated?limit=6`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
  
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
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm được đánh giá cao:', error);
        setError(error instanceof Error ? error.message : 'Không thể tải sản phẩm');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopRatedProducts();
  }, []);

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ";
  };

  const createProductForCart = (product: TopRatedProduct): IProduct => {
    return {
      _id: product._id,
      name: product.name,
      price: product.price,
      sale_price: product.sale_price,

      brand_id: {
        _id: product.brand._id,
        name: product.brand.name,
        image: "",
        alt: "",
        description: "",
        brand_status: 1,
        created_at: "",
        updated_at: ""
      },
      main_image: {
        _id: product._id,
        is_main: true,
        image: typeof product.main_image === 'string' ? 
          product.main_image : 
          product.main_image?.image || '',
        alt: typeof product.main_image === 'string' ? 
          product.name : 
          product.main_image?.alt || product.name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      quantity: product.quantity,
      status: 0,

      views: 0,
      sex: "",
      case_diameter: 0,
      style: "",
      features: "",
      water_resistance: 0,
      thickness: 0,
      color: "",
      machine_type: "",
      strap_material: "",
      case_material: "",
      sold: 0,
      categories: [],
      images: [],
      description: "",
      slug: product.name.toLowerCase().replace(/\s+/g, '-'),
      created_at: "",
      updated_at: ""
    };
  };

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

  if (loading) {
    return (
      <div className="w-full bg-white py-8">
        <h3 className="text-center font-bold text-xl mb-4 text-gray-800">SẢN PHẨM NỔI BẬT</h3>
        <div className="mx-auto mb-10 w-32 h-1 bg-gradient-to-r from-red-600 to-red-800 rounded-full shadow-lg"></div>
        <div className="max-w-6xl mx-auto text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white py-8">
        <h3 className="text-center font-bold text-xl mb-4 text-gray-800">SẢN PHẨM NỔI BẬT</h3>
        <div className="mx-auto mb-10 w-32 h-1 bg-gradient-to-r from-red-600 to-red-800 rounded-full shadow-lg"></div>
        <div className="max-w-6xl mx-auto text-center text-red-600">
          Không thể tải sản phẩm nổi bật
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="w-full bg-white py-8">
        <h3 className="text-center font-bold text-xl mb-4 text-gray-800 ">SẢN PHẨM NỔI BẬT</h3>
        <div className="mx-auto mb-10 w-32 h-1 bg-gradient-to-r from-red-600 to-red-800 rounded-full shadow-lg"></div>
        <div className="max-w-6xl mx-auto text-center text-gray-500">
          Không có sản phẩm nổi bật nào
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white py-6">
      <h3 className="text-center font-bold text-xl mb-4 text-gray-800">SẢN PHẨM NỔI BẬT</h3>
      <div className="mx-auto mb-10 w-32 h-1 bg-gradient-to-r from-red-600 to-red-800 rounded-full shadow-lg"></div>
      
      <div 
        className="max-w-6xl mx-auto px-4"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={true}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          className="top-rated-swiper"
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product._id}>
              <div className="bg-white rounded-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-1/2 relative h-64 lg:h-auto overflow-hidden">
                    <Link href={`/product/${product._id}`}>
                      <OptimizedImage
                        src={getProductImageUrl(
                          typeof product.main_image === 'string' ? 
                            product.main_image : 
                            product.main_image?.image
                        )}
                        alt={typeof product.main_image === 'string' ? 
                          product.name : 
                          (product.main_image?.alt || product.name)
                        }
                        width={400}
                        height={300}
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          product.quantity > 0 ? 'hover:scale-105' : 'grayscale opacity-50'
                        }`}
                      />
                    </Link>
                    
                    {product.quantity === 0 && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                        <div className="bg-black text-white w-40 h-6 flex items-center justify-center font-bold text-xs shadow-lg relative overflow-hidden">
                          <div className="absolute inset-0 bg-red-600 transform rotate-45 translate-x-8 -translate-y-2"></div>
                          <div className="absolute inset-0 bg-red-600 transform -rotate-45 -translate-x-8 -translate-y-2"></div>
                          <span className="relative z-10 text-white font-bold text-xs">HẾT HÀNG</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <i className="fa-solid fa-star"></i>
                      {product.averageRating}
                    </div>

                    {product.sale_price > 0 && (
                      <div className="absolute top-3 right-3">
                        <div className="relative">
                          <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[11px] font-bold px-2 py-1.5 min-w-[45px] text-center shadow-lg rounded-t-md">
                            -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                          </div>
                          <div className="absolute left-1/2 top-full transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[6px] border-l-transparent border-r-transparent border-t-red-700"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="lg:w-1/2 p-6 flex flex-col justify-center">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">{product.brand.name}</p>
                      <Link href={`/product/${product._id}`}>
                        <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-red-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <i
                  key={i}
                            className={`fa-star text-lg ${i < product.averageRating ? "fa-solid text-red-500" : "fa-regular text-gray-300"}`}
                ></i>
              ))}
            </div>
                      <span className="text-sm text-gray-500">({product.reviewCount} đánh giá)</span>
                    </div>

                    <div className="mb-4">
                      {product.sale_price > 0 ? (
                        <div className="flex items-center gap-3">
                          <span className="text-red-600 font-bold text-2xl">
                            {formatPrice(product.sale_price)}
                          </span>
                          <span className="text-gray-400 line-through text-lg">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-red-600 font-bold text-2xl">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Điểm nổi bật:</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <i className="fa-solid fa-check text-green-500"></i>
                          Sản phẩm chính hãng 100%
                        </li>
                        <li className="flex items-center gap-2">
                          <i className="fa-solid fa-check text-green-500"></i>
                          Bảo hành chính hãng
                        </li>
                        <li className="flex items-center gap-2">
                          <i className="fa-solid fa-check text-green-500"></i>
                          Giao hàng toàn quốc
                        </li>
                        <li className="flex items-center gap-2">
                          <i className="fa-solid fa-check text-green-500"></i>
                          Đánh giá cao từ khách hàng
                        </li>
                      </ul>
                    </div>
                    <div className="w-full mb-3 flex gap-2">
                      <AddToCart sp={createProductForCart(product)} disabled={product.quantity === 0} variant="text" />
                      <BuyNow sp={createProductForCart(product)} disabled={product.quantity === 0} />
                    </div>

                    <div className="text-center">
                      <Link 
                        href={`/product/${product._id}`}
                        className="text-red-600 hover:text-red-700 font-medium text-sm underline"
                      >
                        Xem chi tiết sản phẩm →
                      </Link>
                    </div>
                  </div>
                </div>
          </div>
            </SwiperSlide>
        ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .top-rated-swiper {
          width: 100%;
          max-width: 100%;
        }
        
        .top-rated-swiper .swiper-slide {
          width: 100% !important;
          max-width: 100% !important;
        }    
        .top-rated-swiper .swiper-pagination-bullet {
          background: #dc2626;
          width: 12px;
          height: 12px;
          margin: 0 4px;
        }
        
        .top-rated-swiper .swiper-pagination-bullet-active {
          background: #dc2626;
          transform: scale(1.2);
        }
        
        .top-rated-swiper .swiper-pagination {
          bottom: 20px;
        }
        
      `}</style>
    </div>
  );
}