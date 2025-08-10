
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
      const res = await fetch(`http://localhost:3000/api/reviews/${productId}`);
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

  if (loading) return <p>Đang tải bình luận...</p>;

  if (!bl_arr || bl_arr.length === 0) {
    return <p>Chưa có bình luận nào cho sản phẩm này.</p>;
  }

  return (
    <div className="w-full space-y-8" id="data">
      {bl_arr.map((bl, index) => (
        <div key={index} className="flex gap-4 items-start w-full">
          <div 
            className="w-10 h-10 rounded-full overflow-hidden border border-gray-200"
            style={{ 
              minWidth: '40px',
              minHeight: '40px',
              maxWidth: '40px',
              maxHeight: '40px'
            }}
          >
            <OptimizedImage
              src={bl.user_id?.avatar ? getAvatarSrc(bl.user_id.avatar) : "/images/avatar-default.png"}
              alt={bl.user_id?.fullName || bl.user_id?.username || "User"}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-1 w-full">
              <span className="font-semibold">{bl.user_id?.fullName || bl.user_id?.username || "Anonymous"}</span>
              <StarRating rating={bl.rating} className="ml-2" />
              <span className="text-gray-400 text-xs ml-2">
                {bl.created_at ? new Date(bl.created_at).toLocaleString("vi-VN") : ""}
              </span>
            </div>
            <div className="text-gray-700 text-sm w-full">
              {bl.comment || "Chưa có bình luận nào."}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

