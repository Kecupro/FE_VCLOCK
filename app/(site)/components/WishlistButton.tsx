import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useWishlist } from "./WishlistContext";

interface WishlistButtonProps {
    productId: string;
    initialIsWishlisted: boolean;
    variant?: "default" | "large";
}

export default function WishlistButton({ productId, initialIsWishlisted, variant = "default" }: WishlistButtonProps) {
    const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);
    const [isLoading, setIsLoading] = useState(false);
    const { addToWishlist, removeFromWishlist, getWishlistStatus } = useWishlist();

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
            toast.error("Vui lòng đăng nhập để thêm vào yêu thích!");
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

    const baseClasses = "transition-colors duration-200";
    const sizeClasses = variant === "large" 
        ? "text-2xl p-3 rounded-lg border-2 hover:bg-red-50" 
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
                variant === "large" && isWishlisted ? "border-red-500 bg-red-50" : ""
            }`}
            disabled={isLoading}
            title={isWishlisted ? "Xóa khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
        >
            <i className={`fa-solid fa-heart ${isLoading ? "opacity-50" : ""}`}></i>
        </button>
    );
} 