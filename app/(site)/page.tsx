"use client";

import Banner from "./components/Banner";
import Categories from "./components/Categories";
import ProductNew from "./components/ProductNew";
import ServiceFeatures from "./components/ServiceFeatures";
import News from "./components/News";
import Feedback from "./components/Feedback";
import ProductSale from "./components/ProductSale";
import dynamic from "next/dynamic";
import OptimizedImage from "./components/OptimizedImage";
const VoucherBoxList = dynamic(() => import("./components/VoucherBoxList"), { ssr: false });
const AdPopup = dynamic(() => import("./components/AdPopup"), { ssr: false });

export default function Home() {
  return (
    <div className="">
      <AdPopup />
      <Banner />

      <ServiceFeatures />
      <Categories />
      <VoucherBoxList />
    <ProductNew/>
     <OptimizedImage
        src="/images/ads/qc4.png"
        alt="Hero Image"
        width={500}
        height={500}  
        className="w-full h-auto"
      />
    <ProductSale />
     <OptimizedImage
        src="/images/ads/qc2.png"
        alt="Hero Image"
        width={500}
        height={500}  
        className="w-full h-auto"
      />
      <News />
       <OptimizedImage
        src="/images/ads/qc3.png"
        alt="Hero Image"
        width={500}
        height={500}  
        className="w-full h-auto"
      />
      <Feedback />
    </div>
  );
}
