
import { useEffect, useState, useRef } from 'react';
import Link from "next/link";
import axios from 'axios';
import { INews } from '../cautrucdata';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Autoplay } from 'swiper/modules';
import OptimizedImage from './OptimizedImage';
import { getNewsImageUrl } from '@/app/utils/imageUtils';
import type { Swiper as SwiperType } from 'swiper';

export default function News() {
  const [newsList, setNewsList] = useState<INews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {

      const response = await axios.get<{ news: INews[]; currentPage: number; totalPages: number; totalNews: number }>(`http://localhost:3000/api/news?page=1&limit=6`);
      setNewsList(response.data.news);
      } catch (error: unknown) {
              console.error('Lỗi tải tin tức:', error);
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
          <h3 className="text-center font-bold text-2xl mb-4 text-gray-800">TIN TỨC SỰ KIỆN</h3>
          <div className="mx-auto mb-10 w-32 h-1 bg-gradient-to-r from-red-600 to-red-800 rounded-full shadow-lg"></div>
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
          <h3 className="text-center font-bold text-2xl mb-4 text-gray-800">TIN TỨC SỰ KIỆN</h3>
          <div className="mx-auto mb-10 w-32 h-1 bg-gradient-to-r from-red-600 to-red-800 rounded-full shadow-lg"></div>
          <p className="text-gray-600">Không có tin tức nào</p>
        </div>
      </div>
    );
  }

  const handleMouseEnter = () => {
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.stop();
    }
  };

  const handleMouseLeave = () => {
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.start();
    }
  };

  return (
    <div className="w-full bg-white py-8">
      <h3 className="text-center font-bold text-2xl mb-4 text-gray-800">TIN TỨC SỰ KIỆN</h3>
      <div className="mx-auto mb-10 w-32 h-1 bg-gradient-to-r from-red-600 to-red-800 rounded-full shadow-lg"></div>
      <div 
        className="max-w-6xl mx-auto"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
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
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
        >
          {newsList.slice(0, 6).map((news) => (
            <SwiperSlide key={news._id}>
              <div className="relative group rounded overflow-hidden shadow hover:shadow-lg transition h-100 flex flex-col justify-end">
                <OptimizedImage
                  src={getNewsImageUrl(news.image)}
                  alt={news.title}
                  width={400}
                  height={300}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  fallbackSrc={getNewsImageUrl('default-news.jpg')}
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/5 transition"></div>
                <div className="relative z-10 p-6 bg-black bg-black/10 backdrop-blur-sm flex flex-col justify-end min-h-[140px]">
                  <h4 className="font-semibold text-lg mb-2 text-white drop-shadow truncate">{news.title}</h4>
                  <p className="text-gray-200 text-sm mb-2 drop-shadow">
                    {news.content ? 
                      (() => {
                        try {
                          let cleanContent = news.content.replace(/<[^>]*>/g, '');
                          
                          const tempDiv = document.createElement('div');
                          tempDiv.innerHTML = cleanContent;
                          cleanContent = tempDiv.textContent || tempDiv.innerText || '';
                          const htmlEntities: { [key: string]: string } = {
                            '&nbsp;': ' ',
                            '&amp;': '&',
                            '&lt;': '<',
                            '&gt;': '>',
                            '&quot;': '"',
                            '&#39;': "'",
                            '&apos;': "'",
                            '&ndash;': '-',
                            '&mdash;': '-',
                            '&hellip;': '...',
                            '&ldquo;': '"',
                            '&rdquo;': '"',
                            '&lsquo;': "'",
                            '&rsquo;': "'",
                            '&copy;': '(c)',
                            '&reg;': '(R)',
                            '&trade;': '(TM)',
                            '&deg;': '°',
                            '&plusmn;': '+/-',
                            '&times;': 'x',
                            '&divide;': '/',
                            '&frac12;': '1/2',
                            '&frac14;': '1/4',
                            '&frac34;': '3/4',
                            '&sup1;': '1',
                            '&sup2;': '2',
                            '&sup3;': '3',
                            '&micro;': 'u',
                            '&para;': 'P',
                            '&sect;': 'S',
                            '&bull;': '*',
                            '&middot;': '*',
                            '&dagger;': '+',
                            '&Dagger;': '++',
                            '&larr;': '<-',
                            '&rarr;': '->',
                            '&uarr;': '^',
                            '&darr;': 'v',
                            '&lArr;': '<=',
                            '&rArr;': '=>',
                            '&uArr;': '^^',
                            '&dArr;': 'vv',
                            '&harr;': '<->',
                            '&hArr;': '<=>',
                            '&spades;': 'S',
                            '&clubs;': 'C',
                            '&hearts;': 'H',
                            '&diams;': 'D',
                            // Tiếng Việt
                            '&oacute;': 'ó',
                            '&agrave;': 'à',
                            '&aacute;': 'á',
                            '&eacute;': 'é',
                            '&egrave;': 'è',
                            '&uacute;': 'ú',
                            '&ugrave;': 'ù',
                            '&iacute;': 'í',
                            '&igrave;': 'ì',
                            '&yacute;': 'ý',
                            '&ograve;': 'ò',
                            '&atilde;': 'ã',
                            '&otilde;': 'õ',
                            '&ntilde;': 'ñ',
                            '&ccedil;': 'ç',
                            '&Aacute;': 'Á',
                            '&Eacute;': 'É',
                            '&Iacute;': 'Í',
                            '&Oacute;': 'Ó',
                            '&Uacute;': 'Ú',
                            '&Agrave;': 'À',
                            '&Egrave;': 'È',
                            '&Igrave;': 'Ì',
                            '&Ograve;': 'Ò',
                            '&Ugrave;': 'Ù',
                            '&Atilde;': 'Ã',
                            '&Otilde;': 'Õ',
                            '&Ntilde;': 'Ñ',
                            '&Ccedil;': 'Ç',
                            '&ocirc;': 'ô',
                            '&acirc;': 'â',
                            '&ecirc;': 'ê',
                            '&icirc;': 'î',
                            '&ucirc;': 'û',
                            '&Ocirc;': 'Ô',
                            '&Acirc;': 'Â',
                            '&Ecirc;': 'Ê',
                            '&Icirc;': 'Î',
                            '&Ucirc;': 'Û'
                          };
                          
                          cleanContent = cleanContent.replace(/&[a-zA-Z0-9#]+;/g, (match) => {
                            return htmlEntities[match] || match;
                          });
                          
                          cleanContent = cleanContent.replace(/\s+/g, ' ').trim();
                          
                          const maxLength = 120;
                          if (cleanContent.length > maxLength) {
                            return cleanContent.substring(0, maxLength).trim() + '...';
                          }
                          
                          return cleanContent;
                        } catch (error) {
                          console.error('Error processing news content:', error);
                          try {
                            const parser = new DOMParser();
                            const doc = parser.parseFromString(news.content, 'text/html');
                            const fallbackContent = doc.body.textContent || doc.body.innerText || '';
                            const cleanFallback = fallbackContent.replace(/\s+/g, ' ').trim();
                            return cleanFallback.length > 120 
                              ? cleanFallback.substring(0, 120) + '...' 
                              : cleanFallback;
                          } catch (fallbackError) {
                            console.error('Fallback error:', fallbackError);
                            const fallbackContent = news.content.replace(/<[^>]*>/g, '').trim();
                            return fallbackContent.length > 120 
                              ? fallbackContent.substring(0, 120) + '...' 
                              : fallbackContent;
                          }
                        }
                      })() : ''
                    }
                  </p>
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