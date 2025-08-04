"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import AddToCart from "./AddToCart";
import { IProduct } from "../cautrucdata";

interface TopRatedProduct {
  _id: string;
  name: string;
  price: number;
  sale_price: number;
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

  useEffect(() => {
    const fetchTopRatedProducts = async () => {
      try {
        const response = await fetch('https://bevclock-production.up.railway.app/api/products/top-rated?limit=6');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Lỗi khi tải sản phẩm được đánh giá cao:', error);
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
      brand: product.brand,
      brand_id: product.brand,
      main_image: product.main_image,
      quantity: 1,
      status: 0,
      default: 0,
      views: 0,
      sex: "",
      case_diameter: 0,
      style: "",
      features: "",
      water_resistance: "",
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

  if (loading) {
    return (
      <div className="w-full bg-white py-8">
        <h3 className="text-center font-bold text-2xl mb-3">SẢN PHẨM NỔI BẬT</h3>
        <div className="mx-auto mb-8 w-30 h-1 bg-red-700 rounded"></div>
        <div className="max-w-6xl mx-auto text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white py-6">
      <h3 className="text-center font-bold text-2xl mb-3">SẢN PHẨM NỔI BẬT</h3>
      <div className="mx-auto mb-6 w-24 h-1 bg-red-700 rounded"></div>
      
      <div className="max-w-6xl mx-auto px-4">
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
        >
          {products.map((product) => (
            <SwiperSlide key={product._id}>
              <div className="bg-white rounded-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Product Image - Left Side */}
                  <div className="lg:w-1/2 relative h-64 lg:h-auto overflow-hidden">
                    <Link href={`/product/${product._id}`}>
                      <img
                        src={`/images/product/${product.main_image?.image}`}
                        alt={product.main_image?.alt || product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <i className="fa-solid fa-star"></i>
                      {product.averageRating}
                    </div>

                    {/* Sale Badge */}
                    {product.sale_price > 0 && (
                      <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-sm font-bold">
                        -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                      </div>
                    )}
                  </div>

                  {/* Product Info - Right Side */}
                  <div className="lg:w-1/2 p-6 flex flex-col justify-center">
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-2">{product.brand.name}</p>
                      <Link href={`/product/${product._id}`}>
                        <h3 className="text-xl font-bold text-gray-800 mb-3 hover:text-red-600 transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                    </div>
                    
                    {/* Rating */}
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

                    {/* Price */}
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

                    {/* Features/Highlights */}
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

                    {/* Add to Cart Button */}
                    <div className="w-full mb-3">
                      <AddToCart sp={createProductForCart(product)} />
                    </div>

                    {/* View Details Link */}
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