"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { INews, ICateNews } from "../cautrucdata";
import OptimizedImage from "../components/OptimizedImage";
import { getNewsImageUrl } from '@/app/utils/imageUtils';
interface NewsResponse {
  news: INews[];
  currentPage: number;
  totalPages: number;
  totalNews: number;
}

const NewsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded mb-4 w-1/2"></div>
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function News() {
  const [newsData, setNewsData] = useState<NewsResponse | null>(null);
  const [categories, setCategories] = useState<ICateNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchNews = useCallback(async () => {
    try {
      setIsTransitioning(true);
      
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/news?page=${currentPage}&limit=6`;
      
      if (selectedCategory !== 'all') {
        url = `${process.env.NEXT_PUBLIC_API_URL}/api/news/category/${selectedCategory}?page=${currentPage}&limit=6`;
      }
      
      const response = await axios.get(url);
      
      await new Promise(resolve => setTimeout(resolve, 150));
      
      setNewsData(response.data as NewsResponse);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách tin tức');
              console.error('Lỗi tải tin tức:', err);
    } finally {
      setLoading(false);
      setIsTransitioning(false);
    }
  }, [currentPage, selectedCategory]);

  const debouncedFetchNews = useCallback(() => {
    const timeoutId = setTimeout(() => {
      fetchNews();
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [fetchNews]);

  useEffect(() => {
    debouncedFetchNews();
  }, [currentPage, selectedCategory, debouncedFetchNews]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/category-news`);
      setCategories(response.data as ICateNews[]);
    } catch (err) {
              console.error('Lỗi tải danh mục tin tức:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === selectedCategory) return;
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setIsTransitioning(true);
  };

  if (loading && !newsData) {
    return (
      <div className="w-full bg-gray-50 py-12 pt-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-center font-bold text-2xl mb-3 text-gray-800">TIN TỨC SỰ KIỆN</h3>
          <div className="mx-auto mb-12 w-24 h-1 bg-red-600 rounded"></div>
          <NewsSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white py-8 pt-45">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button 
            onClick={fetchNews}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 py-12 pt-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-center font-bold text-2xl mb-3 text-gray-800">TIN TỨC SỰ KIỆN</h3>
        <div className="mx-auto mb-12 w-24 h-1 bg-red-600 rounded"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      
          <aside className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h4 className="font-semibold text-xl mb-4 text-gray-800 border-b pb-2">
                <i className="fas fa-list mr-2"></i>
                Danh mục
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('all')}
                  disabled={isTransitioning}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                    selectedCategory === 'all'
                      ? 'bg-red-100 text-red-600 font-medium shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                  } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <i className="fas fa-newspaper mr-2"></i>
                  Tất cả tin tức
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryChange(category._id)}
                    disabled={isTransitioning}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                      selectedCategory === category._id
                        ? 'bg-red-100 text-red-600 font-medium shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:shadow-sm'
                    } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <i className="fas fa-tag mr-2"></i>
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <h4 className="font-semibold text-xl mb-4 text-gray-800 border-b pb-2">
                <i className="fas fa-newspaper mr-2"></i>
                Bài viết mới
              </h4>
              <div className="space-y-4">
                {newsData?.news.slice(0, 5).map((post) => (
                  <Link
                    href={`/news/${post._id}`}
                    key={post._id}
                    className="flex items-center gap-3 group hover:bg-gray-50 rounded-lg p-2 transition-all duration-200"
                  >
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <OptimizedImage
                        src={getNewsImageUrl(post.image || undefined)}
                        alt={post.title}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2">
                        {post.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {post.content}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-3">
            {selectedCategory !== 'all' && (
              <div className="mb-6 animate-fade-in">
                <h4 className="text-lg font-semibold text-gray-800">
                  Danh mục: {categories.find(cat => cat._id === selectedCategory)?.name}
                </h4>
                <button
                  onClick={() => handleCategoryChange('all')}
                  disabled={isTransitioning}
                  className="text-red-600 hover:text-red-700 text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <i className="fas fa-arrow-left mr-1"></i>
                  Xem tất cả tin tức
                </button>
              </div>
            )}

            <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
              {isTransitioning ? (
                <NewsSkeleton />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {newsData?.news.map((news, index) => (
                    <div
                      key={news._id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group animate-fade-in h-[420px] flex flex-col"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <OptimizedImage
                          src={getNewsImageUrl(news.image || undefined)}
                          alt={news.title}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-black border border-white text-white text-xs px-2 py-1 rounded">
                          <i className="fas fa-tag mr-1"></i>
                          {(news.categorynews_id?.name || news.category?.name) || 'Tin tức'}
                        </div>  
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <Link
                          href={`/news/${news._id}`}
                          className="font-semibold text-lg text-gray-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors block hover:underline"
                        >
                          {news.title}
                        </Link>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {news.content}
                        </p>
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-3 mt-auto">
                          <span>
                            <i className="far fa-calendar-alt mr-1"></i>
                            {news.created_at ? new Date(news.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                          </span>
                          <span>
                            <i className="far fa-eye mr-1"></i>
                            {news.views || 0} lượt xem
                          </span>
                        </div>
                        <Link
                          href={`/news/${news._id}`}
                          className="mt-2 w-full inline-flex justify-center items-center px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 transition-colors"
                        >
                          Đọc thêm <i className="fas fa-arrow-right ml-2"></i>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {newsData && newsData.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isTransitioning}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <i className="fas fa-chevron-left mr-1"></i>
                </button>
                {[...Array(newsData.totalPages)].map((_, idx) => {
                  const page = idx + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={isTransitioning}
                      className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-red-500 text-white shadow'
                          : 'bg-white text-gray-700 hover:bg-red-100'
                      } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === newsData.totalPages || isTransitioning}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <i className="fas fa-chevron-right ml-1"></i>
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}