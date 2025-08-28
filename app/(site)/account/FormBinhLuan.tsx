

import { useState } from 'react';
export default function ReviewForm({
  productId,
  orderDetailId,
  onSuccess,
}: {
  productId: string;
  orderDetailId: string;
  onSuccess?: (rating: number) => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`http://localhost:3000/api/reviews`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, rating, comment, order_detail_id: orderDetailId, }),
      });

      const data = await res.json();
      if (res.ok) {
        if (res.ok) {
          setMessage('Gửi đánh giá thành công!');
          setRating(0);
          setComment('');
          onSuccess?.(rating); 
        }        
      } else {
        setMessage(data.error || 'Lỗi khi gửi đánh giá');
      }
    } catch {
      setMessage('Lỗi máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-4 text-gray-700"
    >
      <div>
        <label className="font-semibold text-sm block mb-1">Đánh giá của bạn</label>
        <div className="flex items-center justify-start gap-2 mb-2">
        <div className="flex gap-1 text-2xl text-yellow-400">
          {[1, 2, 3, 4, 5].map((star) => (
            <i
              key={star}
              className={`fa-star cursor-pointer ${
                (hover || rating) >= star ? 'fa-solid' : 'fa-regular'
              } hover:scale-110 transition-transform duration-150`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            ></i>
          ))}
        </div>
        <span className="text-sm text-gray-600 pl-2">
          {(hover || rating)}/5
        </span>
      </div>
      </div>

      <textarea
        className="border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200"
        rows={4}
        placeholder="Chia sẻ cảm nhận của bạn..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded-md font-medium hover:bg-red-600 transition-colors duration-200"
      >
        {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
      </button>

      {message && (
        <p className="text-sm mt-1 text-center text-red-600">{message}</p>
      )}
    </form>
  );
}
