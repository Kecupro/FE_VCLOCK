'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { INews } from '../../cautrucdata';

export default function NewsDetail() {
  const params = useParams();
  const [news, setNews] = useState<INews | null>(null);
  const [loading, setLoading] = useState(true);
  const hasIncrementedView = useRef(false);

  useEffect(() => {
    if (params?.id) {
      fetchNewsDetail();
      // Chỉ tăng lượt xem nếu chưa xem trong session này
      if (!hasIncrementedView.current && !hasViewedInSession(params.id as string)) {
        incrementView();
      }
    }
  }, [params?.id]);

  // Kiểm tra và xóa session cũ nếu cần
  const cleanupOldSession = () => {
    if (typeof window === 'undefined') return;
    
    const lastCleanup = localStorage.getItem('viewedNewsLastCleanup');
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 24 giờ
    
    if (!lastCleanup || (now - parseInt(lastCleanup)) > oneDay) {
      localStorage.removeItem('viewedNews');
      localStorage.setItem('viewedNewsLastCleanup', now.toString());
    }
  };

  // Kiểm tra xem đã xem tin tức này trong session chưa
  const hasViewedInSession = (newsId: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    cleanupOldSession(); // Dọn dẹp session cũ trước khi kiểm tra
    
    const viewedNews = JSON.parse(localStorage.getItem('viewedNews') || '[]');
    return viewedNews.includes(newsId);
  };

  // Đánh dấu đã xem tin tức trong session
  const markAsViewed = (newsId: string) => {
    if (typeof window === 'undefined') return;
    
    cleanupOldSession(); // Dọn dẹp session cũ trước khi thêm mới
    
    const viewedNews = JSON.parse(localStorage.getItem('viewedNews') || '[]');
    if (!viewedNews.includes(newsId)) {
      viewedNews.push(newsId);
      localStorage.setItem('viewedNews', JSON.stringify(viewedNews));
    }
  };

  const fetchNewsDetail = async () => {
    try {
      const response = await axios.get(`https://bevclock-production.up.railway.app/api/news/${params.id}`);
      setNews(response.data as INews);
    } catch (error) {
      console.error('Error fetching news detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementView = async () => {
    if (hasIncrementedView.current) return;
    
    try {
      hasIncrementedView.current = true;
      const response = await axios.post(`https://bevclock-production.up.railway.app/api/news/${params.id}/increment-view`);
      
      if (response.data.success) {
        // Đánh dấu đã xem trong session
        markAsViewed(params.id as string);
        
        // Cập nhật lượt xem trong state nếu cần
        if (news) {
          setNews(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : null);
        }
      }
    } catch (error) {
      console.error('Error incrementing view:', error);
      hasIncrementedView.current = false; // Reset if failed
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white py-8 pt-45">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700"></div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="w-full bg-white py-8 pt-45">
        <div className="text-center text-red-500">
          <p>Không tìm thấy tin tức</p>
          <Link 
            href="/news"
            className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white py-8 pt-45">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white rounded-lg shadow-lg overflow-hidden">
            {news.image && (
              <div className="w-full h-96">
                <img
                  src={`/images/news/${news.image}`}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4">{news.title}</h1>
              <div className="flex items-center text-gray-500 text-sm mb-6">
                <span className="mr-4">
                  <i className="far fa-calendar-alt mr-2"></i>
                  {news.created_at ? new Date(news.created_at).toLocaleDateString('vi-VN') : ''}
                </span>
                <span className="mr-4">
                  <i className="far fa-eye mr-2"></i>
                  {news.views ?? 0} lượt xem
                </span>
                <span>
                  <i className="far fa-folder mr-2"></i>
                  {news.category?.name || 'Tin tức'}
                </span>
              </div>
              <div className="prose max-w-none">
                {news.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}