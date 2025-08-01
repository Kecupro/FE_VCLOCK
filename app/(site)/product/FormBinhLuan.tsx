'use client';

import { useState } from 'react';

export default function ReviewForm({ productId, onSuccess }: { productId: string; onSuccess?: () => void;}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:3000/api/reviews', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, rating, comment }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Gửi đánh giá thành công!');
        setRating(0);
        setComment('');
        onSuccess?.();
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
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 mb-10">
      <label className="font-medium text-sm w-full">Đánh giá của bạn</label>

      <div className="flex gap-1 text-red-500 text-xl w-full">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fa-star cursor-pointer ${
              (hover || rating) >= star ? 'fa-solid' : 'fa-regular'
            } hover:text-red-400`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          ></i>
        ))}
      </div>

      <textarea
        className="border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-red-200 w-full"
        rows={3}
        placeholder="Nhận xét của bạn..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-red-700 transition w-full"
      >
        {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
      </button>

      {message && (
        <p className="text-sm mt-1 text-center text-gray-600">{message}</p>
      )}
    </form>
  );
}
