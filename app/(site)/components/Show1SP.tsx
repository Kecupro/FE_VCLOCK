"use client";
import Link from "next/link";
import { IProduct, IBrand } from "../cautrucdata";
import AddToCart from "./AddToCart";
import BuyNow from "./BuyNow";
import WishlistButton from "./WishlistButton";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";

interface WishlistItem {
    _id: string;
    product_id: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export default function Show1SP(props: { sp: IProduct }) {
    const sp = props.sp;

    const [brands, setBrands] = useState<IBrand[]>([]);
    const [wishlistStatus, setWishlistStatus] = useState<{[key: string]: boolean}>({});
    const { user } = useAuth();
    
    // Fetch danh sách thương hiệu
    useEffect(() => {
        fetch("http://localhost:3000/api/brand")
            .then((res) => res.json())
            .then((data) => setBrands(data))
            .catch((err) => console.error("Lỗi fetch brand:", err));
    }, []);

    // Fetch wishlist status for all products
        useEffect(() => {
            const fetchWishlist = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const res = await fetch("http://localhost:3000/user/wishlist", {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (res.ok) {
                        const data: WishlistItem[] = await res.json();
                        const statusMap: {[key: string]: boolean} = {};
                        if (Array.isArray(data)) {
                            data.forEach((item) => {
                                statusMap[item.product_id] = true;
                            });
                        }
                        setWishlistStatus(statusMap);
                    } else {
                        setWishlistStatus({});
                    }
                } catch (err) {
                    console.error("Lỗi fetch wishlist:", err);
                    setWishlistStatus({});
                }
            } else {
                setWishlistStatus({});
            }
        };
    
            fetchWishlist();
        }, [user]); // Re-fetch when user state changes

    const brandMap = useMemo(
        () => Object.fromEntries(brands.map(b => [b._id, b.name])),
        [brands]
    );

    return (
        <div className="relative flex flex-col bg-white rounded shadow hover:shadow-lg transition p-4 group h-full">
                                <Link href={`/product/${sp._id}`} className="flex-shrink-0 flex items-center justify-center h-48 mb-3 overflow-hidden">
                                    <img
                                        src={`/images/product/${sp.main_image}`}
                                        alt={sp.name}
                                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition duration-300"
                                    />
                                </Link>

                                <div className="flex flex-col flex-grow min-h-[60px]">
                                    <div className="flex justify-between items-start mb-1">
                                        <h6 className="font-semibold text-base text-gray-800 flex-grow mr-2 line-clamp-2 overflow-hidden">
                                            {sp.name}
                                        </h6>
                                    </div>
                                    <p className="text-[12px] text-gray-600 mb-2 truncate">
                                        {brandMap[sp.brand.name] ?? "Không rõ thương hiệu"}
                                    </p>
                                </div>

                                <div className="mt-auto flex flex-col">
                                    {sp.sale_price > 0 && (
                                        <>
                                            <span className="text-[14px] font-bold text-gray-500 absolute top-2 left-2 bg-red-600 text-white px-1 py-2 rounded-sm z-10">
                                                {Math.round(((sp.price - sp.sale_price) / sp.price) * 100)}%
                                            </span>
                                            <div className="flex flex-wrap items-center gap-1">
                                                <span className="text-gray-600 font-normal line-through text-sm">
                                                    {sp.price.toLocaleString("vi-VN")}đ
                                                </span>
                                                <span className="text-red-600 font-bold text-[16px]">
                                                    {sp.sale_price.toLocaleString("vi-VN")}đ
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    {sp.sale_price === 0 && (
                                        <div>
                                            <span className="text-gray-900 font-bold text-[16px]">
                                                {sp.price.toLocaleString("vi-VN")}đ
                                            </span>
                                        </div>
                                    )}
                                    <div className="mt-2 flex gap-2">
                                        <AddToCart sp={sp} />
                                        <BuyNow sp={sp} />
                                    </div>
                                </div>

                                <div className="absolute top-2 right-2 z-10">
                                    <WishlistButton 
                                        productId={sp._id} 
                                        initialIsWishlisted={wishlistStatus[sp._id] || false}
                                    />
                                </div>
                            </div>
    );
}