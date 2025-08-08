"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
// Thêm interface cho search suggestion
interface SearchSuggestion {
  name: string;
  type: string;
}

const Height = 40; 

import { getAvatarSrc } from '../../utils/avatarUtils';
import { clearAuthData } from '../../utils/authUtils';

function AvatarImage({ avatar, alt, size = 32, className = "" }: { avatar?: string | null, alt?: string, size?: number, className?: string }) {
  const [imgSrc, setImgSrc] = useState(getAvatarSrc(avatar));
  const [key, setKey] = useState(0); // Thêm key để force re-render
  
  // Cập nhật imgSrc khi avatar thay đổi
  useEffect(() => {
    const newSrc = getAvatarSrc(avatar);
    setImgSrc(newSrc);
    setKey(prev => prev + 1); // Force re-render khi avatar thay đổi
  }, [avatar]);
  
  return (
    <div 
      className={`rounded-full overflow-hidden border border-gray-200 ${className}`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        maxWidth: `${size}px`,
        maxHeight: `${size}px`
      }}
    >
      <Image
        key={key} // Thêm key để force re-render
        src={imgSrc}
        alt={alt || "avatar"}
        width={size}
        height={size}
        className="w-full h-full object-cover"
        onError={() => setImgSrc('/images/avatar-default.png')}
      />
    </div>
  );
}

