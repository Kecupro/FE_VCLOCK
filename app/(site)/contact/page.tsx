"use client";

import { useState } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validation function
  const validateForm = () => {
    const { name, email, phone, message } = formData;

    if (!name.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return false;
    }

    if (name.trim().length < 2) {
      toast.error("Họ tên phải có ít nhất 2 ký tự");
      return false;
    }

    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Email không hợp lệ");
      return false;
    }

    if (!phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return false;
    }

    const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      toast.error("Số điện thoại không hợp lệ");
      return false;
    }

    if (!message.trim()) {
      toast.error("Vui lòng nhập nội dung tin nhắn");
      return false;
    }

    if (message.trim().length < 10) {
      toast.error("Nội dung tin nhắn phải có ít nhất 10 ký tự");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(data.message);
        setFormData({ name: '', email: '', phone: '', company: '', message: '' });
        toast.success(data.message || 'Gửi tin nhắn thành công!');
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.message || 'Có lỗi xảy ra khi gửi tin nhắn.');
        toast.error(data.message || 'Có lỗi xảy ra khi gửi tin nhắn.');
      }
    } catch (error) {
      console.error('Lỗi form liên hệ:', error);
      setSubmitStatus('error');
      setSubmitMessage('Có lỗi xảy ra khi kết nối đến server.');
      toast.error('Có lỗi xảy ra khi kết nối đến server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="relative h-72 md:h-126 bg-gray-800">
        <Image
          src="/images/mixed/banner4.jpg" 
          alt="Liên hệ VClock"
          fill
          priority
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-4">
          <h1 className="text-4xl md:text-6xl font-bold mt-20 mb-4 tracking-tight">
            Liên Hệ Với Chúng Tôi
          </h1>
          <p className="text-lg md:text-xl max-w-2xl">
            Chúng tôi luôn sẵn lòng lắng nghe và giải đáp mọi thắc mắc của bạn.
          </p>
        </div>
      </div>

 
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
            <h2 className="text-3xl font-semibold text-gray-800 mb-2">Gửi Lời Nhắn</h2>
            <p className="text-gray-600 mb-8">
              Điền thông tin vào biểu mẫu dưới đây, chúng tôi sẽ phản hồi trong thời gian sớm nhất.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và Tên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="focus:ring-red-500 focus:border-red-500 block w-full px-3 py-3 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                </div>

     
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="focus:ring-red-500 focus:border-red-500 block w-full px-3 py-3 sm:text-sm border-gray-300 rounded-md"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Số Điện Thoại
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="focus:ring-red-500 focus:border-red-500 block w-full px-3 py-3 sm:text-sm border-gray-300 rounded-md"
                      placeholder="090 xxx xxxx"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Công Ty (nếu có)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      name="company"
                      id="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="focus:ring-red-500 focus:border-red-500 block w-full px-3 py-3 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Tên công ty của bạn"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Lời Nhắn <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <textarea
                    name="message"
                    id="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="focus:ring-red-500 focus:border-red-500 block w-full px-3 py-3 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Nội dung bạn muốn trao đổi..."
                  ></textarea>
                </div>
              </div>

              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{submitMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{submitMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white transition-colors duration-150 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi Tin Nhắn'
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl space-y-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Thông Tin Liên Hệ</h3>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span>1073/23 Cách Mạng Tháng 8, Phường 7, Quận Tân Bình, TP. Hồ Chí Minh</span>
                </li>
                <li className="flex items-center">
                  <a href="tel:0909123456" className="hover:text-red-600">0909 123 456</a>
                </li>
                <li className="flex items-center">
                  {/* Icon removed */}
                  <a href="mailto:contact@vclock.vn" className="hover:text-red-600">contact@vclock.vn</a>
                </li>
                <li className="flex items-start">
                  {/* Icon removed */}
                  <span>
                    <strong>Giờ làm việc:</strong><br />
                    Thứ 2 - Thứ 7: 8:00 - 20:00<br />
                    Chủ Nhật: 9:00 - 17:00
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Tìm Chúng Tôi Trên Bản Đồ</h3>
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-md">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.486014709549!2d106.65587907589737!3d10.77337425923137!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752edb7e9a7b2b%3A0x6e7e1b7e736d919!2zMTA3My8yMyDEkC4gQ8O0bmcgTmfhu41jIFRow6FpLCBQaMaw4budbmcgNywgUXXhuq1uIFTDom4gQsOsbmgsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVMOibiBCw6xuaCwgSOG7kyBDaMOtbmggTWluaA!5e0!3m2!1svi!2s!4v1717490000000!5m2!1svi!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Vị trí VClock trên Google Map"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}