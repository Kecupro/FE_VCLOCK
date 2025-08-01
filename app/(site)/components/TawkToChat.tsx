"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    Tawk_API?: Record<string, unknown>;
    Tawk_LoadStart?: Date;
  }
}

const TawkToChat = () => {
  useEffect(() => {
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = 'https://embed.tawk.to/6839600f9c6f9719085f3de7/1iva4l2uk';  // ← Dán ID chat của bạn vào đây
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    document.body.appendChild(s1);
  }, []);

  return null;
};

export default TawkToChat;