const Header = () => {
  const { user, setUser, refreshUser, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const hasRefreshed = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleAuthStateChange = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (token && userData) {
        try {
          const loadedUser = JSON.parse(userData);
          setUser(loadedUser);
          hasRefreshed.current = false; // Reset flag khi có user data
          // console.log('Header: loadedUser', loadedUser);
          const isAdmin = ['1', '2'].includes(loadedUser.role);
          const isTryingToAccessAdminArea = pathname.startsWith('/admin');
          if (!isAdmin && isTryingToAccessAdminArea) {
            router.push('/');
          }


        } catch (e) {
          console.error("Lỗi phân tích dữ liệu người dùng từ localStorage:", e);
          clearAuthData();
          setUser(null);
        }
      } else {
        if (pathname.startsWith('/admin')) {
          router.push('/');
        }
        setUser(null);
        hasRefreshed.current = false; // Reset flag khi không có user data
      }
    };
    handleAuthStateChange();
    const storageEventListener = (event: StorageEvent) => {
      if (event.key === 'token' || event.key === 'user' || event.key === null) {
        handleAuthStateChange();
      }
    };
    window.addEventListener('storage', storageEventListener);
    return () => window.removeEventListener('storage', storageEventListener);
  }, [router, pathname, setUser]);

  // Force refresh user data khi component mount để đảm bảo avatar cập nhật
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    // Chỉ refresh khi có token nhưng chưa có user data và chưa refresh, tránh vòng lặp vô hạn
    if (token && !userData && !user && !hasRefreshed.current) {
      hasRefreshed.current = true;
      refreshUser();
    }
  }, [refreshUser, user]);

  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (error) {
        console.error('Lỗi phân tích lịch sử tìm kiếm:', error);
        setSearchHistory([]);
      }
    }
  }, []);

  const fetchSearchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/suggestions?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchSuggestions(data.suggestions || []);
    } catch (error) {
              console.error('Lỗi tải gợi ý tìm kiếm:', error);
      setSearchSuggestions([]);
    }
  };

  const saveSearchHistory = (query: string) => {
    const history = searchHistory.filter(item => item !== query);
    const newHistory = [query, ...history].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      saveSearchHistory(query.trim());
      router.push(`/search?query=${encodeURIComponent(query.trim())}`);
      setSearchValue("");
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchValue) {
        fetchSearchSuggestions(searchValue);
      } else {
        setSearchSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  // useEffect(() => {
  //   const handleScroll = () => {
  //     setScrolled(window.scrollY > Height);
  //   };
  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  return (
    <header className="header">
      <div
        className={`w-full z-50 header-info hidden sm:flex justify-between items-center py-3 px-4 sm:px-6 md:px-8 lg:px-[10%] bg-black text-white transition-all duration-300 fixed top-0 left-0`}
        style={{ height: Height }}
      >
        <div className="header-info-contact flex gap-4 text-sm flex">
          <div className="social-icons">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <i className="fa-brands fa-facebook-f" title="Facebook"></i>
            </a>
            <a
              href="https://www.twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <i className="fa-brands fa-twitter ml-2" title="Twitter"></i>
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <i
                className="fa-brands fa-instagram ml-2 "
                title="Instagram"
              ></i>
            </a>
          </div>
          <div className="address-info">
            <i className="fa-solid fa-house text-red-600 mr-2"></i>
            <span>
              <b>SHOP:</b> 1073/23 CMT8, P7, Q.Tân Bình, TP.HCM
            </span>
          </div>
        </div>
        <div className="header-user-action flex gap-4 items-center text-sm w-full md:w-auto justify-end">
          <div className="phone-info flex items-center">
            <i className="fa-solid fa-phone text-red-600 mr-2"></i>
            <span className="hover:font-bold">
              <b>Hotline: </b>(+84) 313-728-397
            </span>
          </div>
          <div className="login-register hidden md:block md:w-auto relative">
            {user ? (
              <div
                className="relative"
                onMouseEnter={() => {
                  if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
                  setShowDropdown(true);
                }}
                onMouseLeave={() => {
                  dropdownTimeout.current = setTimeout(() => setShowDropdown(false), 400);
                }}
              >
              <button
                className="flex items-center gap-2 bg-transparent border-none cursor-pointer"
                title={user.username}
              >
                <AvatarImage avatar={user.avatar} alt="avatar" size={32} />
              </button>
                {showDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-xl z-50 p-4 text-black animate-fade-in"
                    style={{ minWidth: 220, transition: 'opacity 0.2s' }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <AvatarImage avatar={user.avatar} alt="avatar" size={48}/>
                      <div>
                        <div className="font-bold text-[13px] truncate max-w-[140px]" title={user.username}>
                          {user.fullName || user.username}
                        </div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <hr className="my-2" />
                    <button
                      className="w-full flex items-center gap-2 text-left px-3 py-2 hover:bg-gray-100 rounded transition"
                      onClick={() => router.push('/account')}
                    >
                      <i className="fa-solid fa-user text-gray-500"></i>
                      Tài khoản
                    </button>
                    {['1', '2', 1, 2].includes(user.role) && (
                      <button
                        className="w-full flex items-center gap-2 text-left px-3 py-2 hover:bg-gray-100 rounded transition"
                        onClick={() => router.push('/admin')}
                      >
                        <i className="fa-solid fa-gauge text-gray-500"></i>
                        Vào trang quản trị
                      </button>
                    )}
                    <hr className="my-2" />
                    <button
                      className="w-full flex items-center gap-2 text-left px-3 py-2 hover:bg-red-50 rounded text-red-600 transition"
                      onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
                          logout();
                        }
                      }}
                    >
                      <i className="fa-solid fa-right-from-bracket"></i>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <span
                className="text-gray-200 hover:text-gray-50 cursor-pointer"
                onClick={() => {
                  setShowAuthModal(true);
                }}
              >
                Đăng ký / Đăng nhập
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="md:hidden fixed top-0 left-0 w-full z-50 bg-black text-white flex justify-between items-center px-4" style={{ height: Height }}>
        <button
          className="bg-transparent text-white p-2 -ml-2"
          onClick={() => setSidebarOpen(true)}
          aria-label="Mở menu"
        >
          <i className="fa-solid fa-bars text-2xl"></i>
        </button>

        {/* Logo */}
        <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Image
            src="/images/logoVCLOCK.png"
            alt="Logo"
            width={246}
            height={72}
            className=""
          />
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/account?tab=favorites" className="text-white p-2"> 
            <i className="fa-solid fa-heart text-2xl relative">
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1 min-w-[16px] flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </i>
          </Link>
          <Link href="/cart" className="text-white p-2"> 
            <i className="fa-solid fa-bag-shopping text-2xl"></i>
          </Link>
        </div>
      </div>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex">
          <div className="w-72 bg-white h-full p-6 flex flex-col">
            <button
              className="self-end mb-4 text-2xl"
              onClick={() => setSidebarOpen(false)}
              aria-label="Đóng menu"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <nav className="flex flex-col gap-4 mb-6">
              <Link href="/" className="font-semibold" onClick={() => setSidebarOpen(false)}>TRANG CHỦ</Link>
              <Link href="/about" className="font-semibold" onClick={() => setSidebarOpen(false)}>GIỚI THIỆU</Link>
              <Link href="/shop" className="font-semibold" onClick={() => setSidebarOpen(false)}>CỬA HÀNG</Link>
              <Link href="/news" className="font-semibold" onClick={() => setSidebarOpen(false)}>TIN TỨC</Link>
              <Link href="/contact" className="font-semibold" onClick={() => setSidebarOpen(false)}>LIÊN HỆ</Link>
            </nav>
            <form className="relative flex items-center mb-6">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="p-2 pr-10 rounded-4xl border-2 border-gray-300 w-full"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-800"
                tabIndex={-1}
              >
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
            </form>
            {user ? (
              <div className="mt-auto mb-4">
                <Link 
                  href="/account" 
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
                  onClick={() => setSidebarOpen(false)}
                >
                  <AvatarImage avatar={user.avatar} alt="avatar" size={32} />
                  <span className="font-medium">{user.username}</span>
                </Link>
              </div>
            ) : (
              <div className="mt-auto">
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    setShowAuthModal(true);
                  }}
                  className="w-full text-left p-2 hover:bg-gray-100 rounded font-semibold text-gray-700"
                >
                  Đăng nhập / Đăng ký
                </button>
              </div>
            )}
          </div>
          <div className="flex-1" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}

      <nav
        className={`fixed left-0 w-full px-[10%] py-0 bg-black/50 backdrop-blur-sm z-40 text-white flex justify-between items-center transition-all duration-300 hidden md:flex`}
        style={{ top: Height }}
      >
        <div className="navbar relative">
          <Link href="/" className="hover:text-red-400 transition font-semibold">
            TRANG CHỦ
          </Link>
          <Link
            href="/about"
            className="hover:text-red-400 transition ml-4 font-semibold"
          >
            GIỚI THIỆU
          </Link>

          <div className="inline-block relative ml-4">
            <Link
              href="/shop"
              className="hover:text-red-400 transition flex items-center font-semibold"
            >
              CỬA HÀNG
              {/* <i className="fa-solid fa-chevron-down ml-1 transition-transform duration-200"></i> */}
            </Link>
          </div>

          <Link
            href="/news"
            className="hover:text-red-400 transition ml-4 font-semibold"
          >
            TIN TỨC
          </Link>
          <Link
            href="/contact"
            className="hover:text-red-400 transition ml-4 font-semibold"
          >
            LIÊN HỆ
          </Link>
        </div>
        <div className="header-logo text-center">
          <Link href="/" className="">
            <Image
              src="/images/logoVCLOCK.png"
              alt="Logo"
              width={240}
              height={80}
              className="mx-auto"
            />
          </Link>
        </div>
        <div className="header-search relative">
          <form
            className="relative flex items-center"
            onSubmit={e => {
              e.preventDefault();
              handleSearch(searchValue);
            }}
          >
            <div className="relative flex items-center group">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
                className="pl-10 pr-10 py-2 w-64 rounded-full border border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:shadow-lg group-focus-within:shadow-lg group-focus-within:border-red-500 transition-all duration-200"
              value={searchValue}
              onChange={e => {
                setSearchValue(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)' }}
            />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-all duration-200">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>
              {searchValue && (
            <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition"
                  onClick={() => setSearchValue('')}
              tabIndex={-1}
                  aria-label="Xóa tìm kiếm"
            >
                  <i className="fa fa-times-circle"></i>
            </button>
              )}
            </div>
          </form>

          {showSuggestions && (searchValue || searchHistory.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
              {searchValue && searchSuggestions.length > 0 && (
                <div className="p-2">
                  <div className="text-xs text-gray-500 px-2 py-1">Gợi ý tìm kiếm</div>
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="w-full text-left px-2 py-2 hover:bg-gray-100 rounded text-sm text-gray-700 flex items-center"
                      onClick={() => handleSearch(suggestion.name)}
                    >
                      <i className="fa-solid fa-magnifying-glass text-gray-400 mr-2"></i>
                      {suggestion.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Search History */}
              {!searchValue && searchHistory.length > 0 && (
                <div className="p-2">
                  <div className="text-xs text-gray-500 px-2 py-1">Lịch sử tìm kiếm</div>
                  {searchHistory.map((item, index) => (
                    <div
                      key={index}
                      className="w-full text-left px-2 py-2 hover:bg-gray-100 rounded text-sm text-gray-700 flex items-center justify-between"
                    >
                      <button
                        className="flex items-center flex-1 text-left"
                        onClick={() => handleSearch(item)}
                      >
                        <i className="fa-solid fa-clock text-gray-400 mr-2"></i>
                        {item}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newHistory = searchHistory.filter((_, i) => i !== index);
                          setSearchHistory(newHistory);
                          localStorage.setItem('searchHistory', JSON.stringify(newHistory));
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 ml-2"
                        type="button"
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!searchValue && (
                <div className="p-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 px-2 py-1">Tìm kiếm phổ biến</div>
                  <div className="flex flex-wrap gap-1">
                    {['Đồng hồ nam', 'Đồng hồ nữ', 'Breguet', 'Cartier', 'Luxury'].map((tag, index) => (
                      <button
                        key={index}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700"
                        onClick={() => handleSearch(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="header-cart flex items-center gap-4">
          <Link href="/account?tab=favorites" className="flex items-center font-semibold relative">
            <i className="fa-solid fa-heart text-2xl relative">
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1 min-w-[16px] flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </i>
          </Link>
          <Link href="/cart" className="flex items-center font-semibold relative">
            <i className="fa-solid fa-bag-shopping text-2xl relative">
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1 min-w-[16px] flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </i>
          </Link>
        </div>

      </nav>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </header>
  );
};

export default Header;