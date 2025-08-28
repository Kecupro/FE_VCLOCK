
import { useEffect, useState, useCallback } from "react";
import { IReview } from "../cautrucdata";
import StarRating from "../components/StarRating";
import { getAvatarSrc } from "../../utils/avatarUtils";
import OptimizedImage from "../components/OptimizedImage";

export default function HienBinhLuanSP({
  productId,
  onRefetchReady,
}: {
  productId: string;
  onRefetchReady?: (fn: () => void) => void;
}) {
  const [bl_arr, setBlArr] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${productId}`);
      const data = await res.json();
      setBlArr(data.reviews || []);
    } catch (err) {
      console.error("Lỗi khi tải đánh giá:", err);
      setBlArr([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
    if (onRefetchReady) onRefetchReady(fetchReviews); 
  }, [productId, fetchReviews, onRefetchReady]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 sm:py-12">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-red-600"></div>
        <span className="ml-3 text-sm sm:text-base text-gray-600">Đang tải bình luận...</span>
      </div>
    );
  }

  if (!bl_arr || bl_arr.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-base text-gray-900 mb-2">Chưa có đánh giá nào</h3>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6" id="data">
      <div className="border-b border-gray-200 pb-3 sm:pb-4 mb-4 sm:mb-6">
        <h3 className="text-sm font-bold  text-gray-900">
          Đánh giá từ khách hàng ({bl_arr.length})
        </h3>
        <p className="text-sm  text-gray-600 mt-1">Những gì khách hàng nói về sản phẩm này</p>
      </div>
      
      {bl_arr.map((bl, index) => (
        <div 
          key={index} 
          className="bg-white rounded-lg sm:rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-6"
        >
          <div className="flex gap-3 sm:gap-4 items-start w-full">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm">
                <OptimizedImage
                  src={bl.user_id?.avatar ? getAvatarSrc(bl.user_id.avatar) : "/images/avatar-default.png"}
                  alt={bl.user_id?.fullName || bl.user_id?.username || "User"}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex flex-col gap-2 mb-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <span className=" text-gray-900 text-sm font-bold ">
                    {bl.user_id?.fullName || bl.user_id?.username || "Khách hàng"}
                  </span>
                  <div className="flex items-center">
                    <StarRating rating={bl.rating} className="scale-75 sm:scale-90" />
                    <span className="ml-2 text-xs sm:text-sm font-medium text-gray-600">
                      {bl.rating}/5
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    {bl.created_at ? new Date(bl.created_at).toLocaleString("vi-VN", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : ""}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-red-500">
                <p className="text-gray-700 leading-relaxed text-sm ">
                  {bl.comment || "Chưa có đánh giá nào."}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

