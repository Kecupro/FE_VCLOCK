"use client";

import { useState, useEffect } from 'react';

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
          className="fixed bottom-6 right-7 z-[60] bg-red-600 hover:bg-red-700 text-white w-12 h-12 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
          aria-label="Cuộn lên đầu trang"
        >
          <i className="fa-solid fa-chevron-up text-lg group-hover:animate-bounce"></i>
        </button>
      )}
    </>
  );
}
