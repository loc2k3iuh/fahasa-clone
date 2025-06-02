import React, { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { FaBookOpen, FaFacebook } from "react-icons/fa";
import { useUserService } from "../services/useUserService";
import { useTokenService } from "../services/useTokenService";
import { OAuthConfig } from "../config/configuration";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, FacebookAuthProvider } from "firebase/auth";
import { auth, provider } from "../config/firebaseConfig";
import { FacebookUserRequest } from "../types/user";
import { connectWebSocket } from "../socket/connectWebSocket";
import { FaLock, FaUser } from "react-icons/fa6";

interface LoginForm {
  username: string;
  password: string;
}

const LoginPage: React.FC= () => {

  const navigate = useNavigate();

  const {
    login,
    loginTemporarily,
    getUserDetail,
    saveUserResponseToLocalStorage,
  } = useUserService();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const { setAccessToken, removeToken, getAccessToken } = useTokenService();
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeInput, setActiveInput] = useState<string | null>(null);

  const handleClickGoogle = () => {
    const callbackUrl = OAuthConfig.redirectUri;
    const authUrl = OAuthConfig.authUri;
    const googleClientId = OAuthConfig.clientId;

    const targetUrl = `${authUrl}?redirect_uri=${encodeURIComponent(
      callbackUrl
    )}&response_type=code&client_id=${googleClientId}&scope=openid%20email%20profile`;

    console.log(targetUrl);

    window.location.href = targetUrl;
  };

  const handleClickFacebook = () => {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        try {
          // This gives you a Facebook Access Token
          const credential = FacebookAuthProvider.credentialFromResult(result);
          const accessToken = credential?.accessToken;
          
          // Get user info
          const user = result.user;
          const fbUser = result.user.providerData[0];
          
          // Extract required information for backend
          const facebookUserData: FacebookUserRequest = {
            name: fbUser.displayName || user.displayName || "",
            email: fbUser.email || user.email || "",
            picture: fbUser.photoURL || user.photoURL || ""
          };

          // If we need a larger profile picture
          if (accessToken && fbUser.uid) {
            const largerPhotoURL = `https://graph.facebook.com/${fbUser.uid}/picture?height=1000&access_token=${accessToken}`;
            facebookUserData.picture = largerPhotoURL;
          }
          
          // Encode the Facebook data as JSON and then Base64 to use as a code parameter
          const fbDataString = JSON.stringify(facebookUserData);
          const fbCode = btoa(fbDataString);
          
          // Redirect to authenticate page with the Facebook data as code
          window.location.href = `/authenticate?code=${fbCode}&provider=facebook`;
        } catch (error: any) {
          console.error("Facebook login error:", error);
          toast.error(error?.response?.data?.message || "Facebook login failed. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Firebase Facebook auth error:", error);
        toast.error("Facebook login failed. Please try again.");
      });
  };

  useEffect(() => {
    const accessToken = getAccessToken();

    if (accessToken) {
      navigate("/");
    }
  }, [navigate]);

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      
      // Đăng nhập và lấy token - sử dụng login hoặc loginTemporarily tùy theo trạng thái checkbox
      const { accessToken } = staySignedIn
        ? await login(data)
        : await loginTemporarily(data);

      setAccessToken(accessToken); // Lưu token vào state

      // Lấy thông tin người dùng
      const user = await getUserDetail();

      if(user.is_active === false) {
        toast.error("Tài khoản của bạn đã bị vô hiệu hóa!");
        removeToken();
        setIsLoading(false);
        return;
      }

      // Kiểm tra quyền ADMIN
      const isAdmin = user.roles?.some(
        (role: { name: string }) => role.name === "USER"
      );

      if (!isAdmin) {
        toast.error("Không được sử dụng tài khoản admin!");
        removeToken();
        setIsLoading(false);
        return;
      }
      connectWebSocket(user);

      // Lưu thông tin user vào localStorage
      saveUserResponseToLocalStorage(user);

      toast.success("Đăng nhập thành công!");

      window.location.href = "/";
      
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Email hoặc mật khẩu không chính xác!"
      );
      removeToken(); // Xóa token nếu có lỗi
      setIsLoading(false);
      return;
    }
  };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-[#F0F0F0] flex items-center justify-center p-6">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 bg-gradient-to-br from-[#C92127] to-[#a71b20] p-8 flex flex-col justify-between text-white">
            <div>
              <div className="flex items-center mb-8">
                <FaBookOpen className="text-3xl mr-3" />
                <h1 className="text-2xl font-bold">VUVISA</h1>
              </div>
              <h2 className="text-3xl font-bold mb-6">Chào mừng trở lại!</h2>
              <p className="text-white/80 mb-8">
                Đăng nhập để truy cập tài khoản của bạn và khám phá thế giới sách cùng với VUVISA.
                Chúng tôi luôn cập nhật những cuốn sách mới nhất và hấp dẫn nhất.
              </p>
            </div>
            
            {/* SVG illustration */}
            <div className="hidden md:block">
              <svg className="w-full max-w-md mx-auto" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
                <path d="M234,307c14.2-6.3,33.1-10.1,46-18c13.4-8.2,23.5-21.6,33.5-33.5c8.5-10.2,19.1-19.1,24.5-31.5c6-13.8,10.3-28.8,11-44c0.8-16-3.3-32.6-11-46c-8.1-14.1-22.9-24.2-37-31c-15.8-7.5-33.2-8.9-51-10c-19.6-1.2-40.8,0.9-57,12c-15.5,10.6-23,29.3-32,45c-9.6,16.8-17.9,34-21,53c-3.5,21.4-4.8,45.8,7,64c10.9,16.8,30.5,27,51,30C210.8,319.2,219.3,313.6,234,307z" fill="#ffcabd"/>
                <path d="M456,224c0,57.438-65.223,104-145.667,104S258.5,280.5,204.5,232.5s-69.436-128.587-18-163C246.5,25.5,310.333,16.562,456,224z" fill="#ffab91"/>
                <ellipse cx="284" cy="228" rx="65" ry="55" fill="#f9f9f9"/>
                <ellipse cx="284" cy="228" rx="55" ry="45" fill="#ffffff"/>
                <path d="M284,265c-23.71,0-43-16.58-43-37s19.29-37,43-37s43,16.58,43,37S307.71,265,284,265z" fill="#c92127"/>
                <ellipse cx="284" cy="228" rx="33" ry="27" fill="#ffffff"/>
                <circle cx="275" cy="222" r="10" fill="#333333"/>
                <circle cx="293" cy="222" r="10" fill="#333333"/>
                <circle cx="277" cy="219" r="3" fill="#ffffff"/>
                <circle cx="295" cy="219" r="3" fill="#ffffff"/>
              </svg>
            </div>
            
            <div className="hidden md:block mt-8">
              <p className="text-white/80 text-sm">
                © 2024 VUVISA. Mọi quyền được bảo lưu.
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/2 p-8 md:p-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Đăng nhập</h2>
              <p className="text-gray-600 mb-8">Nhập thông tin đăng nhập của bạn để tiếp tục</p>

              {/* Social Login */}
              <div className="flex space-x-4 mb-4">
                <button
                  className="bg-white px-4 py-2 rounded-md flex items-center gap-2 shadow-md cursor-pointer 
                    transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
                  onClick={handleClickGoogle}
                  disabled={isLoading}
                >
                  Đăng nhập bằng Google <FcGoogle size={30} />
                </button>
                <button
                  className="bg-white px-4 py-2 rounded-md flex items-center gap-2 shadow-md cursor-pointer 
                    transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
                  onClick={handleClickFacebook}
                  disabled={isLoading}
                >
                  Đăng nhập bằng Facebook <FaFacebook size={30} color="#1877F2" />
                </button>
              </div>

              <div className="flex items-center my-6">
                <hr className="flex-grow border-gray-200" />
                <span className="px-4 text-gray-500 text-sm">Hoặc đăng nhập với</span>
                <hr className="flex-grow border-gray-200" />
              </div>

              {/* Login Form */}
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="relative">
                  <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${activeInput === 'username' ? 'text-[#C92127]' : ''}`}>
                    <FaUser />
                  </div>
                  <input
                    type="text"
                    placeholder="Tên đăng nhập hoặc email"
                    {...register("username", { required: "Vui lòng nhập tên đăng nhập!" })}
                    className={`w-full py-3 pl-10 pr-4 rounded-lg border ${errors.username ? 'border-red-500' : 'border-gray-300'} ${activeInput === 'username' ? 'border-[#C92127] ring-1 ring-[#C92127]' : ''} focus:outline-none transition-all duration-200`}
                    disabled={isLoading}
                    onFocus={() => setActiveInput('username')}
                    onBlur={() => setActiveInput(null)}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                  )}
                </div>

                <div className="relative">
                  <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${activeInput === 'password' ? 'text-[#C92127]' : ''}`}>
                    <FaLock />
                  </div>
                  <input
                    type="password"
                    placeholder="Mật khẩu"
                    {...register("password", { required: "Vui lòng nhập mật khẩu!" })}
                    className={`w-full py-3 pl-10 pr-4 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} ${activeInput === 'password' ? 'border-[#C92127] ring-1 ring-[#C92127]' : ''} focus:outline-none transition-all duration-200`}
                    disabled={isLoading}
                    onFocus={() => setActiveInput('password')}
                    onBlur={() => setActiveInput(null)}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-[#C92127] rounded border-gray-300 focus:ring-[#C92127]"
                      checked={staySignedIn}
                      onChange={(e) => setStaySignedIn(e.target.checked)}
                      disabled={isLoading}
                    />
                    <span className="ml-2">Duy trì đăng nhập</span>
                  </label>
                  <a href="/user/forgot-password" className={`text-sm text-[#C92127] hover:text-[#a71b20] font-medium transition-colors ${isLoading ? 'pointer-events-none opacity-70' : ''}`}>
                    Quên mật khẩu?
                  </a>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C92127] hover:bg-[#a71b20] text-white py-3 rounded-lg font-semibold transition-all duration-200 relative overflow-hidden transform hover:scale-[1.02] active:scale-[0.98] shadow-md disabled:bg-opacity-70 cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="opacity-0">Đăng nhập</span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                      </div>
                    </>
                  ) : (
                    "Đăng nhập"
                  )}
                </button>
              </form>

              <p className="text-center text-gray-600 mt-8">
                Chưa có tài khoản? 
                <a href="/user/register" className="text-[#C92127] hover:text-[#a71b20] font-medium ml-1 transition-colors">
                  Đăng ký ngay
                </a>
              </p>
              
            </div>
          </div>
        </div>
      </div>
    );
};

export default LoginPage;
