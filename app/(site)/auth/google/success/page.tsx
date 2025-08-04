"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

export default function GoogleSuccess() {
  const router = useRouter();
  const { setUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
  
              fetch("https://bevclock-production.up.railway.app/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((user) => {
          localStorage.setItem("user", JSON.stringify(user));
          // Cập nhật user state ngay lập tức
          setUser(user);
          // Trigger storage event để các component khác cập nhật
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'user',
            newValue: JSON.stringify(user)
          }));
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

  return <div>Đang đăng nhập bằng Google...</div>;
}
