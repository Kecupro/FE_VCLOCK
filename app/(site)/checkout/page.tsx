"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { ICart, IAddress, IPaymentMethod, IVoucher } from "../cautrucdata";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import * as Dialog from "@radix-ui/react-dialog"; 
import AddressSelector from "../components/AddressSelector";
import { useRouter } from "next/navigation";
import OptimizedImage from "../components/OptimizedImage";
import AuthModal from "../components/AuthModal";

function formatCurrency(value: number) {
	return value.toLocaleString("vi-VN") + "đ";
  }
  
  function formatDate(date: Date | string) {
	return new Date(date).toLocaleDateString("vi-VN");
  }

export default function CheckoutPage() {
	const [token, setToken] = useState<string | null>(null);
	const [cart, setCart] = useState<ICart[]>([]);
  	const [total, setTotal] = useState(0);
  	const { user } = useAuth();
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
	const [selectedPayment, setSelectedPayment] = useState("COD");	  
	const [addresses, setAddresses] = useState<IAddress[]>([]);
	const [showNewAddressForm, setShowNewAddressForm] = useState(false);
	const [selectedAddressId, setSelectedAddressId] = useState(""); 
	const [isChangingAddress, setIsChangingAddress] = useState(false); 
	const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);  
	const [tempSelectedAddressId, setTempSelectedAddressId] = useState(""); 
	const [isLoading, setIsLoading] = useState(false);

	const [newAddress, setNewAddress] = useState({
		receiver_name: '',
		phone: '',
		address: ''
	  });

	  const router = useRouter();

	  const headers = useMemo(() => ({
		"Content-Type": "application/json",
		...(token && { "Authorization": `Bearer ${token}` }),
	  }), [token]);
	  useEffect(() => {
		const storedToken = localStorage.getItem("token");
		setToken(storedToken);
	  }, []);


	const [vouchers, setVouchers] = useState<IVoucher[]>([]);
	const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | null>(null);
		
	  const fetchVouchers = useCallback(async () => {
		try {
		  const token = localStorage.getItem("token");
		  if (!token) {
			setVouchers([]);
			return;
		  }
	
		  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voucher-user`, {
			headers: {
				Authorization: `Bearer ${token}`,
			  },
		  });
	
		  if (res.ok) {
			const data: IVoucher[] = await res.json();
			if (Array.isArray(data)) {
				const unusedVouchers = data.filter(
					(v) => !v.used && new Date(v.end_date) > new Date()
				);
				setVouchers(unusedVouchers);
			} else {
				setVouchers([]);
			}
		  } else {
			setVouchers([]);
		  }
		  		} catch (err) {
			console.error("Lỗi khi tải voucher:", err);
			setVouchers([]);
		  }
		}, []);

	useEffect(() => {
		fetchVouchers();
	}, [fetchVouchers]);	  


	  const fetchAddresses = useCallback(async () => {
		const token = localStorage.getItem("token");
		if (!token) return;
	
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/addresses`, {
				headers,
			});
			if (response.ok) {
				const data = await response.json();
				const reversedData = [...data].reverse();
	
				setAddresses(reversedData);
			}
		} catch (error) {
			console.error("Lỗi tải địa chỉ:", error);
		}
	}, [headers]);

	const getLatestAddress = useCallback(() => {
		if (addresses.length === 0) return null;
		return [...addresses].sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())[0];
	  }, [addresses]);



	useEffect(() => {
		if (token) {
			fetchAddresses();
		}
	}, [token, fetchAddresses]);

	useEffect(() => {
		const handleAuthSuccess = (event: CustomEvent) => {
			const { returnUrl } = event.detail;
			if (returnUrl === '/checkout') {
				const newToken = localStorage.getItem("token");
				setToken(newToken);
				fetchVouchers();
				fetchAddresses();
				toast.success("Đăng nhập thành công! Bạn có thể tiếp tục thanh toán!");
			}
		};
		window.addEventListener('auth_success', handleAuthSuccess as EventListener);
		return () => window.removeEventListener('auth_success', handleAuthSuccess as EventListener);
	}, [fetchVouchers, fetchAddresses]);
	

	useEffect(() => {
		if (addresses.length > 0 && !selectedAddressId && !showNewAddressForm) {
			const defaultAddr = addresses.find(addr => addr.is_default);
			if (defaultAddr) {
				setSelectedAddressId(defaultAddr._id);
			} else {
				const latest = getLatestAddress();
				if (latest) setSelectedAddressId(latest._id);
			}
		}
	}, [addresses, selectedAddressId, showNewAddressForm, getLatestAddress]);
	  
	  const handleChangeAddressClick = () => {
		setIsSubmittingAddress(true); 
	  
		setTimeout(() => {
		  setIsChangingAddress(true);
		  setTempSelectedAddressId(selectedAddressId);
		  setIsSubmittingAddress(false); 
		}, 800); 
	  };
	  


	const [originalTotal, setOriginalTotal] = useState<number>(0); 

	const subtotal = useCallback((cartItems: ICart[]) => {
		const sum = cartItems.reduce(
		  (acc, item) =>
			acc + (item.sale_price > 0 ? item.sale_price : item.price) * item.so_luong,
		  0
		);
		setTotal(sum);
		if (originalTotal !== sum) setOriginalTotal(sum);
	  }, [originalTotal]);
	

	const finalTotal = useMemo(() => {
		if (!selectedVoucher) return originalTotal;
	  	
		if (originalTotal < (selectedVoucher.minimum_order_value || 0)) {
		  return originalTotal;
		}
	  	
		if (selectedVoucher.discount_type === "percentage") {
		  const rawDiscount = (originalTotal * selectedVoucher.discount_value) / 100;
		  const maxDiscount = selectedVoucher.max_discount || Infinity;
		  const discount = Math.min(rawDiscount, maxDiscount);
		  return originalTotal - discount;
		}
	  	

		return originalTotal - selectedVoucher.discount_value;
	}, [originalTotal, selectedVoucher]);
	  



	  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isBuyNow = urlParams.get('buyNow') === 'true';
    
    if (isBuyNow) {
      const buyNowSession = localStorage.getItem("buyNowSession");
      if (buyNowSession) {
        const session = JSON.parse(buyNowSession);
        setCart(session.items);
        subtotal(session.items);
        localStorage.removeItem("buyNowSession");
      }
    } else {
      const storedCart = localStorage.getItem("cart");
      const storedSelected = localStorage.getItem("selectedItems");
        
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        const selectedIds: string[] = storedSelected ? JSON.parse(storedSelected) : [];
      
        const filteredCart =
          selectedIds.length > 0
            ? parsedCart.filter((item: ICart) => selectedIds.includes(item._id))
            : parsedCart;
      
        setCart(filteredCart);
        subtotal(filteredCart);
      }
    }
  }, [subtotal]);	  



	const [form, setForm] = useState({
		name: "",
		address: "",
		phone: "",
		note: "",
		coupon: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};


	useEffect(() => {
		const fetchPaymentMethods = async () => {
			try {
				const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment-method`);
				if (!response.ok) {
					throw new Error("Failed to fetch payment methods");
				}
				const data = await response.json();
	
				if (data.list && Array.isArray(data.list)) {
					setPaymentMethods(data.list);
				} else if (Array.isArray(data)) {
					setPaymentMethods(data);
				} else {
					console.error("Cấu trúc dữ liệu không đúng:", data);
					setPaymentMethods([]);
				}
				
				setSelectedPayment("COD"); 
					} catch (error) {
			console.error("Lỗi tải phương thức thanh toán:", error);
			setPaymentMethods([]);
			}
		};
		fetchPaymentMethods();
	}, []);

	const handlePostOrderSuccess = () => {
    toast.success("Đặt hàng thành công!");

    const urlParams = new URLSearchParams(window.location.search);
    const isBuyNow = urlParams.get('buyNow') === 'true';
    
    if (isBuyNow) {
      localStorage.removeItem("buyNowSession");
    } else {
      const selectedIds = JSON.parse(localStorage.getItem("selectedItems") || "[]");
      const fullCart = JSON.parse(localStorage.getItem("cart") || "[]");

      const updatedCart = fullCart.filter((item: ICart) => !selectedIds.includes(item._id));

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      localStorage.removeItem("selectedItems");
      setCart(updatedCart);
    }

    setForm({
        name: "",
        address: "",
        phone: "",
        note: "",
        coupon: "",
    });
    setSelectedVoucher(null);

    window.location.href = '/checkout-success';
};	
	
	const submitOrder = async (addressId?: string) => {
		if (!user) {
			toast.error("Vui lòng đăng nhập để tiếp tục thanh toán!");
			setShowAuthModal(true);
			return;
		}

		const selectedIds = JSON.parse(localStorage.getItem("selectedItems") || "[]");
		const selectedCartItems = cart.filter(item => selectedIds.includes(item._id));
		const selectedPaymentObj = paymentMethods.find(p => p.code === selectedPayment);

		const orderCode = Math.floor(100000 + Math.random() * 900000);
		const orderData = {
		  user_id: user._id,
		  cart: selectedCartItems,
		  total_amount: finalTotal,
		  note: form.note || "",
		  voucher_id: selectedVoucher?._id || null,
		  discount_amount: selectedVoucher ? originalTotal - finalTotal : 0,
		  payment_method_id: selectedPaymentObj?._id,
		  ...(addressId || selectedAddressId 
			? { address_id: addressId || selectedAddressId }
			: { new_address: form }),
		};
	  
		try {
		  
		  if (!selectedPaymentObj) {
			toast.error("Phương thức thanh toán không hợp lệ.");
			return;
		  }
		  
		  if (selectedPayment === "BANK_TRANSFER") {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create-payment-link`, {
			  method: "POST",
			  headers: { 
				"Content-Type": "application/json",
				...(token && { "Authorization": `Bearer ${token}` })
			  },
			  body: JSON.stringify({
				orderData,
				orderCode,
				amount: finalTotal,
				description: `Thanh toán DH ${orderCode}`,
			  }),
			});
			
			const resData = await response.json();

			if (resData.checkoutUrl) {
			  window.location.href = resData.checkoutUrl;
			} else if (resData.errors && Array.isArray(resData.errors)) {
			  const errorMessages = resData.errors.map((error: { message: string }) => error.message).join('\n');
			  toast.error(`\n${errorMessages} `, {
				autoClose: 5000,
				closeOnClick: false,
				pauseOnHover: true
			  });
			  router.push('/checkout-cancel');
			} else {
			  toast.error("Không thể lấy link thanh toán. Vui lòng thử lại.");
			  router.push('/checkout-cancel');
			}
		  } else {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkout`, {
			  method: "POST",
			  headers,
			  body: JSON.stringify({orderCode, orderData}),  
			});
			const data = await res.json();
	  
			if (data?.order_id) {
			  handlePostOrderSuccess();
			} else {
			  if (data.errors && Array.isArray(data.errors)) {
				const errorMessages = data.errors.map((error: { message: string }) => error.message).join('\n');
				toast.error(`\n${errorMessages}`, {
					autoClose: 5000,
					closeOnClick: false,
					pauseOnHover: true
				});
			  } else {
				toast.error(data.message || "Đặt hàng thất bại.");
			  }
			  router.push('/checkout-cancel');
			}
		  }
	  
		} catch (err) {
		  console.error("Lỗi khi xử lý đơn hàng:", err);
		  if (selectedPayment === "BANK_TRANSFER") {
			toast.error("Lỗi khi tạo link thanh toán. Vui lòng thử lại sau.");
		  } else {
			toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
		  }
		}
	  };	  
	
	  const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true); 
	
		try {

			const selectedIds = JSON.parse(localStorage.getItem("selectedItems") || "[]");
			const selectedCartItems = cart.filter(item => selectedIds.includes(item._id));
			if (selectedCartItems.length === 0) {
				toast.error("Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng.");
				setIsLoading(false);
				return;
			}
	

			if (!user) {
				const { name, phone, address } = form;
				if (!name.trim()) {
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
				if (name.trim().length < 2) {
					toast.error("Tên người nhận phải có ít nhất 2 ký tự!");
					return;
				}
				if (!/^[\p{L}\s]+$/u.test(name.trim())) {
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
				await submitOrder();
				return;
			}
	

			if (!selectedAddressId && !showNewAddressForm) {
				toast.error("Vui lòng chọn địa chỉ giao hàng hoặc thêm địa chỉ mới!");
				return;
			}
	
			if (selectedAddressId && showNewAddressForm) {
				toast.error("Vui lòng chỉ chọn 1 trong 2: địa chỉ cũ hoặc thêm địa chỉ mới!");
				return;
			}
	
			if (showNewAddressForm) {
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
					toast.error("Vui lòng chọn địa chỉ giao hàng!");
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
				if (address.trim().length < 6) {
					toast.error("Địa chỉ phải có ít nhất 6 ký tự!");
					return;
				}
				if (!/^[\p{L}\d\s,.-]+$/u.test(address.trim())) {
					toast.error("Địa chỉ chứa ký tự không hợp lệ!");
					return;
				}
	
				try {
					const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout/addresses`, {
						method: "POST",
						headers,
						body: JSON.stringify(newAddress),
					});
					const data = await res.json();
					if (data.success) {
						toast.success("Thêm địa chỉ mới thành công!");
						setAddresses(prev => [...prev, data.address]);
						setSelectedAddressId(data.address._id);
						setShowNewAddressForm(false);
		
						await submitOrder(data.address._id);
					} else {
						toast.error(data.message || "Lỗi khi thêm địa chỉ!");
					}
				} catch (err) {
					console.error("Lỗi thêm địa chỉ:", err);
					toast.error("Đã xảy ra lỗi. Vui lòng thử lại sau!");
				}
	
			} else {
				const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);
				if (!selectedAddress) {
					toast.error("Địa chỉ không hợp lệ.");
					return;
				}
				setForm(prev => ({
					...prev,
					address: selectedAddress.address,
					name: selectedAddress.receiver_name,
					phone: String(selectedAddress.phone),
				}));
				await submitOrder(selectedAddress._id);
			}
	
		} finally {
			setIsLoading(false); 
		}
	};
	
	

	return (
		<main className="max-w-7xl mx-auto py-6 sm:py-10 px-2 sm:px-6 pt-32 sm:pt-40">
			<div className="text-center mb-6 sm:mb-8">
				<h1 className="text-xl sm:text-2xl font-bold text-gray-800">Thanh toán đơn hàng</h1>
			</div>
				<form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-4 sm:gap-8">
					<div className="flex-1 bg-white rounded border border-gray-300 p-4 sm:p-6 space-y-4 sm:space-y-5">

						
					{user ? (
					""
					) : (
					<div className="mb-4 p-3 bg-red-50 border border-gray-200 rounded-lg">
						<div className="flex items-center gap-2 text-sm text-red-700">
							<i className="fas fa-info-circle text-red-500"></i>
							<span>Bạn đã có tài khoản?{" "}</span>
							<button 
								type="button"
								onClick={() => setShowAuthModal(true)}
								className="text-red-600 hover:underline font-semibold cursor-pointer"
							>
								Ấn vào đây để đăng nhập
							</button>
						</div>
					</div>
					)}


						<div className="flex items-center gap-3 mb-4">
							<div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
								<i className="fas fa-credit-card text-red-600 text-sm"></i>
							</div>
							<h2 className="font-semibold text-base sm:text-lg text-gray-800">Thông tin thanh toán</h2>
						</div>
						<div className="flex items-center gap-2 mb-2">
							<i className="fas fa-map-marker-alt text-red-500"></i>
							<label className="text-sm font-medium text-gray-700">Địa chỉ giao hàng <span className="text-red-500">*</span></label>
						</div>
					{!user ? (
													<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
							<div>
								<div className="flex items-center gap-2 mb-1">
									<i className="fas fa-user text-gray-500 text-xs"></i>
									<label className="text-sm font-medium text-gray-700">Tên *</label>
								</div>
								<input
								name="name"
								type="text"
								placeholder="Họ và tên"
								value={form.name}
								onChange={handleChange}
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-gray-500 transition-colors"
								required={false}
								/>
							</div>

							<div>
								<div className="flex items-center gap-2 mb-1">
									<i className="fas fa-phone text-gray-500 text-xs"></i>
									<label className="text-sm font-medium text-gray-700">Số điện thoại *</label>
								</div>
								<input
								name="phone"
								type="tel"
								placeholder="Số điện thoại"
								value={form.phone}
								onChange={(e) => {
									// Chỉ cho phép nhập số
									const value = e.target.value.replace(/[^0-9]/g, '');
									setForm(prev => ({ ...prev, phone: value }));
								}}
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-gray-500 transition-colors"
								required={false}
								/>
							</div>

							<div className="sm:col-span-2">
								<div className="flex items-center gap-2 mb-1">
									<i className="fas fa-home text-gray-500 text-xs"></i>
									<label className="text-sm font-medium text-gray-700">Địa chỉ *</label>
								</div>
								<AddressSelector
								value={form.address}
								onChange={(addr) => setForm(prev => ({ ...prev, address: addr }))}
								/>
							</div>

						

							</div>
						) : (
							<div className="mb-4 p-4 rounded-lg border border-gray-200">
	

							{!isChangingAddress ? (
								<>
									{(() => {
									const defaultAddr = addresses.find((addr) => addr._id === selectedAddressId);
									if (addresses.length === 0) {
									return <p>Chưa có địa chỉ nào</p>;
									}

									if (!defaultAddr) {
									return <p>Vui lòng chọn địa chỉ giao hàng</p>; 
									}
									return (
										<div className=" rounded-xl p-4  shadow-sm flex flex-col sm:flex-row sm:items-start sm:justify-between">
											<div className="flex items-start gap-3 mb-3 sm:mb-0">
												<div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full flex-shrink-0">
													<i className="fas fa-check text-green-600 text-sm"></i>
												</div>
												<div className="flex-1 min-w-0">
													<p className="font-semibold text-sm text-gray-800">{defaultAddr.receiver_name}</p>
													<p className="text-sm text-gray-700 flex items-center gap-1">
														<i className="fas fa-phone text-gray-500 text-xs"></i>
														{defaultAddr.phone}
													</p>
													<p className="text-sm text-gray-600 break-words flex items-start gap-1">
														<i className="fas fa-map-marker-alt text-gray-500 text-xs mt-1 flex-shrink-0"></i>
														{defaultAddr.address}
													</p>
												</div>
											</div>

											<button
												type="button"
												onClick={handleChangeAddressClick}
												disabled={isSubmittingAddress}
												className={`w-full sm:w-auto text-sm font-medium px-4 py-2 rounded-md transition flex items-center gap-2 ${
													isSubmittingAddress
													? "bg-gray-400 text-white cursor-not-allowed"
													: "bg-red-600 text-white hover:bg-red-700 hover:shadow-md"
												}`}
												>
												{isSubmittingAddress ? (
													<span className="flex items-center justify-center gap-2">
													<span>Đang tải</span>
													<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
													</span>
												) : (
													<>
														<i className="fas fa-edit text-xs"></i>
														Thay đổi
													</>
												)}
											</button>
										</div>

									);
									})()}
								</>
								) : (
								<>
									<div className="space-y-3">
									{addresses.map((addr) => (
										<label key={addr._id} className="block border border-gray-200 hover:border-gray-400 p-4 rounded-lg cursor-pointer transition-all">
											<div className="flex items-start gap-3">
												<input
													type="radio"
													name="shippingAddressChange"
													value={addr._id}
													checked={tempSelectedAddressId === addr._id}
													onChange={(e) => setTempSelectedAddressId(e.target.value)}
													className="mt-1 accent-red-600"
												/>
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														<i className="fas fa-user text-gray-500 text-xs"></i>
														<span className="text-sm font-medium text-gray-800">{addr.receiver_name}</span>
													</div>
													<div className="flex items-center gap-2 mb-1">
														<i className="fas fa-phone text-gray-500 text-xs"></i>
														<span className="text-sm text-gray-600">{addr.phone}</span>
													</div>
													<div className="flex items-start gap-2">
														<i className="fas fa-map-marker-alt text-gray-500 text-xs mt-1 flex-shrink-0"></i>
														<span className="text-sm text-gray-600">{addr.address}</span>
													</div>
												</div>
											</div>
										</label>
									))}
									</div>
									<div className="mt-3 flex gap-3">
									<button
										type="button"
										onClick={() => {
										setSelectedAddressId(tempSelectedAddressId);
										setIsChangingAddress(false);
										}}
										className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition-colors"
									>
										<i className="fas fa-check text-xs"></i>
										Xác nhận
									</button>
									<button
										type="button"
										onClick={() => {setIsChangingAddress(false);
											setTempSelectedAddressId(selectedAddressId); 
										}}
										className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2 bg-gray-100 rounded-lg p-2 hover:bg-gray-200 transition-all px-4"
									>
										<i className="fas fa-times text-xs"></i>
										Hủy
									</button>
									</div>
								</>
								)}


							<div className="mt-3">
								<button
									type="button"
									className="text-sm text-red-600 underline hover:text-red-700 flex items-center gap-2"
									onClick={() => {
										setShowNewAddressForm(!showNewAddressForm);
										if (!showNewAddressForm) {
										  setSelectedAddressId(""); 
										}
									  }}
								>
									<i className={`fas ${showNewAddressForm ? 'fa-minus' : 'fa-plus'} text-xs`}></i>
									{showNewAddressForm ? "Ẩn biểu mẫu thêm địa chỉ" : "Thêm địa chỉ "}
								</button>
							</div>


							{showNewAddressForm && (
								<div className="mt-4 p-4  rounded-lg">
									<div className="flex items-center gap-2 mb-4">
										<i className="fas fa-plus-circle text-red-600"></i>
										<h3 className="font-semibold text-gray-800">Thêm địa chỉ mới</h3>
									</div>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
									<div>
									  <div className="flex items-center gap-2 mb-2">
										<i className="fas fa-user text-gray-500 text-xs"></i>
										<label className="block text-gray-700 text-sm font-medium">Tên người nhận</label>
									  </div>
									  <input
										type="text"
										value={newAddress.receiver_name}
										onChange={(e) => setNewAddress({...newAddress, receiver_name: e.target.value})}
										className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-200 focus:border-gray-500 transition-colors"
										placeholder="Ví dụ: Nguyễn Văn A"
									  />
									</div>
									<div>
									  <div className="flex items-center gap-2 mb-2">
										<i className="fas fa-phone text-gray-500 text-xs"></i>
										<label className="block text-gray-700 text-sm font-medium">Số điện thoại</label>
									  </div>
									  <input
										type="tel"
										pattern="^0[35789][0-9]{8}$"
										title="Số điện thoại phải có 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09"
										required
										value={newAddress.phone}
										onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
										className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-200 focus:border-gray-500 transition-colors"
										placeholder="Ví dụ: 0123456789"
									  />
									</div>
									<div className="sm:col-span-2">
									  <div className="flex items-center gap-2 mb-2">
										<i className="fas fa-home text-gray-500 text-xs"></i>
										<label className="block text-gray-700 text-sm font-medium">Địa chỉ giao hàng</label>
									  </div>
									  <div className="relative">
										
										<AddressSelector
										  value={newAddress.address}
										  onChange={(addr) => setNewAddress({ ...newAddress, address: addr })}
										/>
										</div>

									</div>
								  </div>
								</div>
							)}
							</div>
						)}

						{!user && (
							<div className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
								<div className="flex items-center gap-2">
									<i className="fas fa-info-circle text-red-500"></i>
									<span>Địa chỉ giao hàng sẽ được sử dụng để gửi đơn hàng. Vui lòng điền đầy đủ thông tin.</span>
								</div>
							</div>
						)}
						<div className="space-y-3">
							<div className="flex items-center gap-2 mb-2">
								<i className="fas fa-ticket-alt text-red-500"></i>
								<h6 className="font-bold text-sm text-gray-800">Chọn voucher</h6>
							</div>

							{selectedVoucher ? (
								<div className="flex items-center gap-2 text-green-600 text-sm p-2 bg-green-50 rounded-lg border border-green-200">
									<i className="fas fa-check-circle text-green-500"></i>
									<span>Đã chọn: {selectedVoucher.voucher_name} ({selectedVoucher.voucher_code})</span>
								</div>
							) : (
								<div className="text-sm text-gray-500 p-2 bg-gray-50 rounded-lg border border-gray-200">
									<i className="fas fa-info-circle text-gray-400 mr-2"></i>
									Bạn chưa chọn voucher nào
								</div>
							)}

							<Dialog.Root>
								<Dialog.Trigger asChild>
								<button className="px-4 py-2 rounded-lg bg-black text-white font-medium text-sm hover:from-orange-600 hover:to-red-600 transition-all flex items-center gap-2 shadow-md">
									<i className="fas fa-ticket-alt"></i>
									Chọn voucher
								</button>
								</Dialog.Trigger>

								<Dialog.Portal>
								<Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
								<Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-[95%] max-w-2xl max-h-[90vh] p-4 sm:p-6 overflow-y-auto space-y-4">
									<Dialog.Title className="text-lg font-bold mb-2">Chọn voucher</Dialog.Title>
									
									{vouchers.length > 0 ? (
									vouchers.map((v) => (
										<div
										key={v._id}
										className="flex w-full h-[120px] bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden relative"
										>
										<div className="flex flex-col items-center justify-center bg-red-700 text-white px-3 py-2 w-[200px] rounded-l-lg relative">
											<i className="fa-solid fa-ticket text-lg mb-1"></i>
											<span className="font-bold text-xs text-center leading-tight line-clamp-2">
											{v.voucher_name}
											</span>
											<span className="bg-white text-[10px] font-semibold px-1 py-0.5 rounded text-[#333] mt-1">
											{v.voucher_code}
											</span>
											<span className="text-[9px] mt-1 text-center">
											HSD: {formatDate(v.end_date)}
											</span>
										</div>

										<div className="flex flex-col justify-center py-1 bg-transparent">
											{Array.from({ length: 6 }).map((_, i) => (
											<div
												key={i}
												className="w-1.5 h-1.5 rounded-full bg-gray-400 my-[2px]"
											></div>
											))}
										</div>

										<div className="flex-1 flex flex-col justify-between px-4 py-2 bg-white">
											<div className="space-y-1 overflow-hidden">
											<div className="text-red-500 font-bold text-base leading-tight truncate">
												{v.discount_type === "percentage"
												? `Giảm ${v.discount_value}%`
												: `Giảm ${formatCurrency(v.discount_value)}`}
												{v.max_discount && v.discount_type === "percentage" && (
												<span className="text-xs text-gray-500 ml-1 whitespace-nowrap">
													(Tối đa {formatCurrency(v.max_discount)})
												</span>
												)}
											</div>

											<div className="text-gray-700 font-semibold text-xs truncate">
												Đơn tối thiểu: {formatCurrency(v.minimum_order_value || 0)}
											</div>

											{new Date(v.end_date) > new Date() ? (
												<span className="bg-green-100 text-green-700 text-[10px] font-semibold px-1.5 py-0.5 rounded inline-block w-fit">
												Còn hiệu lực
												</span>
											) : (
												<span className="bg-gray-200 text-gray-500 text-[10px] font-semibold px-1.5 py-0.5 rounded inline-block w-fit">
												Hết hạn
												</span>
											)}
											</div>

											<div className="flex justify-end">
											<Dialog.Close asChild>
												<button
													onClick={() => setSelectedVoucher(v)}
													className={`px-3 py-2 rounded text-white font-bold text-xs shadow transition ${
														new Date(v.end_date) > new Date()
														? "bg-red-600 hover:bg-red-700"
														: "bg-gray-400 cursor-not-allowed"
													}`}
													disabled={new Date(v.end_date) <= new Date()}
													>
													{new Date(v.end_date) > new Date() ? "Sử Dụng" : "Hết hạn"}
												</button>
											</Dialog.Close>
											</div>
										</div>
										</div>
									))
									) : (
									<div className="flex flex-col items-center justify-center w-full py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
										<i className="fa-solid fa-ticket text-4xl text-gray-400 mb-3"></i>
										<p className="text-gray-500 font-semibold text-sm">Bạn chưa có voucher nào</p>
										<p className="text-gray-400 text-xs mt-1">Hãy quay lại sau hoặc săn voucher từ các chương trình khuyến mãi</p>
									</div>
									)}


									<div className="flex justify-end mt-4">
									<Dialog.Close asChild>
										<button className="text-sm px-4 py-2 border rounded hover:bg-gray-100">
										Đóng
										</button>
									</Dialog.Close>
									</div>
								</Dialog.Content>
								</Dialog.Portal>
							</Dialog.Root>
						</div>
						
						<div>
							<div className="flex items-center gap-2 mb-2">
								<i className="fas fa-sticky-note text-red-500"></i>
								<label className="text-sm font-medium text-gray-700">Ghi chú đơn hàng (tuỳ chọn)</label>
							</div>
							<textarea
								name="note"
								placeholder="Ghi chú về đơn hàng"
								value={form.note}
								onChange={handleChange}
								className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-colors"
								rows={3}
							/>
						</div>
						
					</div>
					<div className="lg:w-[420px] w-full bg-white rounded-lg border border-gray-300 p-4 sm:p-6 h-fit shadow-lg">
						<div className="flex items-center gap-3 mb-4">
							<div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
								<i className="fas fa-shopping-bag text-red-600 text-sm"></i>
							</div>
							<h2 className="font-semibold text-base sm:text-lg text-gray-800">Đơn hàng của bạn</h2>
						</div>
						

						<table className="w-full text-sm sm:text-base mb-4">
							<thead>
								<tr className="border-b border-gray-200">
									<th className="text-left py-3 font-semibold text-gray-700">
										<i className="fas fa-box text-gray-500 mr-2"></i>
										Sản phẩm
									</th>
									<th className="text-right py-3 font-semibold text-gray-700">
										<i className="fas fa-coins text-gray-500 mr-2"></i>
										Tổng
									</th>
								</tr>
							</thead>
							<tbody>
								{cart.map((item) => (
									<tr key={item.name} className="border-b border-gray-100">
									<td className="py-3">
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 bg-red-500 rounded-full"></div>
											<div>
												<div className="font-medium text-gray-800">{item.name}</div>
												<div className="text-xs text-gray-500">Số lượng: {item.so_luong}</div>
											</div>
										</div>
									</td>
									<td className="py-3 text-right font-medium text-gray-700">{((item.sale_price > 0 ? item.sale_price : item.price) * item.so_luong).toLocaleString()} ₫</td>
									</tr>
								))}

								<tr className="border-b border-gray-200">
									<td className="py-3 font-semibold text-gray-700">
										<i className="fas fa-calculator text-gray-500 mr-2"></i>
										Tổng phụ
									</td>
									<td className="py-3 text-right font-semibold text-gray-700">{total.toLocaleString()} ₫</td>
								</tr>

								{selectedVoucher && (
									<tr className="border-b border-gray-200">
									<td className="py-3 font-semibold text-green-700">
										<i className="fas fa-ticket-alt text-green-500 mr-2"></i>
										Mã giảm ({selectedVoucher.voucher_code})
									</td>
									<td className="py-3 text-right text-green-700 font-semibold">
										- {(originalTotal - finalTotal).toLocaleString()} ₫
									</td>
									</tr>
								)}

								<tr className="border-b border-gray-200">
									<td className="py-3 font-semibold text-gray-700">
										<i className="fas fa-shipping-fast text-gray-500 mr-2"></i>
										Giao hàng
									</td>
									<td className="py-3 text-right font-semibold text-green-600">
										<i className="fas fa-check text-green-500 mr-1"></i>
										Miễn phí
									</td>
								</tr>

								<tr className="">
									<td className="py-4 font-bold text-base sm:text-lg text-gray-800">
										<i className="fas fa-receipt text-red-500 mr-2"></i>
										Tổng
									</td>
									<td className="py-4 text-right text-red-600 font-bold text-base sm:text-lg">
									{finalTotal.toLocaleString()}₫
									</td>
								</tr>
								</tbody>
						</table>
						<div className="mb-3">
							<div className="flex items-center gap-2 mb-2">
								<i className="fas fa-credit-card text-indigo-500"></i>
								<div className="font-semibold text-gray-800">Phương thức thanh toán</div>
							</div>
							<div className="flex flex-col gap-2">
								{paymentMethods.map((method) => (
									<label key={method.code} className="flex items-center gap-2 cursor-pointer p-2 border border-gray-200 rounded-lg hover:border-gray-500 transition-all">
										<input
											type="radio"
											name="payment"
											className="accent-red-600"
											checked={selectedPayment === method.code}
											onChange={() => setSelectedPayment(method.code)}
										/>
										<div className="flex items-center gap-2 flex-1">
											<Image
												src={method.icon_url ? 
													(method.icon_url.startsWith('http') ? method.icon_url : `/images/payment-Method/${method.icon_url}`) 
													: "/images/payment-Method/placeholder.png"}
												alt={method.name}
												width={20}
												height={20}
												className="h-5 w-5 object-contain"
												onError={(e) => {
													const target = e.target as HTMLImageElement;
													target.src = "/images/payment-Method/placeholder.png";
												}}
											/>
											<span className="font-medium text-gray-700 text-sm">{method.name}</span>
										</div>
										{selectedPayment === method.code && (
											<i className="fas fa-check-circle text-red-500 text-sm"></i>
										)}
									</label>
								))}
							</div>


							{["MOMO_WALLET", "ZALOPAY_WALLET"].includes(selectedPayment) && (
								<div className="mt-4 p-4 bg-red-50 border border-gray-200 rounded-lg">
									<div className="flex items-center gap-2 mb-3">
										<i className="fas fa-qrcode text-red-600"></i>
										<span className="text-sm font-medium text-gray-700">Vui lòng quét mã QR bên dưới để thanh toán:</span>
									</div>
									<div className="flex justify-center">
										<div className="p-2 bg-white rounded-lg shadow-sm">
											<OptimizedImage 
												src="/placeholder-qr.png" 
												alt="QR code" 
												width={128}
												height={128}
												className="h-32 w-32" 
											/>
										</div>
									</div>
								</div>
							)}


						</div>
						<button
							type="submit"
							className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
									Đang xử lý...
								</>
							) : (
								<>
									<i className="fas fa-shopping-cart"></i>
									Đặt hàng
								</>
							)}
						</button>
					</div>
			</form>

			<AuthModal
				isOpen={showAuthModal}
				onClose={() => setShowAuthModal(false)}
				preventRedirect={true}
				onLoginSuccess={() => {
					const newToken = localStorage.getItem("token");
					setToken(newToken);
					fetchVouchers();
					fetchAddresses();
					toast.info("Bạn có thể tiếp tục thanh toán!");
				}}
			/>
		</main>
	);
}