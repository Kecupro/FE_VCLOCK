"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AddToCart from "../components/AddToCart";
import BuyNow from "../components/BuyNow";
import WishlistButton from "../components/WishlistButton";
import { IProduct } from "../cautrucdata";
import { IBrand } from "../cautrucdata";
import { FaThLarge } from 'react-icons/fa';
import { toast } from "react-toastify";
import Image from "next/image";
import OptimizedImage from "../components/OptimizedImage";
import { getBrandImageUrl, getProductImageUrl } from '@/app/utils/imageUtils';

interface WishlistItem {
  _id: string;
  product_id: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}


function formatMoney(num: number | undefined) {
  if (!num && num !== 0) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
}


function handleBrandImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, brandName: string) {
  (e.target as HTMLImageElement).style.display = "none";
  const parent = (e.target as HTMLImageElement).parentElement;
  if (parent && parent.querySelector('.brand-initial') === null) {
    const span = document.createElement('span');
    span.className = 'brand-initial text-base font-bold text-gray-600';
    span.style.display = 'flex';
    span.style.alignItems = 'center';
    span.style.justifyContent = 'center';
    span.style.height = '100%';
    span.style.width = '100%';
    span.innerText = brandName?.charAt(0).toUpperCase() || '';
    parent.appendChild(span);
  }
}

