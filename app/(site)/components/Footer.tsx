"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
const Footer = () => {
  const [categories, setCategories] = useState<{ name: string }[]>([]);

  useEffect(() => {
    fetch(`http://localhost:3000/api/category`)
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data.slice(0, 5));
        }
      });
  }, []);

  return (
    <footer className="bg-[url('/images/mixed/footer-background.jpg')] text-gray-200 py-10 px-4 mt-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between  gap-6">
        <div className="text-center md:text-left">
          <Image 
            src="/images/mixed/logoVCLOCK.png" 
            alt="DUANTN Logo" 
            width={246}
            height={72}
            className="h-22 mb-4 mx-auto md:mx-0" 
          />
          <p className="text-sm mb-2">1073/23 CMT8, P7, Q.Tân Bình, TP.HCM</p>
          <p className="text-sm mb-2">Hotline: <a href="tel:090912" className="hover:text-red-400">(+84) 313-728-397
          </a></p>
          <p className="text-sm mb-2">Email: <a href="mailto:vclock.com" className="hover:text-red-400">vclock</a></p>
        </div>
        <div>
          <h3 className="font-bold text-xl mb-2">MENU</h3>
          <ul className="list-none p-0 m-0">
           <li className="mb-4"><Link href="/" className="hover:text-red-400"><i className="fa-solid fa-caret-right mr-2"></i>Trang chủ</Link></li>
            <li className="mb-4"><a href="/about" className="hover:text-red-400"><i className="fa-solid fa-caret-right mr-2"></i>Giới thiệu</a></li>
            <li className="mb-4"><a href="/shop" className="hover:text-red-400"><i className="fa-solid fa-caret-right mr-2"></i>Cửa hàng</a></li>
            <li className="mb-4"><Link href="/news" className="hover:text-red-400"><i className="fa-solid fa-caret-right mr-2"></i>Tin tức </Link></li>
            <li className="mb-4"><a href="/contact" className="hover:text-red-400"><i className="fa-solid fa-caret-right mr-2"></i>Liên hệ</a></li>
          </ul>
        </div>
      <div>
        <h3 className="font-bold text-xl mb-2">DANH MỤC </h3>
        <ul className="list-none p-0 m-0">
          {categories.map((cat) => (
            <li key={cat.name} className="mb-4">
              <Link href={{ pathname: '/shop', query: { category: cat.name } }} className="hover:text-red-400">
                <i className="fa-solid fa-caret-right mr-2"></i>{cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
        <div className="">
            <div className="">
          <h3 className="font-bold text-xl mb-2">KẾT NỐI VỚI CHÚNG TÔI</h3>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" title="Facebook" className="hover:text-blue-500 text-2xl">
            <i className="fa-brands fa-facebook-f mr-3"></i>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter" className="hover:text-blue-400 text-2xl">
            <i className="fa-brands fa-twitter mr-3"></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" title="Instagram" className="hover:text-pink-400 text-2xl">
            <i className="fa-brands fa-instagram"></i>
          </a>
        </div> 
        </div>
      </div>
      <div className="border-t border-gray-700 mt-6 pt-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} VCLOCK.STORE
      </div>
    </footer>
  );
};

export default Footer;
