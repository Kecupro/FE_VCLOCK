'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import axios from 'axios';
import { INews } from '../cautrucdata';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Autoplay } from 'swiper/modules';


export default function News() {
  const [newsList, setNewsList] = useState<INews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {

      const response = await axios.get<{ news: INews[]; currentPage: number; totalPages: number; totalNews: number }>('http://localhost:3000/api/news');
      		console.log('📰 Phản hồi tin tức:', response.data);
      
      if (response.data && response.data.news) {
        setNewsList(response.data.news);
        		console.log('✅ Tin tức đã tải:', response.data.news.length, 'mục');
      } else {
        console.error('❌ Cấu trúc phản hồi không hợp lệ:', response.data);
        setError('Dữ liệu không đúng định dạng');
      }
    } catch (error: unknown) {
              console.error('❌ Lỗi tải tin tức:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể tải tin tức';
      const axiosError = error as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white py-8">
        <div className="text-center">
          <h3 className="text-center font-bold text-2xl mb-3">TIN TỨC SỰ KIỆN</h3>
          <div className="mx-auto mb-8 w-30 h-1 bg-red-700 rounded"></div>
          <p className="text-red-600">Lỗi: {error}</p>
          <button 
            onClick={fetchNews}
            className="mt-4 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!newsList || newsList.length === 0) {
    return (
      <div className="w-full bg-white py-8">
        <div className="text-center">
          <h3 className="text-center font-bold text-2xl mb-3">TIN TỨC SỰ KIỆN</h3>
          <div className="mx-auto mb-8 w-30 h-1 bg-red-700 rounded"></div>
          <p className="text-gray-600">Không có tin tức nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white py-8">
      <h3 className="text-center font-bold text-2xl mb-3">TIN TỨC SỰ KIỆN</h3>
      <div className="mx-auto mb-8 w-30 h-1 bg-red-700 rounded"></div>
      <div className="max-w-6xl mx-auto">
        <Swiper
          modules={[Navigation, Autoplay]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="!pb-10"
        >
          {newsList.slice(0, 6).map((news) => (
            <SwiperSlide key={news._id}>
              <div className="relative group rounded overflow-hidden shadow hover:shadow-lg transition h-100 flex flex-col justify-end">
                <img
                  src={`/images/news/${news.image}`}
                  alt={news.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    		console.log('❌ Hình ảnh tải thất bại:', news.image);
                    e.currentTarget.src = '/images/news/default-news.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/5 transition"></div>
                <div className="relative z-10 p-6 bg-black bg-black/10 backdrop-blur-sm flex flex-col justify-end min-h-[140px]">
                  <h4 className="font-semibold text-lg mb-2 text-white drop-shadow">{news.title}</h4>
                  <p className="text-gray-200 text-sm mb-2 drop-shadow">{news.content}</p>
                  <Link
                    href={`/news/${news._id}`}
                    className="inline-flex items-center text-white font-regular hover:underline mt-2"
                  >
                    Đọc thêm <i className="fa-solid fa-caret-right ml-1 text-red-500"></i>
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}