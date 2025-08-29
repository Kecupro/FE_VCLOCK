"use client";

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6.5 z-[60] bg-gradient-to-br from-red-500  to-red-700 hover:from-red-600  hover:to-red-800 text-white w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 hover:rotate-12 flex items-center justify-center group"
          aria-label="Cuộn lên đầu trang"
        >
          <div className="relative">
            <ArrowUp className="w-6 h-6 text-white drop-shadow-sm group-hover:animate-bounce transition-all duration-200" />
            {/* <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-pulse"></div> */}
          </div>
        </button>
      )}
    </>
  );
}
