"use client";
import { IStats, IProduct } from "../../cautrucdata";
import { useState, useEffect, useRef   } from "react";
// import { usePathname } from "next/navigation";
import SPLienQuan from "../SPLienQuan";
import HienBinhLuanSP from "../HienBinhLuanSP";
import StarRating from "../../components/StarRating";
import Image from "next/image";
import BuyNow from "../../components/BuyNow";
import AddToCart from "../../components/AddToCart";
import { useParams } from 'next/navigation';


interface IRawImage { is_main: boolean; image: string , alt?: string; }

export default function ProductDetail() {
  const [product, setProduct] = useState<IProduct | null>(null);
  const [currentImg, setCurrentImg] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [tab, setTab] = useState<"desc" | "review">("desc");
  const [stats, setStats] = useState<IStats | null>(null);

  const refetchBinhLuan = useRef<() => void>(() => {});

  
  const params = useParams();  // slug là toàn bộ chuỗi ví dụ: "baume-and-mercier-hampton-10709-blue-watch-35-x-22mm-6833ff0acc1ed305e8513aae"
  const slug = params?.id as string;
  const id = typeof slug === "string" ? slug.split('-').slice(-1)[0] : undefined;  // lấy ID từ cuối slug

  // Lấy Stats
  useEffect(() => {
    if (!id) return;
  
    fetch(`http://localhost:3000/api/reviews/stats/${id}`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("Lỗi fetch stats:", err));
  }, [id]);

  // // Lấy id từ URL (ví dụ URL: /product/abc-def)
  // const pathname = usePathname(); 
  // // Giả sử id luôn là phần cuối của path
  // const id = pathname?.split("/").pop();

  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      try {
        const res = await fetch(`http://localhost:3000/api/product/${id}`);
        if (!res.ok) throw new Error("Lấy sản phẩm thất bại");
        const data = await res.json(); 

          /* ---------- NORMALIZE ---------- */
        // 1. Sắp xếp: ảnh chính lên đầu
        const imgObjects = [...data.images].sort(
          (a: IRawImage, b: IRawImage) => (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0)
        ).map((i: IRawImage) => ({
          image: `/images/product/${i.image}`,
          alt: i.alt || data.name
        }));
        

        // // 2. Chuyển thành mảng string, kèm đường dẫn /upload/product/
        // const imgUrls: string[] = sorted.map(
        //   (i: IRawImage) => `/upload/product/${i.image}`
        // );

        // 3. Trả về object mới, trong đó images là string[]
        const cleanProduct: IProduct = {
          ...data,
          images: imgObjects,
          brand_id: data.brand._id // vì bạn đang dùng brand_id là string để map
        };
        

        setProduct(cleanProduct);
        setCurrentImg(0);
      } catch (error) {
        console.error(error);
      }
    }

    fetchProduct();
  }, [id]);


  if (!product) return <div>Đang tải sản phẩm...</div>;

  const handlePrev = () => {
    setCurrentImg((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImg((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <main className="w-full mx-auto py-10 px-[10%] pt-40">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="relative">
          <Image
            src={product.images[currentImg].image}
            alt={product.images[currentImg].alt || product.name}
            className="w-full h-116 object-cover rounded-xl cursor-zoom-in shadow-md"
            width={800}
            height={464}
            onClick={() => setShowZoom(true)}
            style={{ objectFit: "cover", borderRadius: "0.75rem", cursor: "zoom-in" }}
            priority
          />
          {showZoom && (
            <div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 "
              onClick={() => setShowZoom(false)}
            >
              <Image
                src={product.images[currentImg].image}
                alt={product.images[currentImg].alt || product.name}
                className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl cursor-zoom-out "
                width={800}
                height={464}
                onClick={() => setShowZoom(false)}
                style={{ objectFit: "contain", borderRadius: "0.75rem", cursor: "zoom-out" }}
                priority
              />
            </div>
          )}
          <button
            onClick={handlePrev}
            className="absolute top-60 left-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black z-10"
            aria-label="Ảnh trước"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button
            onClick={handleNext}
            className="absolute top-60 right-2 -translate-y-1/2 bg-black/40 text-white rounded-full p-2 hover:bg-black z-10"
            aria-label="Ảnh sau"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
          <div className="grid grid-cols-4 gap-0.5 mt-4">
            {product.images.map((img, idx) => (
              <div
                key={idx}
                className={`overflow-hidden rounded cursor-pointer flex items-center justify-center h-24 transition
                  ${currentImg === idx ? "border-red-600" : "border-transparent"}
                  hover:border-red-400`}
                onClick={() => setCurrentImg(idx)}
              >
                <Image
                  src={img.image}
                  alt={img.alt || `Ảnh phụ ${idx + 1}`}
                  className={`h-full w-full object-contain mx-auto transition-transform duration-200 hover:scale-105 border-2 border-gray-200 shadow-md rounded-xl
                    ${currentImg === idx ? "opacity-100" : "opacity-50"}
                  `}
                  width={120}
                  height={96}
                  style={{ objectFit: "contain" }}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <div className="mb-2 flex items-center gap-3">
									

            {product.sale_price > 0 && (
						<>
              <span className="text-red-600 text-2xl font-semibold">
                {product.sale_price.toLocaleString("vi-VN")}đ
              </span>
              <span className="text-gray-400 line-through text-lg">
                {product.price.toLocaleString("vi-VN")}đ
              </span>
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              {Math.round(((product.price - product.sale_price) / product.price) * 100)}%
              </span>
            </>
						)}

            {product.sale_price === 0 && (
              <span className="text-red-600 text-2xl font-semibold">
                {product.price.toLocaleString("vi-VN")}đ
              </span>
            )}
          </div>
          <p className="mb-2 text-gray-700 font-medium">{(product.brand_id?.name || product.brand?.name) ?? "Không rõ thương hiệu"}</p>
          <div className="mb-6">
            {/* <h2 className="font-semibold mb-2 text-base text-black">Bộ sản phẩm gồm:</h2> */}
            <div className="flex gap-4 mb-4">
              <AddToCart sp={product} />
              <BuyNow sp={product} />
            </div>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1 w-100">
              {/* {product.included.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))} */}
            </ul>
          </div>
        </div>
      </div>
      <div className="w-full mt-10">
        <h2 className="font-semibold mb-3 text-base text-black text-center">Thông số sản phẩm</h2>
        <div className="w-full bg-gray-100 rounded-xl px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 text-sm">
            <div className="flex py-2 border-b border-gray-200">
              <span className="w-40 text-gray-500">Bộ sưu tập</span>
              <span className="font-medium">PORTOFINO</span>
            </div>
            <div className="flex py-2 border-b border-gray-200">
              <span className="w-40 text-gray-500">Mã sản phẩm</span>
              <span className="font-medium">{product._id}</span>
            </div>
            <div className="flex py-2 border-b border-gray-200">
              <span className="w-40 text-gray-500">Giới tính</span>
              <span className="font-medium">{product.sex}</span>
            </div>
            <div className="flex py-2 border-b border-gray-200">
              <span className="w-40 text-gray-500">Loại máy</span>
              <span className="font-medium">{product.machine_type}</span>
            </div>
            <div className="flex py-2 border-b border-gray-200">
              <span className="w-40 text-gray-500">Đường kính</span>
              <span className="font-medium">{product.case_diameter}mm</span>
            </div>
            <div className="flex py-2 border-b border-gray-200">
              <span className="w-40 text-gray-500">Màu sắc</span>
              <span className="font-medium">{product.color}</span>
            </div>
            <div className="flex py-2 border-b border-gray-200">
              <span className="w-40 text-gray-500">Phong cách</span>
              <span className="font-medium">{product.style}</span>
            </div>
            <div className="flex py-2 border-b border-gray-200">
              <span className="w-40 text-gray-500">Chất liệu dây</span>
              <span className="font-medium">{product.strap_material}</span>
            </div>
            <div className="flex py-2 border-b border-gray-200">
              <span className="w-40 text-gray-500">Tính năng</span>
              <span className="font-medium">{product.features}</span>
            </div>
            <div className="flex py-2">
              <span className="w-40 text-gray-500">Độ chịu nước</span>
              <span className="font-medium">{product.water_resistance} ATM</span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full mt-10">
        <div className="flex justify-center gap-2 mb-6">
          <button
            className={`px-6 py-2 rounded-t font-semibold transition border-b-2 ${
              tab === "desc"
                ? "border-black text-black bg-white"
                : "border-transparent text-gray-500 bg-gray-100 hover:text-black"
            }`}
            onClick={() => setTab("desc")}
          >
            Mô tả sản phẩm
          </button>
          <button
            className={`px-6 py-2 rounded-t font-semibold transition border-b-2 ${
              tab === "review"
                ? "border-black text-black bg-white"
                : "border-transparent text-gray-500 bg-gray-100 hover:text-black"
            }`}
            onClick={() => setTab("review")}
          >
            Đánh giá
          </button>
        </div>
        <div className="w-full bg-white border border-gray-300  px-6 py-8">
          {tab === "desc" && (
            <div>
              <h3 className="font-bold text-text-lg mb-2">Mô tả sản phẩm</h3>
              <p className="text-gray-700 text-base mb-4">
                {product.description}
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                <li>Thiết kế mặt số tối giản, sang trọng, phù hợp cả nam và nữ.</li>
                <li>Dây da thật mềm mại, màu sắc trẻ trung, dễ phối đồ.</li>
                <li>Máy Thụy Sĩ Automatic, vận hành bền bỉ, chính xác.</li>
                <li>Có chống nước, thoải mái rửa tay, đi mưa nhỏ.</li>
                <li>Tính năng Moon phase độc đáo, tạo điểm nhấn cho cổ tay.</li>
                <li>Bảo hành chính hãng 1-2 năm, hỗ trợ trọn đời tại GWatch.</li>
              </ul>
              <p className="text-gray-700 text-base mb-2">
                Sản phẩm phù hợp cho mọi dịp: đi làm, dự tiệc, gặp gỡ bạn bè hoặc làm quà tặng ý nghĩa cho người thân, đối tác.
              </p>
              <p className="text-gray-700 text-base">
                <b>Lưu ý:</b> Hình ảnh sản phẩm có thể chênh lệch nhẹ do ánh sáng và màn hình hiển thị. Vui lòng liên hệ tư vấn để chọn Sản phẩm phù hợp nhất với bạn!
              </p>
            </div>
          )}
          {tab === "review" && (
            <div>
              <div className="flex items-center justify-center gap-2 mb-8 w-full">
                <StarRating rating={stats?.averageRating || 0} className="text-red-500 text-3xl" />
                <span className="ml-2 font-semibold text-lg text-gray-800">{stats?.averageRating}</span>
                <span className="text-gray-500 text-sm">({stats?.totalReviews} đánh giá)</span>
              </div>

              {/* Form bình luận */}
              {/* <form className="w-full flex flex-col gap-3 mb-10">
                <label className="font-medium text-sm w-full">Đánh giá của bạn</label>
                <div className="flex gap-1 text-red-500 text-xl w-full">
                  <i className="fa-regular fa-star cursor-pointer hover:text-red-400"></i>
                  <i className="fa-regular fa-star cursor-pointer hover:text-red-400"></i>
                  <i className="fa-regular fa-star cursor-pointer hover:text-red-400"></i>
                  <i className="fa-regular fa-star cursor-pointer hover:text-red-400"></i>
                  <i className="fa-regular fa-star cursor-pointer hover:text-red-400"></i>
                </div>
                <textarea
                  className="border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-red-200 w-full"
                  rows={3}
                  placeholder="Nhận xét của bạn..."
                />
                <button
                  type="submit"
                  className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-red-700 transition w-full"
                >
                  Gửi đánh giá
                </button>
              </form> */}
              {/* <ReviewForm productId={product._id} onSuccess={() => { refetchBinhLuan.current(); // gọi lại fetch khi bình luận mới
              }}
              /> */}
              {/* Hiện bình luận */}
              {/* <div className="w-full space-y-8">
                <div className="flex gap-4 items-start w-full">
                      <img
                    src="/avatar1.jpg"
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-1 w-full">
                      <span className="font-semibold">Kế Cư</span>
                      <span className="text-red-500 text-sm flex gap-0.5">
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-regular fa-star"></i>
                      </span>
                      <span className="text-gray-400 text-xs ml-2">2 ngày trước</span>
                    </div>
                    <div className="text-gray-700 text-sm w-full">
                      Sản phẩm đẹp, giao hàng nhanh, đóng gói cẩn thận.
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 items-start w-full">
                <img
  src="/avatar2.jpg"
  alt="avatar"
  className="w-10 h-10 rounded-full object-cover"
/>
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-1 w-full">
                      <span className="font-semibold">Lan Hương</span>
                      <span className="text-red-500 text-sm flex gap-0.5">
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-solid fa-star"></i>
                        <i className="fa-regular fa-star"></i>
                        <i className="fa-regular fa-star"></i>
                      </span>
                      <span className="text-gray-400 text-xs ml-2">5 ngày trước</span>
                    </div>
                    <div className="text-gray-700 text-sm w-full">
                      Đồng hồ đẹp, đúng mô tả, sẽ ủng hộ lần sau.
                    </div>
                  </div>
                </div>
              </div> */}

              <HienBinhLuanSP productId={product._id} onRefetchReady={(fn) => { refetchBinhLuan.current = fn; }} />
            </div>
          )}
        </div>
      </div>
      <div className="w-full mt-10">
        <SPLienQuan id={product._id} />
      </div>
    </main>
  );
}