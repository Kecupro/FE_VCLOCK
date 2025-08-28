"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import AddToCart from '../components/AddToCart';
import BuyNow from '../components/BuyNow';
import WishlistButton from '../components/WishlistButton';
import { IProduct } from '../cautrucdata';
import { useAuth } from '../context/AuthContext';
import OptimizedImage from '../components/OptimizedImage';
import { getProductImageUrl } from '@/app/utils/imageUtils';
interface WishlistItem {
  _id: string;
  product_id: string;
  user_id: string;
  created_at: string;
}


const SearchPage = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  const { user } = useAuth();
  type SearchProduct = IProduct & { brand_id?: string };
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<SearchProduct[]>([]);
  const [wishlistStatus, setWishlistStatus] = useState<{[key: string]: boolean}>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 8;

  const performSearch = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query || '',
        page: page.toString(),
        limit: productsPerPage.toString()
      });
      const response = await fetch(`http://localhost:3000/api/search?${params}`);
      const data = await response.json();
      setProducts(data.products || []);
      setTotalProducts(data.total || 0);
      setCurrentPage(page);
    } catch {
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  }, [query, productsPerPage]);

  useEffect(() => {
    if (query) {
      setCurrentPage(1);
      performSearch(1);
    }
  }, [query, performSearch]);

  useEffect(() => {
    const fetchWishlist = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const res = await fetch(`http://localhost:3000/user/wishlist`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            const statusMap: {[key: string]: boolean} = {};
            if (Array.isArray(data)) {
              data.forEach((item: WishlistItem) => {
                statusMap[item.product_id] = true;
              });
            }
            setWishlistStatus(statusMap);
          } else {
            setWishlistStatus({});
          }
        } catch {
          setWishlistStatus({});
        }
      } else {
        setWishlistStatus({});
      }
    };
    fetchWishlist();
  }, [user]);

  useEffect(() => {
    if (!loading && products.length === 0) {
      fetch(`http://localhost:3000/api/products/top-rated?limit=4`)
        .then(res => res.json())
        .then(data => setSuggestedProducts(data || []));
    } else {
      setSuggestedProducts([]);
    }
  }, [loading, products]);

  const uniqueProducts = Array.from(new Map(products.map(item => [item._id, item])).values());
  const uniqueSuggestedProducts = Array.from(new Map(suggestedProducts.map(item => [item._id, item])).values());
  
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      performSearch(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
          </>
        )}
        
        {pages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              currentPage === page
                ? 'bg-red-600 text-white border border-red-600'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    );
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Tìm kiếm</h1>
          <p className="text-gray-600">Vui lòng nhập từ khóa tìm kiếm</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Kết quả tìm kiếm cho &ldquo;{query}&rdquo;
          </h1>
          <p className="text-gray-600">
            Tìm thấy {totalProducts} sản phẩm - Hiển thị {((currentPage - 1) * productsPerPage) + 1}-{Math.min(currentPage * productsPerPage, totalProducts)} của {totalProducts}
          </p>
        </div>
        <div className="flex flex-col gap-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : products.length > 0 ? (
            <div className={`w-full flex justify-center`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-5xl">
                {uniqueProducts.map((product) => {
                  const percent = product.price && product.sale_price && product.sale_price > 0
                    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
                    : 0;
                  return (
                    <div
                      key={product._id}
                      className="relative flex flex-col bg-white rounded shadow hover:shadow-lg transition p-4 group h-full min-h-[390px] min-w-[220px] max-w-[340px] w-full mx-auto"
                    >
                      <Link href={`/product/${product._id}`} className="flex-shrink-0 flex items-center justify-center h-48 mb-3 overflow-hidden relative">
                        <OptimizedImage
                          src={
                            product.main_image
                              ? (typeof product.main_image === 'string' 
                                  ? getProductImageUrl(product.main_image)
                                  : getProductImageUrl(product.main_image.image)
                                )
                              : product.images && product.images.length > 0
                                ? getProductImageUrl(product.images[0].image)
                                : '/images/avatar-default.png'
                          }
                          alt={product.name}
                          width={200}
                          height={192}
                          className={`max-w-full max-h-full object-contain transition duration-300 ${
                            product.quantity > 0 ? 'group-hover:scale-110' : 'grayscale opacity-50'
                          }`}
                          fallbackSrc="/images/avatar-default.png"
                        />
                        {product.quantity === 0 && (
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
                          <h6 className="font-semibold text-base text-gray-800 flex-grow mr-2 line-clamp-2">
                            {product.name}
                          </h6>
                        </div>
                        <p className="text-[12px] text-gray-600 mb-2 truncate">
                          {(product.brand_id?.name || product.brand?.name) ?? "Không rõ thương hiệu"}
                        </p>
                      </div>
                      <div className="mt-auto flex flex-col">
                        {product.sale_price && product.sale_price > 0 ? (
                          <>
                            <div className="absolute top-0 left-0 z-10">
                              <div className="relative">
                                <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[11px] font-bold px-2 py-1.5 min-w-[45px] text-center shadow-lg">
                                  -{percent}%
                                </div>
                                <div className="absolute left-1/2 top-full transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-700"></div>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-gray-600 font-normal line-through text-sm">
                                {product.price?.toLocaleString('vi-VN')}đ
                              </span>
                              <span className="text-red-600 font-bold text-[16px]">
                                {product.sale_price?.toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          </>
                        ) : (
                          <div>
                            <span className="text-gray-900 font-bold text-[16px]">
                              {product.price?.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        )}
                        <div className="mt-2 flex gap-2">
                          <AddToCart sp={product} disabled={product.quantity === 0} />
                          <BuyNow sp={product} disabled={product.quantity === 0} />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 z-10">
                        <WishlistButton 
                          productId={product._id} 
                          initialIsWishlisted={wishlistStatus[product._id] || false}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fa-solid fa-search text-4xl text-gray-400 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy sản phẩm
              </h3>
              <p className="text-gray-600 mb-6">
                Thử tìm kiếm với từ khóa khác hoặc kiểm tra chính tả
              </p>
              {suggestedProducts.length > 0 && (
                <>
                  <h4 className="text-base font-semibold text-gray-800 mb-4">Có thể bạn quan tâm</h4>
                  <div className={`w-full flex justify-center`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-5xl">
                      {uniqueSuggestedProducts.map((product) => {
                        const percent = product.price && product.sale_price && product.sale_price > 0
                          ? Math.round(((product.price - product.sale_price) / product.price) * 100)
                          : 0;
                        return (
                          <div
                            key={product._id}
                            className="relative flex flex-col bg-white rounded shadow hover:shadow-lg transition p-4 group h-full min-h-[390px] min-w-[220px] max-w-[340px] w-full mx-auto"
                          >
                            <Link href={`/product/${product._id}`} className="flex-shrink-0 flex items-center justify-center h-48 mb-3 overflow-hidden relative">
                              <OptimizedImage
                                src={
                                  product.main_image
                                    ? (typeof product.main_image === 'string' 
                                        ? getProductImageUrl(product.main_image)
                                        : getProductImageUrl(product.main_image.image)
                                      )
                                    : product.images && product.images.length > 0
                                      ? getProductImageUrl(product.images[0].image)
                                      : '/images/avatar-default.png'
                                }
                                alt={product.name}
                                width={200}
                                height={192}
                                className={`max-w-full max-h-full object-contain transition duration-300 ${
                                  product.quantity > 0 ? 'group-hover:scale-110' : 'grayscale opacity-50'
                                }`}
                                fallbackSrc="/images/avatar-default.png"
                              />
                              
                              {product.quantity === 0 && (
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
                                  {product.name}
                                </h6>
                              </div>
                              <p className="text-[12px] text-gray-600 mb-2 truncate">
                                {(product.brand_id?.name || product.brand?.name) ?? "Không rõ thương hiệu"}
                              </p>
                            </div>
                            <div className="mt-auto flex flex-col">
                              {product.sale_price && product.sale_price > 0 ? (
                                <>
                                  <div className="absolute top-0 left-0 z-10">
                                    <div className="relative">
                                      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[11px] font-bold px-2 py-1.5 min-w-[45px] text-center shadow-lg">
                                        -{percent}%
                                      </div>
                                      <div className="absolute left-1/2 top-full transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-700"></div>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-1">
                                    <span className="text-gray-600 font-normal line-through text-sm">
                                      {product.price?.toLocaleString('vi-VN')}đ
                                    </span>
                                    <span className="text-red-600 font-bold text-[16px]">
                                      {product.sale_price?.toLocaleString('vi-VN')}đ
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div>
                                  <span className="text-gray-900 font-bold text-[16px]">
                                    {product.price?.toLocaleString('vi-VN')}đ
                                  </span>
                                </div>
                              )}
                                                      <div className="mt-2 flex gap-2">
                          <AddToCart sp={product} disabled={product.quantity === 0} />
                          <BuyNow sp={product} disabled={product.quantity === 0} />
                        </div>
                            </div>
                            <div className="absolute top-2 right-2 z-10">
                              <WishlistButton 
                                productId={product._id} 
                                initialIsWishlisted={wishlistStatus[product._id] || false}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        {!loading && products.length > 0 && renderPagination()}
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchPage />
    </Suspense>
  );
}