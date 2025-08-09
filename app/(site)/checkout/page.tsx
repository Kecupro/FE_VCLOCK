"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ICart, IAddress, IPaymentMethod, IVoucher } from "../cautrucdata";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import * as Dialog from "@radix-ui/react-dialog"; 
import AddressSelector from "../components/AddressSelector";
import { useRouter } from "next/navigation";
import OptimizedImage from "../components/OptimizedImage";

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
		
	  useEffect(() => {
		const fetchVouchers = async () => {
		  try {
			const token = localStorage.getItem("token");
			if (!token) {
				setVouchers([]);
				return;
			}
	
			const res = await fetch(`http://localhost:3000/voucher-user`, {
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
		};
		fetchVouchers();
		}, []);	  


	  const fetchAddresses = useCallback(async () => {
		const token = localStorage.getItem("token");
		if (!token) return;
	
		try {
			const response = await fetch(`http://localhost:3000/user/addresses`, {
				headers,
			});
			if (response.ok) {
				const data = await response.json();
	
				// Đảo ngược thứ tự mảng
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
		if (addresses.length > 0 && !selectedAddressId && !showNewAddressForm) {
			// Ưu tiên địa chỉ mặc định
			const defaultAddr = addresses.find(addr => addr.is_default);
			if (defaultAddr) {
				setSelectedAddressId(defaultAddr._id);
			} else {
				// Nếu không có mặc định, lấy địa chỉ mới nhất
				const latest = getLatestAddress();
				if (latest) setSelectedAddressId(latest._id);
			}
		}
	}, [addresses, selectedAddressId, showNewAddressForm, getLatestAddress]);
	  
	  const handleChangeAddressClick = () => {
		setIsSubmittingAddress(true); // Bắt đầu loading
	  
		setTimeout(() => {
		  setIsChangingAddress(true);
		  setTempSelectedAddressId(selectedAddressId);
		  setIsSubmittingAddress(false); // Kết thúc loading
		}, 800); // Giả lập loading trong 0.8 giây
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
		const storedCart = localStorage.getItem("cart");
		const storedSelected = localStorage.getItem("selectedItems");
	  	
		if (storedCart) {
		  const parsedCart = JSON.parse(storedCart);
		  const selectedIds: string[] = storedSelected ? JSON.parse(storedSelected) : [];
	  	
		  // Nếu có selectedIds thì chỉ lấy những sản phẩm được chọn
		  const filteredCart =
			selectedIds.length > 0
			  ? parsedCart.filter((item: ICart) => selectedIds.includes(item._id))
			  : parsedCart;
	  	
		  setCart(filteredCart);
		  subtotal(filteredCart);
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
				const response = await fetch(`http://localhost:3000/api/payment-method`);
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


    const selectedIds = JSON.parse(localStorage.getItem("selectedItems") || "[]");
    const fullCart = JSON.parse(localStorage.getItem("cart") || "[]");


    const updatedCart = fullCart.filter((item: ICart) => !selectedIds.includes(item._id));

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    localStorage.removeItem("selectedItems");
    setCart(updatedCart);

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
		const selectedIds = JSON.parse(localStorage.getItem("selectedItems") || "[]");
		const selectedCartItems = cart.filter(item => selectedIds.includes(item._id));
		const selectedPaymentObj = paymentMethods.find(p => p.code === selectedPayment);

		const orderCode = Math.floor(100000 + Math.random() * 900000);
		const orderData = {
		  cart: selectedCartItems,
		  total_amount: finalTotal,
		  note: form.note || "",
		  voucher_id: selectedVoucher?._id || null,
		  discount_amount: selectedVoucher ? originalTotal - finalTotal : 0,
		  payment_method_id: selectedPaymentObj?._id,
		  ...(addressId || selectedAddressId 
			? { address_id: addressId || selectedAddressId }
			: { new_address: form }), // Cho khách hàng chưa đăng nhập
		};
	  
		try {
		  
		  if (!selectedPaymentObj) {
			toast.error("Phương thức thanh toán không hợp lệ.");
			return;
		  }
		  
		  if (selectedPayment === "BANK_TRANSFER") {
			const response = await fetch(`http://localhost:3000/create-payment-link`, {
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
			} else {
			  toast.error("Không thể lấy link thanh toán. Vui lòng thử lại.");
			}
	  
		  } else {
			const res = await fetch(`http://localhost:3000/api/checkout`, {
			  method: "POST",
			  headers,
			  body: JSON.stringify({orderCode, orderData}),  
			});
			const data = await res.json();
	  
			if (data?.order_id) {
			  handlePostOrderSuccess();
			} else {
			  toast.error(data.message || "Đặt hàng thất bại.");
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
		setIsLoading(true); // Bắt đầu loading
	
		try {

			const selectedIds = JSON.parse(localStorage.getItem("selectedItems") || "[]");
			const selectedCartItems = cart.filter(item => selectedIds.includes(item._id));
			if (selectedCartItems.length === 0) {
				toast.error("Vui lòng chọn ít nhất 1 sản phẩm để đặt hàng.");
				setIsLoading(false);
				return;
			}
	

			if (!user) {
				const { name, address, phone } = form;
				if (!name || !address || !phone) {
					toast.error("Vui lòng điền đầy đủ thông tin người nhận.");
					return;
				}
				if (name.length < 2 || !/^[\p{L}\d\s,.'-]+$/u.test(name)) return toast.error("Tên người nhận không hợp lệ.");
				if (!/^\d{10,11}$/.test(phone)) return toast.error("Số điện thoại không hợp lệ.");
				if (address.length < 5 || !/^[\p{L}\d\s,.-]+$/u.test(address)) return toast.error("Địa chỉ không hợp lệ.");
	
				await submitOrder();
				return;
			}
	

			if (!selectedAddressId && !showNewAddressForm) {
				toast.error("Vui lòng chọn hoặc thêm địa chỉ.");
				return;
			}
	
			if (selectedAddressId && showNewAddressForm) {
				toast.error("Vui lòng chỉ chọn 1 trong 2: địa chỉ cũ hoặc nhập mới.");
				return;
			}
	
			if (showNewAddressForm) {
				const { receiver_name, phone, address } = newAddress;
				if (!receiver_name || !phone || !address) {
					toast.error("Vui lòng điền đầy đủ địa chỉ mới.");
					return;
				}
				if (receiver_name.length < 2 || !/^[\p{L}\d\s,.'-]+$/u.test(receiver_name)) return toast.error("Tên người nhận không hợp lệ.");
				if (!/^\d{10,11}$/.test(phone)) return toast.error("Số điện thoại không hợp lệ.");
				if (address.length < 5 || !/^[\p{L}\d\s,.-]+$/u.test(address)) return toast.error("Địa chỉ không hợp lệ.");
	
				try {
					const res = await fetch(`http://localhost:3000/checkout/addresses`, {
						method: "POST",
						headers,
						body: JSON.stringify(newAddress),
					});
					const data = await res.json();
					if (data.success) {
						toast.success("Đã thêm địa chỉ mới.");
						setAddresses(prev => [...prev, data.address]);
						setSelectedAddressId(data.address._id);
						setShowNewAddressForm(false);
		
						await submitOrder(data.address._id);
					} else {
						toast.error(data.message || "Lỗi khi thêm địa chỉ.");
					}
				} catch (err) {
					console.error("Lỗi thêm địa chỉ:", err);
					toast.error("Vui lòng thử lại sau.");
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
		<main className="max-w-7xl mx-auto py-10 px-2 sm:px-6 pt-40">
			<h1 className="text-2xl font-bold mb-8 text-center">Thanh toán đơn hàng</h1>
				<form onSubmit={handleSubmit}  className="flex flex-col md:flex-row gap-8">
					<div className="flex-1 bg-white rounded border border-gray-300 p-6 space-y-5">

						
					{user ? (
					""
					) : (
					<div className="mb-2 text-sm text-gray-600">
						Bạn đã có tài khoản?{" "}
						<Link href="/login" className="text-red-600 hover:underline font-semibold">
						Ấn vào đây để đăng nhập
						</Link>
					</div>
					)}


						<h2 className="font-semibold text-lg mb-2">Thông tin thanh toán</h2>
						<label className="block text-sm mb-1 font-medium">Địa chỉ giao hàng *</label>
					{!user ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm mb-1 font-medium">Tên *</label>
								<input
								name="name"
								type="text"
								placeholder="Họ và tên"
								value={form.name}
								onChange={handleChange}
								className="w-full p-3 border border-gray-300 rounded"
								/>
							</div>

							<div>
								<label className="block text-sm mb-1 font-medium">Số điện thoại *</label>
								<input
								name="phone"
								type="tel"
								placeholder="Số điện thoại"
								value={form.phone}
								onChange={handleChange}
								className="w-full p-3 border border-gray-300 rounded"
								/>
							</div>

							<div className="md:col-span-2">
								<label className="block text-sm mb-1 font-medium">Địa chỉ *</label>
								<AddressSelector
								value={form.address}
								onChange={(addr) => setForm(prev => ({ ...prev, address: addr }))}
								/>
							</div>

							<div className="md:col-span-2">
								<label className="block text-sm mb-1 font-medium">Ghi chú đơn hàng (tuỳ chọn)</label>
								<textarea
									name="note"
									placeholder="Ghi chú về đơn hàng"
									value={form.note}
									onChange={handleChange}
									className="w-full p-3 border border-gray-300 rounded"
									rows={3}
								/>
							</div>

							</div>
						) : (
							<div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
						<p className="text-sm text-gray-700 mb-2">
							Chào <span className="font-semibold text-red-600">{user.fullName}</span> 👋,
							vui lòng chọn địa chỉ giao hàng bên dưới hoặc thêm mới nếu cần:
						</p>

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
										<div className="border rounded-xl p-4 bg-white shadow-sm flex items-start justify-between">
											<div className="flex items-center gap-3">
												<div className="bg-red-100 text-red-600 rounded-full p-2">
												<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
													viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
													d="M16 7a4 4 0 00-8 0v1a4 4 0 008 0V7zM4 21h16M4 17h16" />
												</svg>
												</div>
												<div>
												<p className="font-semibold text-sm">{defaultAddr.receiver_name}</p>
												<p className="text-sm text-gray-700">{defaultAddr.phone}</p>
												<p className="text-sm text-gray-600">{defaultAddr.address}</p>
												</div>
											</div>

											<button
												type="button"
												onClick={handleChangeAddressClick}
												disabled={isSubmittingAddress}
												className={`text-sm font-medium px-4 py-2 rounded-md transition ${
													isSubmittingAddress
													? "bg-gray-400 text-white cursor-not-allowed"
													: "bg-black text-white hover:bg-white hover:text-black hover:border hover:border-black"
												}`}
												>
												{isSubmittingAddress ? (
													<span className="flex items-center gap-2">
													<span>Đang tải</span>
													<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
													</span>
												) : (
													"Thay đổi"
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
										<label key={addr._id} className="block border p-3 rounded hover:border-red-500 cursor-pointer">
										<input
											type="radio"
											name="shippingAddressChange"
											value={addr._id}
											checked={tempSelectedAddressId === addr._id}
											onChange={(e) => setTempSelectedAddressId(e.target.value)}
											className="mr-2 accent-red-600"
										/>
										<span className="text-sm">{addr.receiver_name}</span>,{" "}
										<span className="text-sm text-gray-600">{addr.phone}</span>,{" "}
										<span className="text-sm">{addr.address}</span>
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
										className="text-sm bg-red-600 text-white px-4 py-2 rounded"
									>
										Xác nhận
									</button>
									<button
										type="button"
										onClick={() => {setIsChangingAddress(false);
											setTempSelectedAddressId(selectedAddressId); 
										}}
										className="text-sm text-gray-600 underline"
									>
										Hủy
									</button>
									</div>
								</>
								)}


							<div className="mt-3">
								<button
									type="button"
									className="text-sm text-red-600 underline hover:text-red-700"
									onClick={() => {
										setShowNewAddressForm(!showNewAddressForm);
										if (!showNewAddressForm) {
										  setSelectedAddressId(""); 
										}
									  }}
								>
									{showNewAddressForm ? "Ẩn biểu mẫu nhập mới" : "Thêm địa chỉ giao hàng mới"}
								</button>
							</div>


							{showNewAddressForm && (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
								  <label className="block text-gray-700 text-sm font-medium mb-2">Tên người nhận</label>
								  <input
									type="text"
									value={newAddress.receiver_name}
									onChange={(e) => setNewAddress({...newAddress, receiver_name: e.target.value})}
									className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-200 focus:border-red-500"
									placeholder="Ví dụ: Nguyễn Văn A"
								  />
								</div>
								<div>
								  <label className="block text-gray-700 text-sm font-medium mb-2">Số điện thoại</label>
								  <input
									type="tel"
									pattern="^0[35789][0-9]{8}$"
									title="Số điện thoại phải có 10 chữ số và bắt đầu bằng 03, 05, 07, 08 hoặc 09"
									required
									value={newAddress.phone}
									onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
									className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-200 focus:border-red-500"
									placeholder="Ví dụ: 0123456789"
								  />
								</div>
								<div className="md:col-span-2">
								  <label className="block text-gray-700 text-sm font-medium mb-2">Địa chỉ giao hàng</label>
								  <div className="relative">
									
									<AddressSelector
									  value={newAddress.address}
									  onChange={(addr) => setNewAddress({ ...newAddress, address: addr })}
									/>
									</div>

								</div>
							  </div>
							)}
							</div>
						)}

						{!user && (
							<div className="text-sm text-gray-600 mb-4">
								Địa chỉ giao hàng sẽ được sử dụng để gửi đơn hàng. Vui lòng điền đầy đủ thông tin.
							</div>
						)}
						<div className="space-y-3">
							<h2 className="font-semibold text-sm mb-1">Chọn voucher</h2>

							{selectedVoucher ? (
								<div className="flex items-center gap-2 text-green-600 text-sm">
								✅ Đã chọn: {selectedVoucher.voucher_name} ({selectedVoucher.voucher_code})
								</div>
							) : (
								<div className="text-sm text-gray-500">❗Bạn chưa chọn voucher nào</div>
							)}

							<Dialog.Root>
								<Dialog.Trigger asChild>
								<button className="px-4 py-2 rounded bg-black text-white font-semibold">
									Chọn voucher
								</button>
								</Dialog.Trigger>

								<Dialog.Portal>
								<Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
								<Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] p-6 overflow-y-auto space-y-4">
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
							<label className="block text-sm mb-1 font-medium">Ghi chú đơn hàng (tuỳ chọn)</label>
							<textarea
								name="note"
								placeholder="Ghi chú về đơn hàng"
								value={form.note}
								onChange={handleChange}
								className="w-full p-3 border border-gray-300 rounded"
								rows={3}
							/>
						</div>
						
					</div>
					<div className="md:w-[420px] w-full bg-white rounded border border-gray-300 p-6 h-fit">
						<h2 className="font-semibold text-lg mb-4">Đơn hàng của bạn</h2>
						<table className="w-full text-base mb-4">
							<thead>
								<tr>
									<th className="text-left py-2">Sản phẩm</th>
									<th className="text-right py-2">Tổng</th>
								</tr>
							</thead>
							<tbody>
								{cart.map((item) => (
									<tr key={item.name}>
									<td className="py-2">{item.name} × {item.so_luong}</td>
									<td className="py-2 text-right">{((item.sale_price > 0 ? item.sale_price : item.price) * item.so_luong).toLocaleString()} ₫</td>
									</tr>
								))}

								<tr>
									<td className="py-2 font-semibold">Tổng phụ</td>
									<td className="py-2 text-right">{total.toLocaleString()} ₫</td>
								</tr>

								{selectedVoucher && (
									<tr>
									<td className="py-2 font-semibold text-green-700">
										Mã giảm ({selectedVoucher.voucher_code})
									</td>
									<td className="py-2 text-right text-green-700">
										- {(originalTotal - finalTotal).toLocaleString()} ₫

									</td>
									</tr>
								)}

								<tr>
									<td className="py-2 font-semibold">Giao hàng</td>
									<td className="py-2 text-right">Miễn phí</td>
								</tr>

								<tr>
									<td className="py-2 font-bold text-lg">Tổng</td>
									<td className="py-2 text-right text-red-600 font-bold text-lg">
									{finalTotal.toLocaleString()} ₫
									</td>
								</tr>
								</tbody>
						</table>
						<div className="mb-3">
							<div className="font-semibold mb-1">Phương thức thanh toán</div>
							<div className="flex flex-col gap-2">
								{paymentMethods.map((method) => (
									<label key={method.code} className="flex items-center gap-2 cursor-pointer">
										<input
											type="radio"
											name="payment"
											className="accent-red-600"
											checked={selectedPayment === method.code}
											onChange={() => setSelectedPayment(method.code)}
										/>
										<Image
											src={method.icon_url ? 
												(method.icon_url.startsWith('http') ? method.icon_url : `/images/payment-Method/${method.icon_url}`) 
												: "/images/payment-Method/placeholder.png"}
											alt={method.name}
											width={24}
											height={24}
											className="h-6 w-6 object-contain"
											onError={(e) => {
												// Fallback khi ảnh lỗi
												const target = e.target as HTMLImageElement;
												target.src = "/images/payment-Method/placeholder.png";
											}}
										/>
										{method.name}
									</label>
								))}
							</div>


							{["MOMO_WALLET", "ZALOPAY_WALLET"].includes(selectedPayment) && (
								<div className="mt-3 text-sm text-gray-700">
									Vui lòng quét mã QR bên dưới để thanh toán:
									<div className="mt-2">
										<OptimizedImage 
											src="/placeholder-qr.png" 
											alt="QR code" 
											width={128}
											height={128}
											className="h-32 w-32" 
										/>
									</div>
								</div>
							)}


						</div>
						<button
							type="submit"
							className="w-full bg-red-600 text-white py-3 rounded font-semibold text-lg hover:bg-red-700 transition"
							disabled={isLoading}
						>
							{isLoading ? "Đang xử lý..." : "Đặt hàng"}
						</button>
					</div>
			</form>
		</main>
	);
}