"use client";
import { useState, useEffect } from "react";

const slides = [
  {
    image: "/images/banner1.jpg",
    title: "Đồng hồ cao cấp",
    desc: "Khám phá bộ sưu tập đồng hồ sang trọng, đẳng cấp quốc tế.",
  },
  {
    image: "images/banner3.jpg",
    title: "Bảo hành chính hãng",
    desc: "Cam kết bảo hành 5 năm cho mọi sản phẩm tại cửa hàng.",
  },
   {
    image: "/images/banner4.jpg",
    title: "Đồng hồ cao cấp",
    desc: "Giảm giá lên đến 30% cho các mẫu mới nhất trong tháng này.",
  },
   {
    image: "/images/banner8.jpg",
    title: "Ưu đãi đặc biệt",
    desc: "Giảm giá lên đến 30% cho các mẫu mới nhất trong tháng này.",
  },
];

export default function Banner() {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearTimeout(timer);
  }, [current]);

  const prevSlide = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const nextSlide = () => setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));

  return (
    <div className="relative w-full h-96 md:h-[750px] overflow-hidden ">
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className={`w-full h-full object-cover ${idx === current ? "animate-zoom" : ""}`}
          />
          <div className="absolute inset-0 bg-opacity-10  bg-black/50 backdrop-blur-sm opacity-30"></div>
          <div className={`absolute inset-0 flex flex-col justify-center items-start text-left text-white z-10 pl-10 md:pl-20
            transition-all duration-700
            ${idx === current ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}
          `}>
            <h2 className="text-2xl md:text-5xl font-bold mb-2 px-15">{slide.title}</h2>
            <p className="text-base md:text-lg bg-opacity-50 rounded mx-15 py-2 max-w-xl md:max-w-lg">{slide.desc}</p>
            <button
        className="bg-black border-2 border-red-700 hover:bg-red-700 text-white font-semibold mx-15 px-6 py-2 rounded transition mt-4"
        onClick={() => window.location.href = "/shop"}
      >
        MUA NGAY 
      </button>
          </div>
        </div>
      ))}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-60 text-white rounded-full p-2 z-20 text-2xl"
        aria-label="Trước"
      >
      <i className="fa-solid fa-chevron-left"></i>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-60 text-white rounded-full p-2 z-20 text-2xl"
        aria-label="Sau"
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full ${idx === current ? "bg-white" : "bg-gray-400"}`}
            aria-label={`Chọn slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}