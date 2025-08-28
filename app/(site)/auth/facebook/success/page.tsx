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
  
      fetch(`http://localhost:3000/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((user) => {
          localStorage.setItem("user", JSON.stringify(user));
          setUser(user);
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'user',
            newValue: JSON.stringify(user)
          }));
          const preventRedirect = localStorage.getItem('auth_prevent_redirect');
          const returnUrl = localStorage.getItem('auth_return_url');
          
          if (preventRedirect === 'true' && returnUrl) {
            localStorage.removeItem('auth_prevent_redirect');
            localStorage.removeItem('auth_return_url');
            window.dispatchEvent(new CustomEvent('auth_success', {
              detail: { user, returnUrl }
            }));
            router.push(returnUrl);
          } else {
            router.push("/");
          }
        })
        .catch((error) => {
          console.error("Lỗi tải thông tin người dùng:", error);
          router.push("/login");
        });
    } else {
      router.push("/login");
    }
  }, [router, setUser]);

  return <div>Đang đăng nhập bằng Facebook...</div>;
} 