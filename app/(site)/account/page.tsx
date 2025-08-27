"use client";

import { useRef, useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IAddress, IProduct } from "../cautrucdata";
import OrderCard from "./OrderCard ";
import VoucherCard from "../components/VoucherCard";
import AddressSelector from "../components/AddressSelector";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../components/WishlistContext";
import { toast } from "react-toastify";
import Image from "next/image";
import { getAvatarSrc } from "../../utils/avatarUtils";
import { getProductImageUrl } from '@/app/utils/imageUtils';
import * as Dialog from "@radix-ui/react-dialog";
interface WishlistItem {
  _id: string;
  product_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  product: IProduct;
}

interface TabItem {
  key: "info" | "orders" | "favorites" | "addresses" | "voucher";
  label: string;
  icon: string;
}

const tabItems: TabItem[] = [
  { key: "info", label: "Tài khoản", icon: "fa-solid fa-user" },
  { key: "favorites", label: "Sản phẩm yêu thích", icon: "fa-solid fa-heart" },
  { key: "addresses", label: "Địa chỉ của tôi", icon: "fa-solid fa-location-dot" },
  { key: "voucher", label: "Voucher", icon: "fa-solid fa-ticket" },
];

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser, logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({
    receiver_name: '',
    phone: '',
    address: ''
  });
  const [tab, setTab] = useState<"info" | "orders" | "favorites" | "addresses" | "voucher">("info");
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteAddressModal, setShowDeleteAddressModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  const [showClearWishlistModal, setShowClearWishlistModal] = useState(false);
  

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'favorites') {
      setTab('favorites');
    }
  }, [searchParams]);
  
  const [avatar, setAvatar] = useState("/images/avatar-default.png"); 
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const { refreshWishlistCount } = useWishlist();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: ''
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      setIsLoading(false);
    } else {
      setIsAuthenticated(true);
      
      if (user) {
        if (!isEditingProfile) {
          setEditForm({ fullName: user.fullName || '' });
        }
        const newAvatar = getAvatarSrc(user.avatar);
        setAvatar(newAvatar);
      }
      setIsLoading(false);
    }
  }, [user, router, isEditingProfile]);


  const memoizedAvatar = useMemo(() => {
    return getAvatarSrc(user?.avatar);
  }, [user?.avatar]);


  useEffect(() => {
    if (user?.avatar) {
      setAvatar(memoizedAvatar);
    }
  }, [memoizedAvatar, user?.avatar]);


  useEffect(() => {
    setAvatarError(false);
  }, [avatar]);

  const fetchAddresses = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error("Lỗi tải địa chỉ:", error);
    }
  }, []);


  useEffect(() => {
    if (tab === 'addresses') {
      fetchAddresses();
    }
  }, [tab, fetchAddresses]);

  const fetchWishlistItems = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setIsLoadingWishlist(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách yêu thích:", error);
    } finally {
      setIsLoadingWishlist(false);
    }
  }, []);


  useEffect(() => {
    if (tab === 'favorites') {
      fetchWishlistItems();
    }
  }, [tab, fetchWishlistItems]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatar(previewUrl);
    }
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!editForm.fullName.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return;
    }

    if (editForm.fullName.trim().length < 2) {
      toast.error("Họ tên phải có ít nhất 2 ký tự");
      return;
    }

    if (editForm.fullName.trim().length > 50) {
      toast.error("Họ tên không được quá 50 ký tự");
      return;
    }

    const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
    if (!nameRegex.test(editForm.fullName.trim())) {
      toast.error("Họ tên chỉ được chứa chữ cái và khoảng trắng");
      return;
    }

    const formData = new FormData();
    formData.append('fullname', editForm.fullName.trim());
    if (selectedAvatarFile) {
      formData.append('avatar', selectedAvatarFile);
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
const result = await response.json();
      if (response.ok) {
        await refreshUser();
        
        setEditForm({ fullName: result.user.fullName || '' });
        if (result.user.avatar) {
          const updatedAvatar = getAvatarSrc(result.user.avatar);
          setAvatar(updatedAvatar);
        }
        setSelectedAvatarFile(null);
        setIsEditingProfile(false);
        
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'user',
          newValue: JSON.stringify(result.user)
        }));
        
        toast.success("Cập nhật thông tin thành công!");
      } else {
        toast.error(result.message || "Có lỗi xảy ra khi cập nhật thông tin!");
      }
    } catch (error) {
      console.error("Lỗi cập nhật hồ sơ:", error);
      toast.error("Có lỗi xảy ra khi cập nhật thông tin!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = useCallback(() => {
    setIsEditingProfile(false);
    setEditForm({ fullName: user?.fullName || '' });
    setSelectedAvatarFile(null);
    if (user?.avatar) {
      const originalAvatar = getAvatarSrc(user.avatar);
      setAvatar(originalAvatar);
    }
  }, [user?.fullName, user?.avatar]);

  const handleFullNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setEditForm(prev => ({ ...prev, fullName: newValue }));
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    const { receiver_name, phone, address } = newAddress;
    
    if (!receiver_name.trim()) {
      toast.error("Vui lòng nhập tên người nhận!");
      return;
    }
    if (!phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại!");
      return;
    }
    if (!address.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao hàng!");
      return;
    }
    
    const addressParts = address.split(', ');
    if (addressParts.length < 3) {
      toast.error("Vui lòng chọn đầy đủ địa chỉ!");
      return;
    }
    
    const streetAddress = addressParts.slice(0, -3).join(', ').trim();
    if (!streetAddress) {
      toast.error("Vui lòng nhập số nhà và tên đường!");
      return;
    }
    
    if (receiver_name.trim().length < 2) {
      toast.error("Tên người nhận phải có ít nhất 2 ký tự!");
      return;
    }
    if (!/^[\p{L}\s]+$/u.test(receiver_name.trim())) {
      toast.error("Tên người nhận chỉ được chứa chữ cái và khoảng trắng!");
      return;
    }
    if (!/^[0-9]{10,11}$/.test(phone.trim())) {
      toast.error("Số điện thoại phải có 10-11 chữ số!");
      return;
    }
    if (address.trim().length < 6) {
      toast.error("Địa chỉ phải có ít nhất 6 ký tự!");
      return;
    }
    if (!/^[\p{L}\d\s,.-]+$/u.test(address.trim())) {
      toast.error("Địa chỉ chứa ký tự không hợp lệ!");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/addresses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiver_name: receiver_name.trim(),
          phone: phone.trim(),
          address: address.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses([...addresses, data]);
        setNewAddress({ receiver_name: '', phone: '', address: '' });
        setIsAddingAddress(false);
        toast.success("Thêm địa chỉ mới thành công!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Lỗi khi thêm địa chỉ!");
      }
    } catch (error) {
      console.error("Lỗi thêm địa chỉ:", error);
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau!");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    setAddressToDelete(addressId);
    setShowDeleteAddressModal(true);
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/addresses/${addressToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setAddresses(addresses.filter(addr => addr._id !== addressToDelete));
        toast.success("Xóa địa chỉ thành công!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Lỗi khi xóa địa chỉ!");
      }
    } catch (error) {
      console.error("Lỗi xóa địa chỉ:", error);
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau!");
    } finally {
      setShowDeleteAddressModal(false);
      setAddressToDelete(null);
    }
  };

  const handleEditAddress = (address: IAddress) => {
    setEditingAddressId(address._id);
    setNewAddress({
      receiver_name: address.receiver_name,
      phone: address.phone.toString(),
address: address.address
    });
    setIsEditingAddress(true);
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !editingAddressId) return;

    const { receiver_name, phone, address } = newAddress;
    
    if (!receiver_name.trim()) {
      toast.error("Vui lòng nhập tên người nhận!");
      return;
    }
    if (!phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại!");
      return;
    }
    if (!address.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao hàng!");
      return;
    }
  
    const addressParts = address.split(', ');
    if (addressParts.length < 3) {
      toast.error("Vui lòng chọn đầy đủ địa chỉ!");
      return;
    }
    
    const streetAddress = addressParts.slice(0, -3).join(', ').trim();
    if (!streetAddress) {
      toast.error("Vui lòng nhập số nhà và tên đường!");
      return;
    }
    
    if (receiver_name.trim().length < 2) {
      toast.error("Tên người nhận phải có ít nhất 2 ký tự!");
      return;
    }
    if (!/^[\p{L}\s]+$/u.test(receiver_name.trim())) {
      toast.error("Tên người nhận chỉ được chứa chữ cái và khoảng trắng!");
      return;
    }
    if (!/^[0-9]{10,11}$/.test(phone.trim())) {
      toast.error("Số điện thoại phải có 10-11 chữ số!");
      return;
    }
    if (address.trim().length < 6) {
      toast.error("Địa chỉ phải có ít nhất 6 ký tự!");
      return;
    }
    if (!/^[\p{L}\d\s,.-]+$/u.test(address.trim())) {
      toast.error("Địa chỉ chứa ký tự không hợp lệ!");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/addresses/${editingAddressId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiver_name: receiver_name.trim(),
          phone: phone.trim(),
          address: address.trim()
        })
      });

      if (response.ok) {
        const updatedAddress = await response.json();
        setAddresses(addresses.map(addr => 
          addr._id === editingAddressId ? updatedAddress : addr
        ));
        setNewAddress({ receiver_name: '', phone: '', address: '' });
        setIsEditingAddress(false);
        setEditingAddressId(null);
        toast.success("Cập nhật địa chỉ thành công!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Lỗi khi cập nhật địa chỉ!");
      }
    } catch (error) {
      console.error("Lỗi cập nhật địa chỉ:", error);
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau!");
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWishlistItems(wishlistItems.filter(item => item.product_id !== productId));
        refreshWishlistCount(); 
        toast.success('Đã hủy yêu thích sản phẩm!');
      }
    } catch (error) {
      console.error("Lỗi hủy yêu thích:", error);
      toast.error('Có lỗi xảy ra khi hủy yêu thích sản phẩm.');
    }
  };



  const handleSetDefaultAddress = async (id: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/addresses/${id}/set-default`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        }
      });
      await fetchAddresses(); 
      toast.success("Đã đặt địa chỉ làm mặc định thành công!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage =
        error.response?.data?.message || "Không thể đặt mặc định. Vui lòng thử lại.";
      console.error("Lỗi đặt địa chỉ mặc định:", err);
      toast.error(errorMessage);
    }
  };


  const handleClearWishlist = async () => {
    setShowClearWishlistModal(true);
  };

  const confirmClearWishlist = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      setIsLoadingWishlist(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/wishlist/all`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      
      if (response.ok) {
        setWishlistItems([]);
        refreshWishlistCount();
        toast.success('Đã hủy toàn bộ sản phẩm khỏi danh sách yêu thích!');
      } else {
        toast.error(result.message || 'Có lỗi xảy ra khi xóa toàn bộ wishlist.');
      }
    } catch (error) {
              console.error("Lỗi xóa toàn bộ danh sách yêu thích:", error);
      toast.error('Có lỗi xảy ra khi xóa toàn bộ wishlist.');
    } finally {
      setIsLoadingWishlist(false);
      setShowClearWishlistModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;
return (
    <main className="max-w-6xl mx-auto py-10 px-4 pt-40 font-sans bg-gray-50 min-h-screen">
      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <aside className="w-full md:w-1/4 bg-gradient-to-b from-red-600 to-black border border-gray-200 p-6 min-h-screen">
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-15 h-15 mb-4 group">
                <div 
                  className="w-15 h-15 rounded-full overflow-hidden border border-gray-200"
                  style={{ 
                    minWidth: '60px',
                    minHeight: '60px',
                    maxWidth: '60px',
                    maxHeight: '60px'
                  }}
                >
                  <Image
                    src={avatarError ? "/images/avatar-default.png" : avatar}
                    alt={user?.fullName || 'User Avatar'}
                    width={60}
                    height={60}
                    className="w-full h-full object-cover"
                    onError={() => {
                      setAvatarError(true);
                    }}
                    unoptimized={avatar?.startsWith('http')}
                  />
                </div>
                {isEditingProfile && (
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 border border-gray-200 hover:bg-gray-50 transition-all duration-300"
                  >
                    <i className="fa-solid fa-camera text-gray-600"></i>
                  </button>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <h2 className="text-sm font-bold text-white">{user?.fullName}</h2>
              <p className="text-gray-300">{user?.email}</p>
            </div>

            <nav className="space-y-2">
              {tabItems.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    tab === key
                      ? "bg-red-50 text-red-600"
                      : "text-white hover:bg-red-500 hover:bg-opacity-20"
                  }`}
                >
                  <i className={`${icon} w-5 h-5`}></i>
                  <span className="font-medium">{label}</span>
                </button>
              ))}
              <button
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-white hover:bg-red-500 hover:bg-opacity-20 transition-all duration-200"
                onClick={handleLogout}
              >
                <i className="fa-solid fa-right-from-bracket w-5 h-5"></i>
                <span className="font-medium">Đăng xuất</span>
              </button>
            </nav>
          </aside>
          <section className="flex-1 p-8 bg-white">
            {tab === "info" && (
              <div className="max-w-2xl mx-auto relative">
                {/* them */}
<div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-800">Thông tin tài khoản</h2>
                  {!isEditingProfile && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditForm({ fullName: user?.fullName || '' });
                        setIsEditingProfile(true);
                      }}
                      className="bg-red-600 text-sm text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 flex items-center space-x-2"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                      <span>Chỉnh sửa</span>
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          readOnly
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed focus:ring-0 focus:border-gray-300 transition-all duration-200 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Tên </label>
                        <input
                          type="text"
                          value={editForm.fullName}
                          onChange={handleFullNameChange}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-sm"
                          placeholder="Nhập tên đầy đủ"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="bg-red-600  text-sm text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                      >
                        <i className="fa-solid fa-save"></i>
                        <span>{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
className="bg-gray-600 text-sm text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2"
                      >
                        <i className="fa-solid fa-times"></i>
                        <span>Hủy</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          readOnly
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed focus:ring-0 focus:border-gray-300 transition-all duration-200 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Tên</label>
                        <input
                          type="text"
                          value={user?.fullName || ''}
                          readOnly
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed focus:ring-0 focus:border-gray-300 transition-all duration-200 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                
                <div className="mt-10">
                  <h2 className="text-lg font-bold text-gray-800 mb-6">Đơn hàng của tôi</h2>
                  <OrderCard user_id={user?._id || ""} />
                </div>
              </div>
            )}
            {tab === "addresses" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-gray-800">Địa chỉ </h2>
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center space-x-2"
                  >
                    <i className="fa-solid fa-plus"></i>
                    <span className="text-sm">Thêm địa chỉ mới</span>
                  </button>
                </div>

                {isAddingAddress && (
                  <form onSubmit={handleAddAddress} className="mb-8 p-6 bg-white rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Thêm địa chỉ mới</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Tên người nhận</label>
                                                 <input
                           type="text"
                           value={newAddress.receiver_name}
                           onChange={(e) => setNewAddress({...newAddress, receiver_name: e.target.value})}
                           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-200 focus:border-red-500"
                           placeholder="Ví dụ: Nguyễn Văn A"
                           required={false}
                         />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Số điện thoại</label>
                                               <input
                           type="tel"
                           value={newAddress.phone}
                           onChange={(e) => {
                             const value = e.target.value.replace(/[^0-9]/g, '');
                             setNewAddress({ ...newAddress, phone: value });
                           }}
                           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-200 focus:border-red-500"
                           placeholder="Ví dụ: 0901234567"
                           required={false}
                         />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Địa chỉ</label>
                        <AddressSelector
                          value={newAddress.address}
                          onChange={(addr) => setNewAddress({ ...newAddress, address: addr })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingAddress(false);
                          setNewAddress({ receiver_name: '', phone: '', address: '' });
                        }}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center space-x-2"
                      >
                        <i className="fa-solid fa-plus"></i>
                        <span>Thêm</span>
                      </button>
                    </div>
                  </form>
                )}

                {isEditingAddress && (
<form onSubmit={handleUpdateAddress} className="mb-8 p-6 bg-white rounded-xl border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Chỉnh sửa địa chỉ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Tên người nhận</label>
                                                 <input
                           type="text"
                           value={newAddress.receiver_name}
                           onChange={(e) => setNewAddress({...newAddress, receiver_name: e.target.value})}
                           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-200 focus:border-red-500"
                           required={false}
                         />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">Số điện thoại</label>
                                                 <input
                           type="tel"
                           value={newAddress.phone}
                           onChange={(e) => {
                             const value = e.target.value.replace(/[^0-9]/g, '');
                             setNewAddress({...newAddress, phone: value});
                           }}
                           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-200 focus:border-red-500"
                           required={false}
                         />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-700 text-sm font-medium mb-2">Địa chỉ</label>
                                                 <input
                           type="text"
                           value={newAddress.address}
                           onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                           className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-200 focus:border-red-500"
                           required={false}
                         />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingAddress(false);
                          setEditingAddressId(null);
                          setNewAddress({ receiver_name: '', phone: '', address: '' });
                        }}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
                      >
                        Hủy
                      </button>
                      <button
type="submit"
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center space-x-2"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                        <span>Cập nhật</span>
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 gap-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`bg-white p-4 rounded-xl border transition-all duration-200 ${
                        addr.is_default ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-red-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-800 text-sm">{addr.receiver_name}</h3>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditAddress(addr)}
                                className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                              >
                                <i className="fa-solid fa-pen-to-square"></i>
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr._id)}
                                className="text-red-600 hover:text-red-700 transition-colors duration-200"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-8 gap-y-1 mt-1">
                            <span className="flex items-center text-sm text-gray-500">
                              <i className="fa-solid fa-phone text-gray-400 mr-1"></i>
                              <span className="font-semibold">Số điện thoại:</span>
                              <span className="ml-1 text-gray-800">{String(addr.phone)}</span>
                            </span>
                            <span className="flex items-center text-sm text-gray-500">
                              <i className="fa-solid fa-location-dot text-gray-400 mr-1"></i>
                              <span className="font-semibold">Địa chỉ:</span>
                              <span className="ml-1 text-gray-800">{addr.address}</span>
                            </span>
                          </div>
                  <div className="mt-2 flex items-center justify-between">
                            {addr.is_default ? (
                              <span className="text-sm text-red-600 font-semibold">
                                <i className="fa-solid fa-check-circle mr-1"></i> Địa chỉ mặc định
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSetDefaultAddress(addr._id)}
                                className="text-sm text-blue-600 hover:underline"
                              >
                                Đặt làm mặc định
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>


                {addresses.length === 0 && !isAddingAddress && !isEditingAddress && (
                  <div className="text-center py-12">
                    <i className="fa-solid fa-location-dot text-6xl text-gray-400 mb-4"></i>
                    <p className="text-gray-500 text-lg">Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ mới!</p>
                  </div>
                )}
              </div>
            )}

            {tab === "orders" && (
              <div className="space-y-8">
              <h2 className="text-lg font-bold text-gray-800">Đơn hàng của tôi</h2>
        
              <OrderCard user_id={user?._id || ""}/>
            </div>
            )}

            {tab === "favorites" && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-6">Sản phẩm yêu thích</h2>

                {wishlistItems.length > 0 && (
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={handleClearWishlist}
                      className="bg-red-600 text-sm text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center space-x-2"
                      disabled={isLoadingWishlist}
                    >
                      <i className="fa-solid fa-trash"></i>
                      <span>{isLoadingWishlist ? 'Đang xóa...' : 'Xóa tất cả'}</span>
                    </button>
                  </div>
                )}
                {isLoadingWishlist ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                  </div>
                ) : wishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {wishlistItems.map((item) => (
                      <div key={item._id} className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-red-300 transition-all duration-200 max-w-[180px] mx-auto">
                        <div className="relative h-24 bg-white flex items-center justify-center">
                        <Image
                          src={item.product.main_image ? 
                            (typeof item.product.main_image === 'string' ? 
                              getProductImageUrl(item.product.main_image) : 
                              getProductImageUrl(item.product.main_image.image)
                            ) : '/sp1.png'}
                          alt={item.product.name}
                          width={100}
                          height={100}
                          className="w-full h-full object-contain transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
                          onError={() => {
                          }}
                        />
                        </div>
                        <div className="p-2">
                          <h3 className="font-medium text-gray-800 text-xs mb-1 line-clamp-2">{item.product.name}</h3>
                          <p className="text-red-600 font-bold text-xs mb-2">{item.product.price.toLocaleString('vi-VN')}đ</p>
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100 gap-2">
                            <button
                              onClick={() => router.push(`/product/${item.product_id}`)}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-red-500 text-xs font-medium hover:bg-red-500 hover:text-white transition-all duration-150"
                            >
                              <i className="fa-solid fa-eye text-xs"></i>
                              <span>Xem</span>
                            </button>
                            <button
                              onClick={() => handleRemoveFromWishlist(item.product_id)}
                              className="flex items-center justify-center px-2 py-1 rounded bg-gray-100 text-red-500 hover:bg-red-50 transition-all duration-150"
                              title="Hủy yêu thích"
                            >
                              <i className="fa-solid fa-heart text-xs"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <i className="fa-solid fa-heart text-6xl text-gray-400 mb-4"></i>
                    <p className="text-gray-500 text-lg">Bạn chưa có sản phẩm yêu thích nào.</p>
                  </div>
                )}
              </div>
            )}

            {tab === "voucher" && (
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-6">Voucher của bạn</h2>
                <div className="flex flex-col gap-6 max-w-6xl w-full mx-auto">
                  <VoucherCard user_id={user?._id || ""} />
                </div>

                {(!user || !user._id) && (
                  <div className="text-center py-12">
                    <i className="fa-solid fa-ticket text-6xl text-gray-400 mb-4"></i>
                    <p className="text-gray-500 text-lg">Bạn chưa có voucher nào.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
      <Dialog.Root open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30" />
          <Dialog.Content className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-auto fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 space-y-4 z-50">
            <Dialog.Title className="text-lg font-semibold text-red-600">Xác nhận đăng xuất</Dialog.Title>
            <div className="text-sm text-gray-600">
              Bạn có chắc chắn muốn đăng xuất?
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button className="px-4 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-100">
                  Hủy
                </button>
              </Dialog.Close>
              <button
                onClick={confirmLogout}
                className="px-4 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700"
              >
                Đăng xuất
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <Dialog.Root open={showDeleteAddressModal} onOpenChange={setShowDeleteAddressModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30" />
          <Dialog.Content className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-auto fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 space-y-4 z-50">
            <Dialog.Title className="text-lg font-semibold text-red-600">Xác nhận xóa địa chỉ</Dialog.Title>
            <div className="text-sm text-gray-600">
              Bạn có chắc chắn muốn xóa địa chỉ này?
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button className="px-4 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-100">
                  Hủy
                </button>
              </Dialog.Close>
              <button
                onClick={confirmDeleteAddress}
                className="px-4 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>



      <Dialog.Root open={showClearWishlistModal} onOpenChange={setShowClearWishlistModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30" />
          <Dialog.Content className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-auto fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 space-y-4 z-50">
            <Dialog.Title className="text-lg font-semibold text-red-600">Xóa toàn bộ yêu thích</Dialog.Title>
            <div className="text-sm text-gray-600">
              Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button className="px-4 py-1.5 text-sm rounded border border-gray-300 hover:bg-gray-100">
                  Hủy
                </button>
              </Dialog.Close>
              <button
                onClick={confirmClearWishlist}
                disabled={isLoadingWishlist}
                className="px-4 py-1.5 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isLoadingWishlist ? 'Đang xóa...' : 'Xóa tất cả'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  );
}