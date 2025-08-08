"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState({
    mission: false,
    whyChoose: false,
    team: false
  });

  const missionRef = useRef<HTMLDivElement>(null);
  const whyChooseRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const section = entry.target.getAttribute('data-section');
          if (section) {
            setIsVisible(prev => ({ ...prev, [section]: true }));
          }
        }
      });
    }, observerOptions);

    if (missionRef.current) {
      missionRef.current.setAttribute('data-section', 'mission');
      observer.observe(missionRef.current);
    }
    if (whyChooseRef.current) {
      whyChooseRef.current.setAttribute('data-section', 'whyChoose');
      observer.observe(whyChooseRef.current);
    }
    if (teamRef.current) {
      teamRef.current.setAttribute('data-section', 'team');
      observer.observe(teamRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <main className='min-h-screen bg-[url("https://img.freepik.com/free-vector/seamless-gold-rhombus-grid-pattern-black-background_53876-97589.jpg?semt=ais_hybrid&w=740")] text-gray-900'>
      <div className='relative h-80 md:h-126'>
        <Image
          src='/images/mixed/banner4.jpg' 
          alt='Về V-CLOCK Banner'
          fill
          className='absolute inset-0 w-full h-full object-cover opacity-80'
        />
        <div className='absolute inset-0 flex flex-col justify-center items-center text-center text-white p-4'>
          <h1 className='text-4xl md:text-5xl font-bold mb-4 tracking-tight mt-20 animate-fade-in'>
            Về V-CLOCK
          </h1>
          <p className='text-lg md:text-xl max-w-2xl animate-fade-in' style={{ animationDelay: '0.3s' }}>
            Nơi hội tụ những giá trị đỉnh cao của thời gian, phong cách và đẳng cấp.
          </p>
        </div>
      </div>

      <section className='text-center py-16 px-4 sm:px-6 lg:px-8 animate-fade-in' style={{ animationDelay: '0.6s' }}>
        <p className='text-xl text-white mb-8 max-w-3xl mx-auto'>
          V-CLOCK tự hào là địa chỉ tin cậy cho những ai yêu thích đồng hồ chính hãng, sang trọng và chất lượng.
        </p>
        <div className='max-w-4xl mx-auto'>
          <Image 
            src='/images/mixed/about.png' 
            alt='Showroom V-CLOCK' 
            width={800}
            height={500}
            className='mx-auto rounded-xl shadow-lg w-full object-cover max-h-[500px] hover:scale-105 transition-transform duration-500' 
          />
        </div>
      </section>

      <section 
        ref={missionRef}
        className={`py-16 bg-white transition-all duration-1000 ${
          isVisible.mission 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-20'
        }`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-2xl font-bold mb-3 text-center text-gray-800'>SỨ MỆNH & GIÁ TRỊ CỐT LÕI</h2>
          <div className="mx-auto mb-8 w-30 h-1 bg-red-700 rounded"></div>
          <div className='grid md:grid-cols-3 gap-8'>
            <div className={`bg-slate-50 rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${
              isVisible.mission ? 'animate-slide-up' : ''
            }`} style={{ animationDelay: '0.2s' }}>
              <img src='https://png.pngtree.com/png-clipart/20230822/original/pngtree-target-with-dart-in-bulleye-icon-picture-image_8182392.png' alt='Sứ mệnh' className='w-24 h-24 object-contain rounded-full mb-4' />
              <h3 className='font-semibold text-xl mb-2 text-gray-700'>Sứ Mệnh</h3>
              <p className='text-gray-600'>
                Mang đến cho khách hàng những sản phẩm đồng hồ chính hãng, chất lượng cao cùng dịch vụ tận tâm, chuyên nghiệp.
              </p>
            </div>
            <div className={`bg-slate-50 rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${
              isVisible.mission ? 'animate-slide-up' : ''
            }`} style={{ animationDelay: '0.4s' }}>
              <img src='https://quindio.gov.co/medios/imagenes/CONTRATACION.png' alt='Giá trị' className='w-24 h-24 object-contain rounded-full mb-4' />
              <h3 className='font-semibold text-xl mb-2 text-gray-700'>Giá Trị Cốt Lõi</h3>
              <p className='text-gray-600'>
                Uy tín – Chất lượng – Đổi mới – Khách hàng là trung tâm của mọi hoạt động.
              </p>
            </div>
            <div className={`bg-slate-50 rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${
              isVisible.mission ? 'animate-slide-up' : ''
            }`} style={{ animationDelay: '0.6s' }}>
              <img src='https://icones.pro/wp-content/uploads/2021/05/icone-oeil-beurre-rouge-300x300.png' alt='Tầm nhìn' className='w-24 h-24 object-contain rounded-full mb-4' />
              <h3 className='font-semibold text-xl mb-2 text-gray-700'>Tầm Nhìn</h3>
              <p className='text-gray-600'>
                Trở thành thương hiệu đồng hồ hàng đầu Việt Nam, vươn tầm quốc tế.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section 
        ref={whyChooseRef}
        className={`py-16 transition-all duration-1000 ${
          isVisible.whyChoose 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-20'
        }`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <h2 className='text-2xl font-bold mb-3 text-center text-white'>TẠI SAO CHỌN V-CLOCK?</h2>
          <div className="mx-auto mb-8 w-30 h-1 bg-red-700 rounded"></div>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            <div className={`flex flex-col justify-center ${
              isVisible.whyChoose ? 'animate-slide-left' : ''
            }`}>
              <ul className='space-y-3 text-white text-lg'>
                <li className={`flex items-center transition-all duration-300 ${
                  isVisible.whyChoose ? 'animate-fade-in' : ''
                }`} style={{ animationDelay: '0.1s' }}>
                  <span className='text-red-400 mr-3 text-xl'>✓</span> Sản phẩm 100% chính hãng, nhập khẩu trực tiếp
                </li>
                <li className={`flex items-center transition-all duration-300 ${
                  isVisible.whyChoose ? 'animate-fade-in' : ''
                }`} style={{ animationDelay: '0.2s' }}>
                  <span className='text-red-400 mr-3 text-xl'>✓</span> Bảo hành chính hãng, hỗ trợ trọn đời
                </li>
                <li className={`flex items-center transition-all duration-300 ${
                  isVisible.whyChoose ? 'animate-fade-in' : ''
                }`} style={{ animationDelay: '0.3s' }}>
                  <span className='text-red-400 mr-3 text-xl'>✓</span> Đa dạng mẫu mã, thương hiệu nổi tiếng thế giới
                </li>
                <li className={`flex items-center transition-all duration-300 ${
                  isVisible.whyChoose ? 'animate-fade-in' : ''
                }`} style={{ animationDelay: '0.4s' }}>
                  <span className='text-red-400 mr-3 text-xl'>✓</span> Giá cả cạnh tranh, nhiều ưu đãi hấp dẫn
                </li>
                <li className={`flex items-center transition-all duration-300 ${
                  isVisible.whyChoose ? 'animate-fade-in' : ''
                }`} style={{ animationDelay: '0.5s' }}>
                  <span className='text-red-400 mr-3 text-xl'>✓</span> Đội ngũ tư vấn chuyên nghiệp, tận tâm
                </li>
                <li className={`flex items-center transition-all duration-300 ${
                  isVisible.whyChoose ? 'animate-fade-in' : ''
                }`} style={{ animationDelay: '0.6s' }}>
                  <span className='text-red-400 mr-3 text-xl'>✓</span> Miễn phí giao hàng toàn quốc
                </li>
                <li className={`flex items-center transition-all duration-300 ${
                  isVisible.whyChoose ? 'animate-fade-in' : ''
                }`} style={{ animationDelay: '0.7s' }}>
                  <span className='text-red-400 mr-3 text-xl'>✓</span> Đổi trả dễ dàng trong 7 ngày
                </li>
              </ul>
            </div>
            <div className={`${
              isVisible.whyChoose ? 'animate-slide-right' : ''
            }`}>
             <img 
                src='/images/mixed/tt1.png' 
                alt='Lý do chọn V-CLOCK' 
                className='rounded-2xl object-cover w-full h-auto md:h-full hover:scale-105 transition-transform duration-500'
                style={{
                  boxShadow: '0 10px 40px rgb(255, 24, 24)'
                }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}