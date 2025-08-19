"use client";

import { IStats, IProduct } from "../../cautrucdata";
import { useState, useEffect, useRef, useCallback } from "react";
import SPLienQuan from "../SPLienQuan";
import HienBinhLuanSP from "../HienBinhLuanSP";
import StarRating from "../../components/StarRating";
import Image from "next/image";
import BuyNow from "../../components/BuyNow";
import AddToCart from "../../components/AddToCart";
import WishlistButton from "../../components/WishlistButton";
import { useParams } from 'next/navigation';
import { getProductImageUrl } from '@/app/utils/imageUtils';
import axios from 'axios';
interface IRawImage { is_main: boolean; image: string , alt?: string; }

export default function ProductDetail() {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [currentImg, setCurrentImg] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [tab, setTab] = useState<"desc" | "review">("desc");
  const [stats, setStats] = useState<IStats | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const refetchBinhLuan = useRef<() => void>(() => {});
  const hasIncrementedView = useRef(false);
  const isInitialLoad = useRef(true);

  const decodeHtmlEntities = (text: string): string => {
    if (!text) return '';
    
    let decodedText = text;
    decodedText = decodedText
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&agrave;/g, 'à')
      .replace(/&aacute;/g, 'á')
      .replace(/&acirc;/g, 'â')
      .replace(/&atilde;/g, 'ã')
      .replace(/&auml;/g, 'ä')
      .replace(/&egrave;/g, 'è')
      .replace(/&eacute;/g, 'é')
      .replace(/&ecirc;/g, 'ê')
      .replace(/&igrave;/g, 'ì')
      .replace(/&iacute;/g, 'í')
      .replace(/&ocirc;/g, 'ô')
      .replace(/&ograve;/g, 'ò')
      .replace(/&oacute;/g, 'ó')
      .replace(/&otilde;/g, 'õ')
      .replace(/&ouml;/g, 'ö')
      .replace(/&ugrave;/g, 'ù')
      .replace(/&uacute;/g, 'ú')
      .replace(/&ucirc;/g, 'û')
      .replace(/&uuml;/g, 'ü')
      .replace(/&yacute;/g, 'ý')
      .replace(/&ccedil;/g, 'ç')
      .replace(/&ntilde;/g, 'ñ');
    
    return decodedText.trim();
  };

  
  const params = useParams();  
  const slug = params?.id as string;
  const id = typeof slug === "string" ? slug.split('-').slice(-1)[0] : undefined;

  const cleanupOldSession = () => {
    if (typeof window === 'undefined') return;
    
    const lastCleanup = localStorage.getItem('viewedProductsLastCleanup');
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (!lastCleanup || (now - parseInt(lastCleanup)) > oneDay) {
      localStorage.removeItem('viewedProducts');
      localStorage.setItem('viewedProductsLastCleanup', now.toString());
    }
  };

  const hasViewedInSession = useCallback((productId: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    cleanupOldSession();
    
    const viewedProducts = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
    return viewedProducts.includes(productId);
  }, []);

  const markAsViewed = useCallback((productId: string) => {
    if (typeof window === 'undefined') return;
    
    cleanupOldSession();
    
    const viewedProducts = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
    if (!viewedProducts.includes(productId)) {
      viewedProducts.push(productId);
      localStorage.setItem('viewedProducts', JSON.stringify(viewedProducts));
    }
  }, []);

  const incrementView = useCallback(async () => {
    if (hasIncrementedView.current || !id) return;
    
    try {
      hasIncrementedView.current = true;
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/product/${id}/increment-view`);
      
      const responseData = response.data as { success?: boolean; message?: string; views?: number };
      
      if (responseData.success) {
        markAsViewed(id);
        
        if (product) {
          setProduct(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : null);
        }
      }
    } catch (error) {
      console.error('Lỗi tăng lượt xem:', error);
      hasIncrementedView.current = false;
    }
  }, [id, product, markAsViewed]);

  useEffect(() => {
    if (!id) return;
  
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/stats/${id}`)
      .then(res => res.json())
      .then(data => setStats(data))
              .catch(err => console.error("Lỗi tải thống kê:", err));
  }, [id]);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token || !id) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/wishlist`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const wishlistItems = await response.json();
          const isInWishlist = wishlistItems.some((item: { product_id: string }) => item.product_id === id);
          setIsWishlisted(isInWishlist);
        }
      } catch (error) {
        console.error('Lỗi kiểm tra trạng thái yêu thích:', error);
      }
    };

    checkWishlistStatus();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    isInitialLoad.current = true;

    async function fetchProduct() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/${id}`);
        if (!res.ok) throw new Error("Lấy sản phẩm thất bại");
        const data = await res.json(); 

        const imgObjects = [...data.images].sort(
          (a: IRawImage, b: IRawImage) => (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0)
        ).map((i: IRawImage) => ({
          image: getProductImageUrl(i.image),
          alt: i.alt || data.name
        }));
        

        const cleanProduct: IProduct = {
          ...data,
          images: imgObjects,
          brand_id: data.brand._id
        };
        

        setProduct(cleanProduct);
        if (id && !hasViewedInSession(id)) {
          incrementView();
        }
      } catch (error) {
        console.error(error);
      }
    }

    fetchProduct();
  }, [id, hasViewedInSession, incrementView]);

  useEffect(() => {
    if (product && isInitialLoad.current) {
      setCurrentImg(0);
      isInitialLoad.current = false;
    }
  }, [product?._id]);


  if (!product) return <div>Đang tải sản phẩm...</div>;

  const handlePrev = () => {
    setCurrentImg((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImg((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <main className="w-full mx-auto py-10 px-[10%] pt-40">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="relative">
          <Image
            src={product.images[currentImg].image}
            alt={product.images[currentImg].alt || product.name}
            className="w-full h-116 object-cover rounded-xl cursor-zoom-in shadow-md"
            width={800}
            height={464}
            onClick={() => setShowZoom(true)}
            style={{ objectFit: "cover", borderRadius: "0.75rem", cursor: "zoom-in" }}
            priority
          />
          {showZoom && (
            <div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 "
              onClick={() => setShowZoom(false)}
            >
              <Image
                src={product.images[currentImg].image}
                alt={product.images[currentImg].alt || product.name}
                className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl cursor-zoom-out "
                width={800}
                height={464}
                onClick={() => setShowZoom(false)}
                style={{ objectFit: "contain", borderRadius: "0.75rem", cursor: "zoom-out" }}
                priority
              />
            </div>
          )}
          <button
            onClick={handlePrev}
            className="absolute top-60 left-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black z-10"
            aria-label="Ảnh trước"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button
            onClick={handleNext}
            className="absolute top-60 right-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black z-10"
            aria-label="Ảnh sau"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
          <div className="grid grid-cols-4 gap-0.5 mt-4">
            {product.images.map((img, idx) => (
              <div
                key={idx}
                className={`overflow-hidden rounded cursor-pointer flex items-center justify-center h-24 transition
                  ${currentImg === idx ? "border-red-600" : "border-transparent"}
                  hover:border-red-400`}
                onClick={() => setCurrentImg(idx)}
              >
                <Image
                  src={img.image}
                  alt={img.alt || `Ảnh phụ ${idx + 1}`}
                  className={`h-full w-full object-contain mx-auto transition-transform duration-200 hover:scale-105 border-2 border-gray-200 shadow-md rounded-xl
                    ${currentImg === idx ? "opacity-100" : "opacity-50"}
                  `}
                  width={120}
                  height={96}
                  style={{ objectFit: "contain" }}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <div className="mb-2 flex items-center gap-3">
									

            {product.sale_price > 0 && (
						<>
              <span className="text-red-600 text-2xl font-semibold">
                {product.sale_price.toLocaleString("vi-VN")}đ
              </span>
              <span className="text-gray-400 line-through text-lg">
                {product.price.toLocaleString("vi-VN")}đ
              </span>
              <div className="relative inline-block">
                <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-t-md relative shadow-lg">
                  -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
                  <div className="absolute left-1/2 top-full transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[4px] border-l-transparent border-r-transparent border-t-red-700"></div>
                </div>
              </div>
            </>
						)}

            {product.sale_price === 0 && (
              <span className="text-red-600 text-2xl font-semibold">
                {product.price.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>
          <p className="mb-2 text-gray-700 font-medium">{(product.brand_id?.name || product.brand?.name) ?? "Không rõ thương hiệu"}</p>
          <div className="mb-6">
            <div className="flex gap-4 mb-4">
              <AddToCart sp={product} disabled={product.quantity === 0} variant="text" />
              <BuyNow sp={product} disabled={product.quantity === 0} />
              <WishlistButton productId={product._id} initialIsWishlisted={isWishlisted} variant="large" />
            </div>
            
            {/* Hiển thị lượt xem và thông tin bổ sung */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between text-gray-600 text-sm">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-eye text-red-500"></i>
                  <span className="font-medium">{product.views || 0}</span>
                  <span>lượt xem</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className={`fa-solid fa-box ${product.quantity > 0 ? 'text-red-500' : 'text-red-500'}`}></i>
                  <span className={`font-medium ${product.quantity > 0 ? 'text-red-600' : 'text-red-600'}`}>{product.quantity}</span>
                  <span>{product.quantity > 0 ? 'sản phẩm có sẵn' : 'hết hàng'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-star text-red-500"></i>
                  <span className="font-medium">{stats?.totalReviews || 0}</span>
                  <span>đánh giá</span>
                </div>
              </div>
            </div>
            
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 w-100">
            </ul>
          </div>
        </div>
      </div>
      <div className="w-full mt-10">
        <h2 className="font-semibold mb-3 text-base text-black text-center">Thông số sản phẩm</h2>
        <div className="w-full bg-gray-100 rounded-xl px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 text-sm">
            <div className="flex py-2 border-b border-gray-200">
              <span className="w-40 text-gray-500">Bộ sưu tập</span>
              <span className="font-medium">PORTOFINO</span>
            </div>
            <div className="flex py-2 border-b border-gray-200">
              <span className="w-40 text-gray-500">Mã sản phẩm</span>
              <span className="font-medium">{product._id}</span>
            </div>
            <div className="flex py-2 border-b border-gray-200">
              <span className="w-40 text-gray-500">Giới tính</span>
              <span className="font-medium">{product.sex}</span>
            </div>
            <div className="flex py-2 border-b border-gray-200">
              <span className="w-40 text-gray-500">Loại máy</span>
              <span className="font-medium">{product.machine_type}</span>
            </div>
            <div className="flex py-2 border-b border-gray-200">
              <span className="w-40 text-gray-500">Đường kính</span>
              <span className="font-medium">{product.case_diameter}mm</span>
            </div>
            <div className="flex py-2 border-b border-gray-200">
              <span className="w-40 text-gray-500">Màu sắc</span>
              <span className="font-medium">{product.color}</span>
            </div>
            <div className="flex py-2 border-b border-gray-200">
              <span className="w-40 text-gray-500">Phong cách</span>
              <span className="font-medium">{product.style}</span>
            </div>
            <div className="flex py-2 border-b border-gray-200">
              <span className="w-40 text-gray-500">Chất liệu dây</span>
              <span className="font-medium">{product.strap_material}</span>
            </div>
            <div className="flex py-2 border-b border-gray-200">
              <span className="w-40 text-gray-500">Tính năng</span>
              <span className="font-medium">{product.features}</span>
            </div>
            <div className="flex py-2">
              <span className="w-40 text-gray-500">Độ chịu nước</span>
              <span className="font-medium">{product.water_resistance} ATM</span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full mt-10">
        <div className="flex justify-center gap-2 mb-6">
          <button
            className={`px-6 py-2 rounded-t font-semibold transition border-b-2 ${
              tab === "desc"
                ? "border-black text-black bg-white"
                : "border-transparent text-gray-500 bg-gray-100 hover:text-black"
            }`}
            onClick={() => setTab("desc")}
          >
            Mô tả sản phẩm
          </button>
          <button
            className={`px-6 py-2 rounded-t font-semibold transition border-b-2 ${
              tab === "review"
                ? "border-black text-black bg-white"
                : "border-transparent text-gray-500 bg-gray-100 hover:text-black"
            }`}
            onClick={() => setTab("review")}
          >
            Đánh giá
          </button>
        </div>
        <div className="w-full bg-white border border-gray-300  px-6 py-8">
          {tab === "desc" && (
            <div>
              <h3 className="font-bold text-text-lg mb-2">Mô tả sản phẩm</h3>
              <div 
                className="text-gray-700 text-base mb-4 [&>img]:max-w-full [&>img]:h-auto [&>img]:rounded-lg [&>img]:shadow-md [&>img]:my-4 [&>p]:mb-4 [&>p]:leading-relaxed [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-medium [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:list-inside [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:list-inside [&>ol]:mb-4 [&>li]:mb-1 [&>strong]:font-bold [&>em]:italic"
                dangerouslySetInnerHTML={{ 
                  __html: product.description ? decodeHtmlEntities(product.description) : 'Không có mô tả' 
                }}
              />
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Thiết kế mặt số tối giản, sang trọng, phù hợp cả nam và nữ.</li>
                <li>Dây da thật mềm mại, màu sắc trẻ trung, dễ phối đồ.</li>
                <li>Máy Thụy Sĩ Automatic, vận hành bền bỉ, chính xác.</li>
                <li>Có chống nước, thoải mái rửa tay, đi mưa nhỏ.</li>
                <li>Tính năng Moon phase độc đáo, tạo điểm nhấn cho cổ tay.</li>
                <li>Bảo hành chính hãng 1-2 năm, hỗ trợ trọn đời tại GWatch.</li>
              </ul>
              <p className="text-gray-700 text-base mb-2">
                Sản phẩm phù hợp cho mọi dịp: đi làm, dự tiệc, gặp gỡ bạn bè hoặc làm quà tặng ý nghĩa cho người thân, đối tác.
              </p>
              <p className="text-gray-700 text-base">
                <b>Lưu ý:</b> Hình ảnh sản phẩm có thể chênh lệch nhẹ do ánh sáng và màn hình hiển thị. Vui lòng liên hệ tư vấn để chọn Sản phẩm phù hợp nhất với bạn!
              </p>
            </div>
          )}
          {tab === "review" && (
            <div>
              <div className="flex items-center justify-center gap-2 mb-8 w-full">
                <StarRating rating={stats?.averageRating || 0} className="text-red-500 text-xl sm:text-3xl" />
                <span className="ml-2 font-semibold text-base sm:text-lg text-gray-800">{stats?.averageRating}</span>
                <span className="text-gray-500 text-xs sm:text-sm">({stats?.totalReviews} đánh giá)</span>
              </div>

              <HienBinhLuanSP productId={product._id} onRefetchReady={(fn) => { refetchBinhLuan.current = fn; }} />
            </div>
          )}
        </div>
      </div>
      <div className="w-full mt-10">
        <SPLienQuan id={product._id} />
      </div>
    </main>
  );
}