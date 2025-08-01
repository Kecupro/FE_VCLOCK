"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GoogleSuccess() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
  
      fetch("http://localhost:3000/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((user) => {
          localStorage.setItem("user", JSON.stringify(user));
          router.push("/"); 
        });
    } else {
      router.push("/login");
    }
  }, [router]);

  return <div>Đang đăng nhập bằng Google...</div>;
}
