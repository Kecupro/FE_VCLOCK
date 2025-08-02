"use client";
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const AdPopup = () => {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative bg-white rounded-xl shadow-lg p-0 w-80 h-80 sm:w-120 sm:h-120 flex items-center justify-center">
        {/* Nút đóng */}
        <button
          className="absolute top-2 right-2 text-white  rounded-full p-2  z-10"
          onClick={() => setShow(false)}
          aria-label="Đóng quảng cáo"
        >
          <FaTimes size={22} />
        </button>
        {/* Ảnh quảng cáo */}
        <img
          src="/images/qchome.png" // Đổi thành ảnh bạn muốn quảng cáo
          alt="Quảng cáo"
          className="w-full h-full object-cover rounded-xl"
        />
      </div>
    </div>
  );
};

export default AdPopup; 