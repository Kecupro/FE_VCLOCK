"use client";

import { useEffect, useState } from "react";
import React from "react";

export default function Preloader(): React.ReactElement | null {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return null;

  return (
    <div className="preloader-wrapper">
      <div className="preloader-logo">
        <div className="circle"></div>
        <div className="dot"></div>
      </div>

      <style jsx>{`
        .preloader-wrapper {
          position: fixed;
          inset: 0;
          background: #121212; /* Nền đen sang trọng */
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          z-index: 9999;
        }

        .preloader-logo {
          position: relative;
          width: 120px;
          height: 120px;
        }

        .circle {
          width: 100%;
          height: 100%;
          border: 8px solid rgba(255, 255, 255, 0.1);
          border-top: 8px solid #FF3D00; /* Đỏ nổi bật */
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          background: #ffffff;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: bounce 1s ease-in-out infinite;
          box-shadow: 0 0 10px #FF3D00, 0 0 20px #FF3D00;
        }
          
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes bounce {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -60%) scale(1.3); }
        }

        @keyframes fadeIn {
          0% { opacity: 0.6; transform: translateY(5px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
