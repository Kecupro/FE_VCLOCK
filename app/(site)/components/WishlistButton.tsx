"use client";
import { useState } from "react";
import { toast } from "react-toastify";

interface WishlistButtonProps {
    productId: string;
    initialIsWishlisted: boolean;
}

export default function WishlistButton({ productId, initialIsWishlisted }: WishlistButtonProps) {
    const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
    const [isLoading, setIsLoading] = useState(false);

    const handleWishlist = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Vui lòng đăng nhập để thêm vào yêu thích!");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/user/wishlist/${productId}`, {
                method: isWishlisted ? "DELETE" : "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                setIsWishlisted(!isWishlisted);
                toast.success(isWishlisted ? "Đã xóa khỏi danh sách yêu thích!" : "Đã thêm vào danh sách yêu thích!");
            } else {
                toast.error("Có lỗi xảy ra, vui lòng thử lại!");
            }
        } catch {
            toast.error("Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleWishlist();
            }}
            className={`text-2xl transition-colors duration-200 ${
                isWishlisted ? "text-red-500" : "text-gray-400 hover:text-red-500"
            }`}
            disabled={isLoading}
            title={isWishlisted ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
        >
            <i className={`fa-solid fa-heart ${isLoading ? "opacity-50" : ""}`}></i>
        </button>
    );
} 