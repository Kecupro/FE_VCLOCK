"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ICart, IAddress, IPaymentMethod, IVoucher } from "../cautrucdata";
import { useCart } from "../components/CartContext";
import AddressSelector from "../components/AddressSelector";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, selectedItems } = useCart();
  const [addresses, setAddresses] = useState<IAddress[]>([]);
	const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([]);
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | null>(null);
	const [showNewAddressForm, setShowNewAddressForm] = useState(false);
	const [newAddress, setNewAddress] = useState({
    receiver_name: "",
    phone: "",
    address: "",
  });
  const [form, setForm] = useState({
    note: "",
  });
  const [selectedAddressId, setSelectedAddressId] = useState(""); // chọn
  const [isLoading, setIsLoading] = useState(false);
  const userManuallyClearedAddress = useRef(false); // Track if user manually cleared address
  const [originalTotal, setOriginalTotal] = useState<number>(0); // Tổng tiền gốc

	// lấy địa chỉ mới nhất
  const getLatestAddress = useCallback(() => {
		if (addresses.length === 0) return null;
    return [...addresses].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];
  }, [addresses]);

	// tính tổng tiền giỏ hàng
  const subtotal = useCallback((cartItems: ICart[]) => {
		const sum = cartItems.reduce(
		  (acc, item) =>
			acc + (item.sale_price > 0 ? item.sale_price : item.price) * item.so_luong,
		  0
		);
    return sum;
  }, []);
	
  // Tính total khi cartItems thay đổi
  useEffect(() => {
    const newTotal = subtotal(cart);
    setOriginalTotal(newTotal);
  }, [cart, subtotal]);

  // Tính finalTotal với voucher
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
	  	
		// Trường hợp giảm trực tiếp theo số tiền
		return originalTotal - selectedVoucher.discount_value;
	}, [originalTotal, selectedVoucher]);
	  
  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await fetch("https://bevclock-production.up.railway.app/user/addresses", {
        headers,
      });
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  }, []);

	  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    // Only auto-select address if user hasn't manually cleared it and new address form is not shown
    if (addresses.length > 0 && !selectedAddressId && !showNewAddressForm && !userManuallyClearedAddress.current) {
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
  }, [addresses, showNewAddressForm, selectedAddressId, getLatestAddress]);

  // Fetch payment methods
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch("https://bevclock-production.up.railway.app/api/payment-methods");
        if (response.ok) {
          const data = await response.json();
          setPaymentMethods(data);
        }
      } catch (error) {
        console.error("Error fetching payment methods:", error);
      }
    };
    fetchPaymentMethods();
	  }, []);	  

  // Fetch vouchers
  useEffect(() => {
    const fetchVouchers = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("https://bevclock-production.up.railway.app/api/vouchers/available", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setVouchers(data);
        }
      } catch (error) {
        console.error("Error fetching vouchers:", error);
      }
    };
    fetchVouchers();
  }, []);

  // Lọc sản phẩm đã chọn
  const selectedCartItems = cart.filter((item) => selectedItems.includes(item._id));

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: value,
		}));
	};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId && !showNewAddressForm) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (selectedCartItems.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập để tiếp tục");
        return;
      }

      const selectedPaymentObj = paymentMethods.find(pm => pm._id === selectedPaymentMethod);
	  	
		const orderData = {
		  cart: selectedCartItems,
		  total_amount: finalTotal,
		  note: form.note || "",
		  voucher_id: selectedVoucher?._id || null,
		  discount_amount: selectedVoucher ? originalTotal - finalTotal : 0,
		  payment_method_id: selectedPaymentObj?._id,
		  ...(showNewAddressForm
			? { new_address: newAddress }
          : { address_id: selectedAddressId }),
      };

      const orderCode = `DH${Date.now()}`;

      const response = await fetch("https://bevclock-production.up.railway.app/api/orders", {
			  method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
			  body: JSON.stringify({
				orderData,
				orderCode,
				amount: finalTotal,
				description: `Thanh toán DH ${orderCode}`,
			  }),
			});
	  
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success("Đặt hàng thành công!");
          router.push("/account");
			} else {
          toast.error(data.message || "Có lỗi xảy ra khi đặt hàng");
			}
		  } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Có lỗi xảy ra khi đặt hàng");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast.error("Có lỗi xảy ra khi đặt hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("vi-VN") + " ₫";
  };

	return (
    <div className="min-h-screen bg-gray-50 pt-40 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Thông tin đơn hàng
              </h2>
              <div className="space-y-4">
                {selectedCartItems.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0 w-16 h-16">
                      <Image
                        src={`/images/product/${item.main_image?.image}`}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded"
								/>
							</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Số lượng: {item.so_luong}
                      </p>
							</div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(
                          (item.sale_price > 0 ? item.sale_price : item.price) * item.so_luong
                        )}
                      </p>
                      {item.sale_price > 0 && (
                        <p className="text-xs text-gray-500 line-through">
                          {formatCurrency(item.price * item.so_luong)}
                        </p>
                      )}
							</div>
							</div>
                ))}
												</div>
											</div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Địa chỉ giao hàng
                </h2>
									<button
										type="button"
									onClick={() => {
										setShowNewAddressForm(!showNewAddressForm);
										if (!showNewAddressForm) {
										  setSelectedAddressId(""); // Hủy chọn địa chỉ cũ khi nhập mới
                      userManuallyClearedAddress.current = true; // Mark that user manually cleared address
                    } else {
                      userManuallyClearedAddress.current = false; // Reset when hiding form
										}
									  }}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
								>
                  {showNewAddressForm ? "Hủy" : "Thêm địa chỉ giao hàng mới"}
								</button>
							</div>

              {showNewAddressForm ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên người nhận
                      </label>
								  <input
									type="text"
									value={newAddress.receiver_name}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, receiver_name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
								  />
								</div>
								<div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại
                      </label>
								  <input
									type="tel"
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
									required
								  />
								</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ
                    </label>
									<AddressSelector
									  value={newAddress.address}
                      onChange={(address) =>
                        setNewAddress({ ...newAddress, address })
                      }
									/>
									</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.length > 0 ? (
                    addresses.map((address) => (
                      <div
                        key={address._id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedAddressId === address._id
                            ? "border-red-500 bg-red-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => {
                          setSelectedAddressId(address._id);
                          userManuallyClearedAddress.current = false; // Reset since user has selected an address
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {address.receiver_name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {address.phone}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {address.address}
                            </p>
								</div>
                          {selectedAddressId === address._id && (
                            <div className="text-red-500">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
							  </div>
							)}
							</div>
							</div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới.
                    </p>
												)}
											</div>
											)}
											</div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method._id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === method._id
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method._id}
                      checked={selectedPaymentMethod === method._id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                        {selectedPaymentMethod === method._id && (
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        )}
											</div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {method.name}
                        </h3>
                        <p className="text-sm text-gray-600">{method.description}</p>
										</div>
										</div>
                  </label>
                ))}
									</div>
						</div>
												
            {/* Order Note */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Ghi chú đơn hàng
              </h2>
							<textarea
								name="note"
								value={form.note}
								onChange={handleChange}
								rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
							/>
						</div>
					</div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Tóm tắt đơn hàng
              </h2>

              {/* Voucher Section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Mã giảm giá
                </h3>
                <div className="space-y-2">
                  {vouchers.map((voucher) => (
                    <label
                      key={voucher._id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedVoucher?._id === voucher._id
                          ? "border-red-500 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
										<input
											type="radio"
                        name="voucher"
                        checked={selectedVoucher?._id === voucher._id}
                        onChange={() => setSelectedVoucher(voucher)}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 border-2 border-gray-300 rounded flex items-center justify-center">
                          {selectedVoucher?._id === voucher._id && (
                            <div className="w-2 h-2 bg-red-500 rounded"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {voucher.voucher_code}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {voucher.discount_type === "percentage"
                              ? `Giảm ${voucher.discount_value}%`
                              : `Giảm ${formatCurrency(voucher.discount_value)}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            Đơn tối thiểu: {formatCurrency(voucher.minimum_order_value || 0)}
                          </p>
                        </div>
                      </div>
									</label>
								))}
                  {vouchers.length === 0 && (
                    <p className="text-gray-500 text-sm">
                      Không có mã giảm giá khả dụng
                    </p>
                  )}
                </div>
							</div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(originalTotal)}</span>
                  </div>
                  {selectedVoucher && (
                    <>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Giảm giá</span>
                        <span className="text-green-600">
                          - {formatCurrency(originalTotal - finalTotal)}
                        </span>
									</div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Phí vận chuyển</span>
                        <span>Miễn phí</span>
								</div>
                    </>
                  )}
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Tổng cộng</span>
                      <span>{formatCurrency(finalTotal)}</span>
                    </div>
								</div>
							</div>
						</div>

              {/* Place Order Button */}
						<button
                onClick={handleSubmit}
                disabled={isLoading || selectedCartItems.length === 0}
                className="w-full mt-6 bg-red-600 text-white py-3 px-4 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? "Đang xử lý..." : "Đặt hàng"}
						</button>

              <div className="mt-4 text-center">
                <Link
                  href="/cart"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← Quay lại giỏ hàng
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
					</div>
	);
}