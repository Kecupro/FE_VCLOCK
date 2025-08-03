import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer = () => (
  <footer className="bg-[url('/images/footer-background.jpg')] text-gray-200 py-10 px-4 mt-8">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between  gap-6">
      <div className="text-center md:text-left">
        <Image 
          src="/images/logoVCLOCK.png" 
          alt="DUANTN Logo" 
          width={200}
          height={80}
          className="h-22 mb-4 mx-auto md:mx-0" 
        />
        <p className="text-sm mb-2">1073/23 CMT8, P7, Q.Tân Bình, TP.HCM</p>
        <p className="text-sm mb-2">Hotline: <a href="tel:0909123456" className="hover:text-red-400">0909.123.456</a></p>
        <p className="text-sm mb-2">Email: <a href="mailto:info@duantn.com" className="hover:text-red-400">info@duantn.com</a></p>
      </div>
      <div>
        <h3 className="font-bold text-xl mb-2">MENU</h3>
        <ul className="list-none p-0 m-0">
         <li className="mb-4"><Link href="/" className="hover:text-red-400"><i className="fa-solid fa-caret-right mr-2"></i>Trang chủ</Link></li>
          <li className="mb-4"><a href="/about" className="hover:text-red-400"><i className="fa-solid fa-caret-right mr-2"></i>Giới thiệu</a></li>
          <li className="mb-4"><a href="/shop" className="hover:text-red-400"><i className="fa-solid fa-caret-right mr-2"></i>Cửa hàng</a></li>
          <li className="mb-4"><a href="/new" className="hover:text-red-400"><i className="fa-solid fa-caret-right mr-2"></i>Tin tức</a></li>
          <li className="mb-4"><a href="/contact" className="hover:text-red-400"><i className="fa-solid fa-caret-right mr-2"></i>Liên hệ</a></li>
        </ul>
      </div>
    <div>
      <h3 className="font-bold text-xl mb-2">SẢN PHẨM</h3>
      <ul className="list-none p-0 m-0">
        <li className="mb-4"><a href="" className="hover:text-red-400"><i className="fa-solid fa-caret-right mr-2"></i>Breguet</a></li>
        <li className="mb-4"><a href="" className="hover:text-red-400"><i className="fa-solid fa-caret-right mr-2"></i>Baume & Mercier</a></li>
        <li className="mb-4"><a href="" className="hover:text-red-400"><i className="fa-solid fa-caret-right mr-2"></i>Bulova</a></li> 
        <li className="mb-4"><a href="" className="hover:text-red-400"><i className="fa-solid fa-caret-right mr-2"></i>Bulova Accutron</a></li>
        <li className="mb-4"><a href="" className="hover:text-red-400"><i className="fa-solid fa-caret-right mr-2"></i>Bulova Accu Swiss</a></li>
      </ul>
    </div>
      <div className="">
          <h3 className="font-bold text-xl">ĐĂNG KÝ</h3>
          <p className="text-sm">Đăng ký nhận thông tin mới nhất từ chúng tôi.</p>
          <form className="mt-2">
            <input type="email" placeholder="Nhập email của bạn" className="p-2 rounded bg-white text-black w-full md:w-64 placeholder-black" />
            <button type="submit" className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"><i className="fa-solid fa-paper-plane"></i></button>
          </form>
          <div className="mt-10">
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
      © {new Date().getFullYear()} DUANTN.
    </div>
  </footer>
);

export default Footer;