import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  preventRedirect?: boolean;
  onLoginSuccess?: () => void;
  forceOpen?: boolean;
  onAuthRequired?: () => void;
}

const AuthModal = ({ isOpen, onClose, preventRedirect = false, onLoginSuccess, forceOpen, onAuthRequired }: AuthModalProps) => {
  const { setUser } = useAuth();
  const [authView, setAuthView] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setError("");
  };
  
  const switchToRegister = () => {
    resetForm();
    setAuthView("register");
  };

  const switchToLogin = () => {
    resetForm();
    setAuthView("login");
  };

  const switchToForgotPassword = () => {
    resetForm();
    setAuthView("forgot-password");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim()) {
        setError("Tên tài khoản không được để trống");
        toast.error("Tên tài khoản không được để trống");
        return;
    }
    if (!password) {
        setError("Mật khẩu không được để trống");
        toast.error("Mật khẩu không được để trống");
        return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
                username: username,
                password: password,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user); 
        onClose();
        setError("");
        toast.success('Đăng nhập thành công!');
        
        if (onLoginSuccess) {
          onLoginSuccess();
        }
        
        if (!preventRedirect) {
          router.refresh();
          if (data.user.role === '1' || data.user.role === '2') {
            router.push('/admin');
          } else {
            router.push('/');
          }
        }
      } else {
            const errorMsg = data.message || 'Đăng nhập thất bại';
            setError(errorMsg);
            toast.error(errorMsg);
      }
    } catch (error) {
        const errorMsg = 'Đã có lỗi xảy ra';
        setError(errorMsg);
        toast.error(errorMsg);
              console.error('Lỗi đăng nhập:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username.trim()) {
        setError("Tên tài khoản không được để trống");
        toast.error("Tên tài khoản không được để trống");
        return;
    }
    if (username.trim().length < 3) {
        setError("Tên tài khoản phải có ít nhất 3 ký tự");
        toast.error("Tên tài khoản phải có ít nhất 3 ký tự");
        return;
    }
    if (username.trim().length > 20) {
        setError("Tên tài khoản không được quá 20 ký tự");
        toast.error("Tên tài khoản không được quá 20 ký tự");
        return;
    }
    if (!/^[a-zA-Z0-9._]+$/.test(username.trim())) {
        setError("Tên tài khoản chỉ được chứa chữ, số, dấu chấm và gạch dưới");
        toast.error("Tên tài khoản chỉ được chứa chữ, số, dấu chấm và gạch dưới");
        return;
    }
    
    if (!email.trim()) {
        setError("Email không được để trống");
        toast.error("Email không được để trống");
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        setError("Email không hợp lệ");
        toast.error("Email không hợp lệ");
        return;
    }
    
    if (!password) {
        setError("Mật khẩu không được để trống");
        toast.error("Mật khẩu không được để trống");
        return;
    }
    if (password.length < 6) {
        setError("Mật khẩu phải có ít nhất 6 ký tự");
        toast.error("Mật khẩu phải có ít nhất 6 ký tự");
        return;
    }
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
        setError("Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số");
        toast.error("Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số");
        return;
    }

    if (!confirmPassword) {
        setError("Vui lòng xác nhận mật khẩu");
        toast.error("Vui lòng xác nhận mật khẩu");
        return;
    }
    if (password !== confirmPassword) {
        setError("Mật khẩu không khớp");
        toast.error("Mật khẩu không khớp");
        return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
                email: email
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message || 'Đăng ký thành công, vui lòng kiểm tra email!');
        const registeredEmail = email;
        resetForm(); 
        setEmail(registeredEmail);
        setAuthView("verify");
      } else {
            const errorMsg = data.message || 'Đăng ký thất bại';
            setError(errorMsg);
            toast.error(errorMsg);
      }
    } catch (error) {
        const errorMsg = 'Đã có lỗi xảy ra';
        setError(errorMsg);
        toast.error(errorMsg);
              console.error('Lỗi đăng ký:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.trim().length !== 6) {
      setError("Mã OTP phải có 6 chữ số.");
      toast.error("Mã OTP phải có 6 chữ số.");
      return;
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Mã OTP chỉ được chứa số.");
      toast.error("Mã OTP chỉ được chứa số.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Xác thực thành công! Vui lòng đăng nhập.');
        const loginUsername = username;
        const loginEmail = email;
        resetForm();
        setUsername(loginUsername || loginEmail);
        setAuthView("login");
      } else {
        const errorMsg = data.message || 'Xác thực thất bại.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      const errorMsg = 'Đã có lỗi xảy ra khi xác thực OTP.';
      setError(errorMsg);
      toast.error(errorMsg);
              console.error('Lỗi xác thực OTP:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Vui lòng nhập email của bạn.");
      toast.error("Vui lòng nhập email của bạn.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Email không hợp lệ");
      toast.error("Email không hợp lệ");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setAuthView("reset-password");
      } else {
        setError(data.message || 'Yêu cầu thất bại.');
        toast.error(data.message || 'Yêu cầu thất bại.');
      }
    } catch {
      setError('Đã có lỗi xảy ra.');
      toast.error('Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!otp || otp.length !== 6) {
      setError("Mã OTP phải có 6 chữ số.");
      toast.error("Mã OTP phải có 6 chữ số.");
      return;
    }
    
    if (!password) {
      setError("Mật khẩu không được để trống");
      toast.error("Mật khẩu không được để trống");
      return;
    }
    
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      setError("Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số");
      toast.error("Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số");
      return;
    }
    
    if (!confirmPassword) {
      setError("Vui lòng xác nhận mật khẩu");
      toast.error("Vui lòng xác nhận mật khẩu");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Mật khẩu mới không khớp.");
      toast.error("Mật khẩu mới không khớp.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        resetForm();
        setAuthView("login");
      } else {
        setError(data.message || 'Đặt lại mật khẩu thất bại.');
        toast.error(data.message || 'Đặt lại mật khẩu thất bại.');
      }
    } catch {
      setError('Đã có lỗi xảy ra.');
      toast.error('Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen && !forceOpen) return null;

  // Nếu forceOpen = true, gọi callback onAuthRequired
  if (forceOpen && onAuthRequired) {
    onAuthRequired();
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 transition-opacity duration-300"
      style={{ willChange: "opacity" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="relative bg-white rounded-xl shadow-lg p-7 w-[95vw] max-w-[400px] border border-gray-200 transition-all duration-300 transform opacity-100 scale-100"
        onClick={(e) => e.stopPropagation()}
        style={{ willChange: 'transform, opacity' }}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-600 text-xl"
          onClick={onClose}
          type="button"
          aria-label="Đóng"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        {authView === 'login' && (
          <>
            <h4 className="font-bold mb-2 text-gray-800 text-xl text-center">
              ĐĂNG NHẬP
            </h4>
            <p className="text-gray-500 text-sm text-center mb-4">
              Đăng nhập để mua hàng và theo dõi đơn của bạn
            </p>
            <form onSubmit={handleLogin}>
              <div className="relative mb-3">
                <input
                  className="text-black border border-gray-300 p-3 pr-10 w-full rounded focus:ring-2 focus:ring-red-400 outline-none"
                  placeholder="Tên tài khoản hoặc Email"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="fa-solid fa-user"></i>
                </span>
              </div>
              <div className="relative mb-3">
                <input
                  className="text-black border border-gray-300 p-3 pr-10 w-full rounded focus:ring-2 focus:ring-red-400 outline-none"
                  placeholder="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center text-sm text-gray-600 cursor-pointer select-none">
                  <input type="checkbox" className="mr-2 accent-red-600" />
                  Ghi nhớ
                </label>
                <button
                  type="button"
                  className="text-blue-600 hover:underline bg-transparent border-none p-0 text-sm"
                  onClick={switchToForgotPassword}
                >
                  Quên mật khẩu?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold mb-3 transition text-base ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
              {error && (
                <div className="text-red-500 text-sm text-center mt-2">
                  {error}
                </div>
              )}
            </form>
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-4 text-xs text-gray-400">hoặc đăng nhập với</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
                  onClick={() => {
                    if (preventRedirect) {
                      localStorage.setItem('auth_prevent_redirect', 'true');
                      localStorage.setItem('auth_return_url', window.location.pathname);
                    }
                    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
                  }}
                >
                  <i className="fa-brands fa-google text-red-600"></i>
                  <span className="text-gray-700 font-medium">Google</span>
                </button>
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
                  onClick={() => {
                    if (preventRedirect) {
                      localStorage.setItem('auth_prevent_redirect', 'true');
                      localStorage.setItem('auth_return_url', window.location.pathname);
                    }
                    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`;
                  }}
                >
                  <i className="fa-brands fa-facebook-f text-blue-600"></i>
                  <span className="text-gray-700 font-medium">Facebook</span>
                </button>
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm">Bạn chưa có tài khoản?</p>
                <button
                  type="button"
                  className="text-red-600 hover:underline bg-transparent border-none p-0 font-semibold"
                  onClick={switchToRegister}
                >
                  Đăng ký ngay
                </button>
              </div>
            </>
        )}
        {authView === 'register' && (
          <>
            <h4 className="font-bold mb-2 text-gray-800 text-xl text-center">
              ĐĂNG KÝ TÀI KHOẢN
            </h4>
            <p className="text-gray-500 text-sm text-center mb-4">
              Chào mừng bạn, vui lòng điền thông tin để đăng ký
            </p>
            <form onSubmit={handleRegister}>
              <div className="relative mb-3">
                <input
                  className="text-black border border-gray-300 p-3 pr-10 w-full rounded focus:ring-2 focus:ring-red-400 outline-none"
                  placeholder="Tên tài khoản"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="fa-solid fa-user"></i>
                </span>
              </div>
              <div className="relative mb-3">
                <input
                  className="text-black border border-gray-300 p-3 pr-10 w-full rounded focus:ring-2 focus:ring-red-400 outline-none"
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="fa-solid fa-envelope"></i>
                </span>
              </div>
              <div className="relative mb-3">
                <input
                  className="text-black border border-gray-300 p-3 pr-10 w-full rounded focus:ring-2 focus:ring-red-400 outline-none"
                  placeholder="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                 <span 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </span>
              </div>
              <div className="relative mb-3">
                <input
                  className="text-black border border-gray-300 p-3 pr-10 w-full rounded focus:ring-2 focus:ring-red-400 outline-none"
                  placeholder="Nhập lại mật khẩu"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                 <span 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </span>
              </div>
              
              {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold mb-3 transition text-base ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Đang xử lý...' : 'ĐĂNG KÝ'}
              </button>
               <p className="text-center text-sm text-gray-600 mt-4">
                Bạn đã có tài khoản?{" "}
                <button
                  type="button"
                  className="text-red-600 hover:underline font-semibold"
                  onClick={switchToLogin}
                >
                  Đăng nhập
                </button>
              </p>
            </form>
          </>
        )}
        {authView === 'verify' && (
          <>
            <h4 className="font-bold mb-2 text-gray-800 text-xl text-center">
              XÁC THỰC TÀI KHOẢN
            </h4>
            <p className="text-gray-500 text-sm text-center mb-4">
              Một mã OTP đã được gửi đến <br/> <span className="font-semibold text-gray-700">{email}</span>.
            </p>
            <form onSubmit={handleVerifyOtp}>
              <div className="relative mb-3">
                <input
                  className="text-black border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-red-400 outline-none text-center tracking-[1em]"
                  placeholder="_ _ _ _ _ _"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>
              
              {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold mb-3 transition text-base ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Đang kiểm tra...' : 'XÁC NHẬN'}
              </button>
              <p className="text-center text-sm text-gray-600 mt-4">
                Không nhận được mã?{" "}
                <button
                  type="button"
                  className="text-red-600 hover:underline font-semibold opacity-50 cursor-not-allowed"
                >
                  Gửi lại
                </button>
              </p>
            </form>
          </>
        )}
        {authView === 'forgot-password' && (
          <>
            <h4 className="font-bold mb-2 text-gray-800 text-xl text-center">
              QUÊN MẬT KHẨU
            </h4>
            <p className="text-gray-500 text-sm text-center mb-4">
              Nhập email của bạn để nhận mã đặt lại mật khẩu.
            </p>
            <form onSubmit={handleRequestPasswordReset}>
              <div className="relative mb-3">
                <input
                  className="text-black border border-gray-300 p-3 pr-10 w-full rounded focus:ring-2 focus:ring-red-400 outline-none"
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <i className="fa-solid fa-envelope"></i>
                </span>
              </div>
              
              {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold mb-3 transition text-base ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Đang gửi...' : 'GỬI YÊU CẦU'}
              </button>
              <p className="text-center text-sm text-gray-600 mt-4">
                <button
                  type="button"
                  className="text-blue-600 hover:underline font-semibold"
                  onClick={switchToLogin}
                >
                  Quay lại Đăng nhập
                </button>
              </p>
            </form>
          </>
        )}
        {authView === 'reset-password' && (
          <>
            <h4 className="font-bold mb-2 text-gray-800 text-xl text-center">
              ĐẶT LẠI MẬT KHẨU
            </h4>
            <p className="text-gray-500 text-sm text-center mb-4">
              Mã OTP đã được gửi đến <span className="font-semibold">{email}</span>.
            </p>
            <form onSubmit={handleResetPassword}>
              <div className="relative mb-3">
                <input
                  className="text-black border border-gray-300 p-3 w-full rounded focus:ring-2 focus:ring-red-400 outline-none text-center tracking-[0.5em]"
                  placeholder="Nhập mã OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>
              <div className="relative mb-3">
                <input
                  className="text-black border border-gray-300 p-3 pr-10 w-full rounded focus:ring-2 focus:ring-red-400 outline-none"
                  placeholder="Mật khẩu mới"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </span>
              </div>
              <div className="relative mb-3">
                <input
                  className="text-black border border-gray-300 p-3 pr-10 w-full rounded focus:ring-2 focus:ring-red-400 outline-none"
                  placeholder="Xác nhận mật khẩu mới"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <span 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <i className={`fa-solid ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </span>
              </div>
              
              {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold mb-3 transition text-base ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Đang lưu...' : 'ĐẶT LẠI MẬT KHẨU'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal; 