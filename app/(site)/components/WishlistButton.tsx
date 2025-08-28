import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useWishlist } from "./WishlistContext";
import { useAuth } from "../context/AuthContext";

interface WishlistButtonProps {
    productId: string;
    initialIsWishlisted: boolean;
    variant?: "default" | "large";
}

export default function WishlistButton({ productId, initialIsWishlisted, variant = "default" }: WishlistButtonProps) {
    const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
    const [isLoading, setIsLoading] = useState(false);
    const { addToWishlist, removeFromWishlist, getWishlistStatus } = useWishlist();
    const { openAuthModal } = useAuth();

    useEffect(() => {
        setIsWishlisted(initialIsWishlisted);
    }, [initialIsWishlisted]);

    useEffect(() => {
        const refreshStatus = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                const statusMap = await getWishlistStatus();
                setIsWishlisted(statusMap[productId] || false);
            } else {
                setIsWishlisted(false);
            }
        };
        refreshStatus();
    }, [productId, getWishlistStatus]);

    const handleWishlist = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            openAuthModal();
            return;
        }

        setIsLoading(true);
        try {
            let success = false;
            if (isWishlisted) {
                success = await removeFromWishlist(productId);
            } else {
                success = await addToWishlist(productId);
            }

            if (success) {
                const statusMap = await getWishlistStatus();
                setIsWishlisted(statusMap[productId] || false);
                toast.success(isWishlisted ? "Đã hủy yêu thích!" : "Đã thêm vào danh sách yêu thích!");
            } else {
                toast.error("Có lỗi xảy ra, vui lòng thử lại!");
            }
        } catch {
            toast.error("Có lỗi xảy ra, vui lòng thử lại!");
        } finally {
            setIsLoading(false);
        }
    };

    const baseClasses = "transition-colors duration-200";
    const sizeClasses = variant === "large" 
        ? "text-xl p-3 h-12 rounded-sm bg-gray-100 hover:bg-red-50 flex items-center justify-center mt-1" 
        : "text-xl";
    const colorClasses = isWishlisted 
        ? "text-red-500" 
        : "text-gray-400 hover:text-red-500";

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleWishlist();
            }}
            className={`${baseClasses} ${sizeClasses} ${colorClasses} ${
                variant === "large" && isWishlisted ? "bg-red-50" : ""
            }`}
            disabled={isLoading}
            title={isWishlisted ? "Hủy yêu thích" : "Thêm vào danh sách yêu thích"}
        >
            <i className={`fa-solid fa-heart ${isLoading ? "opacity-50" : ""}`}></i>
        </button>
    );
} 