function ShopPageContent() {
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<string[]>(["Tất cả"]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [sort, setSort] = useState("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000000]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [wishlistMap, setWishlistMap] = useState<{ [key: string]: boolean }>({});
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const [showBrandModal, setShowBrandModal] = useState(false);
  const maxBrandInRow = 14;
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortLabel = sort === 'default' ? 'Thứ tự mặc định' : sort === 'price-asc' ? 'Giá tăng dần' : 'Giá giảm dần';
  const [brandSearch, setBrandSearch] = useState('');
  const [bestSellers, setBestSellers] = useState<IProduct[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000000);
  const [showFilterModal, setShowFilterModal] = useState(false);




  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category`)
      .then((res) => res.json())
      .then((data: { name: string }[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(["Tất cả", ...data.map((c) => c.name)]);
        }
      });
  }, []);


  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brand`)
      .then((res) => res.json())
      .then((data: IBrand[]) => setBrands(data));
  }, []);


  useEffect(() => {
    const brandParam = searchParams.get('brand');
    if (brandParam) {
      setSelectedBrand(decodeURIComponent(brandParam));
    }
  }, [searchParams]);


  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(decodeURIComponent(categoryParam));
    }
  }, [searchParams]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/product/price-range`)
      .then(res => res.json())
      .then(data => {
        if (typeof data.minPrice === 'number' && typeof data.maxPrice === 'number') {
          setMinPrice(data.minPrice);
          setMaxPrice(data.maxPrice);
          setPriceRange([data.minPrice, data.maxPrice]);
        }
      })
      .catch(() => {
        setMinPrice(0);
        setMaxPrice(1000000000);
        setPriceRange([0, 1000000000]);
      });
  }, []);


  useEffect(() => {
    setPage(1);
  }, [selectedCategory, priceRange, sort, selectedBrand]);


  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('limit', '12');
    params.append('page', page.toString());
    
    if (selectedCategory && selectedCategory !== 'Tất cả') {
      params.append('category', selectedCategory);
    }
    if (selectedBrand) {
      params.append('brand', selectedBrand);
    }



    if (priceRange[0] !== minPrice || priceRange[1] !== maxPrice) {
      if (priceRange[0] > 0) {
        params.append('minPrice', priceRange[0].toString());
      }
      if (priceRange[1] !== maxPrice) {
        params.append('maxPrice', priceRange[1].toString());
      }
    }
    
    if (sort !== 'default') {
      params.append('sort', sort);
    }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/sp_filter?${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [selectedCategory, priceRange, sort, page, selectedBrand, maxPrice, minPrice]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error('Failed to fetch wishlist');
          }
        })
        .then((data: WishlistItem[]) => {
          if (Array.isArray(data)) {
            const map: { [key: string]: boolean } = {};
            data.forEach((item) => { map[item.product_id] = true; });
            setWishlistMap(map);
          } else {
            setWishlistMap({});
          }
        })
        .catch(() => {
          setWishlistMap({});
        });
    } else {
      setWishlistMap({});
    }
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/top-rated?limit=4`)
      .then(res => res.json())
      .then(data => setBestSellers(data));
  }, []);

  const displayedCategories = showAllCategories 
    ? categories 
    : [...categories.slice(0, 1), ...categories.slice(1, 6)]; 

  const filteredBrands = brands.filter(b => b?.name?.toLowerCase().includes(brandSearch.toLowerCase()));

  return (
    <main className="max-w-7xl mx-auto py-10 px-4 pt-40">

      <div className="mb-8">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))',
            alignItems: 'center',
          }}
        >
          {brands.slice(0, maxBrandInRow).map((brand) => (
            <button
              key={brand._id}
              className={`flex flex-col items-center min-w-[70px] px-2 py-1 bg-white rounded-lg transition-all duration-200 \
                ${selectedBrand === brand?.name ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-400 hover:bg-gray-50"}
              `}
              style={{ width: 60, minHeight: 75 }}
              onClick={() => setSelectedBrand(brand?.name === selectedBrand ? null : brand?.name)}
            >
              <div className={`flex items-center justify-center rounded-full bg-white border transition-all duration-200
                ${selectedBrand === brand?.name ? "border-red-500 shadow-md" : "border-gray-200 group-hover:border-red-400"}
              `}
                style={{ width: 50, height: 50, marginBottom: 2 }}
              >
                <OptimizedImage
                  src={getBrandImageUrl(brand.image)}
                  alt={brand.name}
                  width={50}
                  height={50}
                  className="object-contain transition-transform duration-200 group-hover:scale-110"
                  style={{ width: 50, height: 50 }}
                  onError={(e) => handleBrandImageError(e, brand.name)}
                />
              </div>
              <span
                className="text-[11px] mt-1 text-center text-gray-500 font-medium break-words"
                style={{ maxWidth: 60, lineHeight: '13px', whiteSpace: 'normal', overflow: 'visible', display: 'block' }}
              >
                {brand?.name?.split(' ')[0] || 'Unknown'}
              </span>
            </button>
          ))}
          {brands.length > maxBrandInRow && (
            <button
              className="flex flex-col items-center justify-center w-[70px] h-[80px] rounded-xl border border-red-200 bg-gradient-to-b from-white via-red-50 to-white shadow-sm hover:shadow-lg hover:border-red-500 transition-all duration-200 group relative"
              onClick={() => setShowBrandModal(true)}
              type="button"
            >
              <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-red-200 group-hover:border-red-500 shadow transition-all duration-200 mb-1">
                <FaThLarge className="text-2xl text-red-400 group-hover:text-red-600 transition-all duration-200" />
              </span>
              <span className="text-xs text-gray-800 font-semibold mt-1">Tất cả</span>
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-lg z-20">
                Tất cả thương hiệu
              </span>
            </button>
          )}
        </div>
      </div>


      {showBrandModal && (
        <div className="fixed left-1/2 top-33 z-50 -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4" style={{maxWidth:1250, width:'100%'}}>
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl font-bold"
            style={{right: 16, top: 8, position: 'absolute'}}
            onClick={() => setShowBrandModal(false)}
            aria-label="Đóng"
          >
            ×
          </button>
          <h3 className="text-lg font-bold mb-3 text-center">Chọn thương hiệu đồng hồ </h3>
          <div className="relative flex justify-center mb-3">
            <input
              type="text"
              placeholder="Tìm kiếm thương hiệu..."
              className="pl-10 pr-10 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-red-400 focus:shadow-lg text-sm w-[320px] max-w-full transition-all duration-200"
              value={brandSearch}
              onChange={e => setBrandSearch(e.target.value)}
              autoFocus
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-all duration-200 group-focus-within:text-red-400">
            
            </span>
            {brandSearch && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
                onClick={() => setBrandSearch('')}
                tabIndex={-1}
                type="button"
                aria-label="Xóa tìm kiếm"
              >
                <i className="fa fa-times-circle"></i>
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center overflow-y-auto" style={{maxHeight: '60vh'}}>
            {filteredBrands.map((brand) => (
              <button
                key={brand._id}
                className={`flex flex-col items-center min-w-[70px] px-2 py-1 bg-white transition-all duration-200 \
                  ${selectedBrand === brand?.name ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-400 hover:bg-gray-50"}
                `}
                style={{ width: 60, minHeight: 75 }}
                
                onClick={() => {
                  setSelectedBrand(brand?.name === selectedBrand ? null : brand?.name);
                  setShowBrandModal(false);
                }}
              >
                <div className={`flex items-center justify-center rounded-full bg-white border transition-all duration-200
                  ${selectedBrand === brand?.name ? "border-red-500 shadow-md" : "border-gray-200 group-hover:border-red-400"}
                `}
                  style={{ width: 50, height: 50, marginBottom: 2 }}
                >
                  <OptimizedImage
                    src={getBrandImageUrl(brand.image)}
                    alt={brand?.name || 'Brand'}
                    width={50}
                    height={50}
                    className="object-contain transition-transform duration-200 group-hover:scale-110"
                    style={{ width: 50, height: 50 }}
                    onError={(e) => handleBrandImageError(e, brand?.name || 'Unknown')}
                  />
                </div>
                <span
                  className="text-[11px] mt-1 text-center text-gray-500 font-medium break-words"
                  style={{ maxWidth: 60, lineHeight: '13px', whiteSpace: 'normal', overflow: 'visible', display: 'block' }}
                >
                  {brand?.name || 'Unknown'}
                </span>
              </button>
            ))}
            {filteredBrands.length === 0 && (
              <div className="text-center text-gray-400 py-8 flex flex-col items-center">
                <i className="fa fa-search-minus text-3xl mb-2"></i>
                <span>Không tìm thấy thương hiệu nào</span>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <div className="bg-white border border-gray-200 rounded-md p-6 mb-8">
            <h2 className="font-bold text-xl flex items-center gap-2 mb-5 text-gray-800">
              <i className="fa-solid fa-list text-red-600"></i> Danh mục
            </h2>
            <ul className="flex flex-col gap-2">
              {displayedCategories.map((cat) => (
                <li key={cat}>
                  <button
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition font-medium text-sm
                      ${selectedCategory === cat
                        ? "bg-red-600 text-white shadow"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <i className={`fa-solid fa-tag ${selectedCategory === cat ? "text-white" : "text-red-400"}`}></i>
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
            {categories.length > 6 && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition"
              >
                {showAllCategories ? (
                  <>
                    <i className="fa-solid fa-angle-up text-red-400"></i>
                    Thu gọn
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-angle-down text-red-400"></i>
                    Xem thêm ({categories.length - 6})
                  </>
                )}
              </button>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-md p-6">
            <h2 className="font-bold text-xl flex items-center gap-2 mb-5 text-gray-800">
              <i className="fa-solid fa-fire text-red-600"></i> Sản phẩm bán chạy
            </h2>
            <ul className="flex flex-col gap-4">
              {bestSellers.map((p) => (
                <li key={p._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition group">
                  <Link href={`/product/${p._id}`} className="flex-shrink-0">
                     <Image
                                                       src={getProductImageUrl(
                                    typeof p.main_image === 'string' ? 
                                        p.main_image : 
                                        p.main_image?.image
                                )}
                                                alt={typeof p.main_image === 'string' ? 
                             p.name : 
                             (p.main_image?.alt || p.name)
                         }
                       width={48}
                       height={48}
                       className="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm group-hover:scale-105 transition"
                     />
                    </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${p._id}`} className="font-semibold text-sm text-gray-800 group-hover:text-red-600 truncate max-w-[120px] flex items-center">
                      <span className="inline-block bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded mr-1">Bán chạy</span>
                      {p.name}
                    </Link>
                    <div className="text-red-600 text-xs font-bold">{formatMoney(p.sale_price || p.price)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        <section className="md:col-span-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="text-sm text-gray-600">
              Hiển thị {products.length > 0 ? 1 : 0} - {products.length} trong {products.length} kết quả
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-red-400 hover:text-red-600 transition"
                onClick={() => setShowFilterModal(true)}
              >
                <i className="fa-solid fa-filter text-red-500"></i>
                <span>Lọc</span>
                {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                    1
                  </span>
                )}
              </button>
              <div className="relative inline-block">
                <button
                  className="flex items-center border border-gray-200 rounded px-3 py-2 text-sm bg-white hover:border-red-400 transition"
                  onClick={() => setShowSortDropdown((v) => !v)}
                  type="button"
                >
                  <i className="fa-solid fa-sort mr-2"></i>
                  {sortLabel}
                  <i className="fa-solid fa-angle-down ml-2"></i>
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 mt-2 w-[220px] bg-white border border-gray-200 rounded shadow-lg z-50 animate-fade-in">
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center whitespace-nowrap" onClick={() => { setSort('default'); setShowSortDropdown(false); }}>
                      {sort === 'default' && <i className="fa-solid fa-check text-red-500 mr-2"></i>}
                      Thứ tự mặc định
                    </button>
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center whitespace-nowrap" onClick={() => { setSort('price-asc'); setShowSortDropdown(false); }}>
                      {sort === 'price-asc' && <i className="fa-solid fa-check text-red-500 mr-2"></i>}
                      Giá tăng dần
                    </button>
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center whitespace-nowrap" onClick={() => { setSort('price-desc'); setShowSortDropdown(false); }}>
                      {sort === 'price-desc' && <i className="fa-solid fa-check text-red-500 mr-2"></i>}
                      Giá giảm dần
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading && (
              <div className="col-span-full text-center text-gray-500 py-10">
                Đang tải dữ liệu sản phẩm...
              </div>
            )}
            {!loading && products.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-10">
                Không tìm thấy sản phẩm phù hợp.
              </div>
            )}
            {!loading && products.map((sp) => (
              <div
                key={sp._id}
                className="relative flex flex-col bg-white rounded shadow hover:shadow-lg transition p-3 group h-full min-h-[380px]"
              >
                <Link href={`/product/${sp._id}`} className="flex-shrink-0 flex items-center justify-center h-40 mb-2 overflow-hidden relative">
                  <OptimizedImage
                    src={getProductImageUrl(
                        typeof sp.main_image === 'string' ? 
                            sp.main_image : 
                            sp.main_image?.image
                    )}
                    alt={typeof sp.main_image === 'string' ? 
                        sp.name : 
                        (sp.main_image?.alt || sp.name)
                    }
                    width={200}
                    height={192}
                    className={`max-w-full max-h-full object-contain transition duration-300 ${
                      sp.quantity > 0 ? 'group-hover:scale-110' : 'grayscale opacity-50'
                    }`}
                  />
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
                  <p className="text-[12px] text-gray-600 mb-1 truncate">
                    {(sp.brand_id?.name || sp.brand?.name) ?? "Không rõ thương hiệu"}
                  </p>
                </div>
                <div className="mt-auto flex flex-col gap-2">
                  {sp.sale_price && sp.sale_price > 0 ? (
                    <>
                      <div className="absolute top-0 left-0 z-10">
                        <div className="relative">
                          <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[11px] font-bold px-2 py-1.5 min-w-[45px] text-center shadow-lg">
                            -{sp.price && sp.sale_price ? Math.round(((sp.price - sp.sale_price) / sp.price) * 100) : 0}%
                          </div>
                          <div className="absolute left-1/2 top-full transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-700"></div>
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-gray-400 font-normal line-through text-xs">
                          {formatMoney(sp.price)}
                        </span>
                        <span className="text-red-600 font-bold text-lg">
                          {formatMoney(sp.sale_price)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div>
                      <span className="text-gray-800 font-bold text-lg">
                        {formatMoney(sp.price)}
                      </span>
                    </div>
                  )}
                  <div className="mt-2 flex gap-2">
                    <AddToCart sp={sp} disabled={sp.quantity === 0} size="small" />
                    <BuyNow sp={sp} disabled={sp.quantity === 0} size="small" />
                  </div>
                </div>
                <div className="absolute top-2 right-2 z-10">
                  <WishlistButton productId={sp._id} initialIsWishlisted={wishlistMap[sp._id] || false} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-10 gap-2">
            <button
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold shadow-sm transition hover:bg-red-600 hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <i className="fa-solid fa-chevron-left mr-1"></i> Trước
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`w-9 h-9 rounded-lg border text-base font-bold transition
                    ${page === i + 1
                      ? "bg-red-600 text-white border-red-600 shadow"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"}
                  `}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold shadow-sm transition hover:bg-red-600 hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Sau <i className="fa-solid fa-chevron-right ml-1"></i>
            </button>
          </div>
        </section>
      </div>

      {showFilterModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowFilterModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl border-2 border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <i className="fa-solid fa-filter text-red-500"></i>
                Lọc sản phẩm
              </h3>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-red-500 text-2xl font-bold transition"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Giá</h4>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: 'Dưới 5.000.000đ', range: [0, 5000000] },
                    { label: '5.000.000đ - 10.000.000đ', range: [5000000, 10000000] },
                    { label: '10.000.000đ - 20.000.000đ', range: [10000000, 20000000] },
                    { label: '20.000.000đ - 50.000.000đ', range: [20000000, 50000000] },
                    { label: '50.000.000đ - 100.000.000đ', range: [50000000, 100000000] },
                    { label: '100.000.000đ - 200.000.000đ', range: [100000000, 200000000] },
                    { label: '200.000.000đ - 500.000.000đ', range: [200000000, 500000000] },
                    { label: 'Trên 500.000.000đ', range: [500000000, 999999999] }
                  ].map((item, index) => (
                    <button
                      key={index}
                      className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                        priceRange[0] === item.range[0] && priceRange[1] === item.range[1]
                          ? 'bg-red-500 text-white border-red-500 shadow-lg'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-red-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                                             onClick={() => {
                        setPriceRange(item.range as [number, number]);
                        toast.success(`Đã chọn khoảng giá: ${item.label}`);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>


              </div>


            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                                 onClick={() => {
                   setPriceRange([minPrice, maxPrice]);
                   toast.success('Đã xóa tất cả bộ lọc!');
                 }}
              >
                Xoá tất cả
              </button>
              <button
                className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                onClick={() => {
                  setShowFilterModal(false);
                  if (priceRange[0] !== minPrice || priceRange[1] !== maxPrice) {
                    toast.success(`Đang hiển thị sản phẩm từ ${formatMoney(priceRange[0])} đến ${formatMoney(priceRange[1])}`);
                  }
                }}
              >
                Xem kết quả
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto py-10 px-4 pt-40">Đang tải...</div>}>
      <ShopPageContent />
    </Suspense>
  );
}