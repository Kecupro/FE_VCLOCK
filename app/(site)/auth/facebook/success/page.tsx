"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

export default function FacebookSuccess() {
  const router = useRouter();
  const { setUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
  
      fetch("https://bevclock-production.up.railway.app/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((user) => {
          // Chỉ set token, AuthContext sẽ tự động xử lý user
          setUser(user);
          router.push("/"); 
        })
        .catch((error) => {
          console.error("Error fetching user profile:", error);
          router.push("/login");
        });
    } else {
      router.push("/login");
    }
  }, [router, setUser]);

  return <div>Đang đăng nhập bằng Facebook...</div>;
} 