import OptimizedImage from "./OptimizedImage";

const features = [
    {
        icon: "images/mixed/24-hours-phone-service.png",
        title: "Phục vụ 24/7",
        desc: "Hỗ trợ khách hàng mọi lúc, mọi nơi.",
    },
    {
        icon: "images/mixed/logistics-delivery-truck-in-movement.png",
        title: "Giao hàng tận nơi",
        desc: "Nhanh chóng, an toàn, tiện lợi.",
    },
    {
        icon: "images/mixed/gift.png",
        title: "Miễn phí vận chuyển",
        desc: "Cam kết chất lượng và bảo hành chính hãng.",
    },
];

export default function ServiceFeatures() {
    return (
        <div className="w-full bg-white py-8 mt-10">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                {features.map((f, idx) => (
                    <div key={idx} className="w-full md:w-1/3 h-full flex flex-col items-center text-center px-6 py-4 shadow rounded bg-gray-50 hover:bg-gray-100 transition">
                        <OptimizedImage 
                            src={f.icon} 
                            alt={f.title} 
                            width={56}
                            height={56}
                            className="w-14 h-14 mb-3" 
                        />
                        <h4 className="font-bold text-lg mb-1">{f.title}</h4>
                        <p className="text-gray-600 text-sm">{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}