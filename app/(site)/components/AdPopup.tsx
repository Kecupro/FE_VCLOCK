"use client";
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const AdPopup = () => {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative bg-white rounded-xl shadow-lg p-0 w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl h-auto max-h-[80vh] flex items-center justify-center">
        {/* Nút đóng */}
        <button
          className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 z-10 transition-colors"
          onClick={() => setShow(false)}
          aria-label="Đóng quảng cáo"
        >
          <FaTimes size={18} />
        </button>
        {/* Ảnh quảng cáo */}
        <img
          src="/images/qchome.png" // Đổi thành ảnh bạn muốn quảng cáo
          alt="Quảng cáo"
          className="w-full h-full object-contain rounded-xl"
        />
      </div>
    </div>
  );
};

export default AdPopup; 