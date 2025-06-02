import React, { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import SideBanner from "../components/SideBanner";
import { useUserService } from "../services/useUserService";
import { useTokenService } from "../services/useTokenService";
import { OAuthConfig } from "../config/configuration";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, FacebookAuthProvider } from "firebase/auth";
import { auth, provider } from "../config/firebaseConfig";
import { FacebookUserRequest } from "../types/user";

interface LoginForm {
  username: string;
  password: string;
}

const LoginAdminPage: React.FC = () => {
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
          window.location.href = `/admin/authenticate?code=${fbCode}&provider=facebook`;
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
      navigate("/admin");
    }
  }, [navigate]);

  const onSubmit = async (data: LoginForm) => {
    try {
      // Đăng nhập và lấy token - sử dụng login hoặc loginTemporarily tùy theo trạng thái checkbox
      const { accessToken } = staySignedIn
        ? await login(data)
        : await loginTemporarily(data);

      setAccessToken(accessToken); // Lưu token vào state

      // Lấy thông tin người dùng
      const user = await getUserDetail();

      // Kiểm tra quyền ADMIN
      const isAdmin = user.roles?.some(
        (role: { name: string }) => role.name === "ADMIN"
      );

      if (!isAdmin) {
        toast.error("Email or password is incorrect!");
        removeToken();
        return;
      }

      // Lưu thông tin user vào localStorage
      saveUserResponseToLocalStorage(user);

      toast.success("Sign in successfully!");

      setTimeout(() => {
        window.location.href = "/admin";
      }, 1000);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Email or password is incorrect!"
      );
      removeToken(); // Xóa token nếu có lỗi
      return;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side - Login Form */}
      <div className="w-1/2 bg-gray-50 flex flex-col justify-center items-center p-8">
        <h2 className="text-4xl font-bold text-black mb-4">Sign in</h2>
        <p className="text-black mb-6">Enter your user name and password</p>

        {/* Social Login */}
        <div className="flex space-x-4 mb-4">
          <button
            className="bg-white px-4 py-2 rounded-md flex items-center gap-2 shadow-md cursor-pointer 
              transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
            onClick={handleClickGoogle}
          >
            Sign in with Google <FcGoogle size={30} />
          </button>
          <button
            className="bg-white px-4 py-2 rounded-md flex items-center gap-2 shadow-md cursor-pointer 
              transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
            onClick={handleClickFacebook}
          >
            Sign in with Facebook <FaFacebook size={30} color="#1877F2" />
          </button>
        </div>

        {/* Login Form */}
        <form className="w-full max-w-md" onSubmit={handleSubmit(onSubmit)}>
          <input
            type="text"
            placeholder="Username or email"
            {...register("username", { required: "Please enter username!" })}
            className="w-full p-3 rounded-md border mb-3 text-black bg-white"
          />
          {errors.username && (
            <p className="text-red-500">{errors.username.message}</p>
          )}

          <input
            type="password"
            placeholder="Password"
            {...register("password", { required: "Please enter password!" })}
            className="w-full p-3 rounded-md border mb-3 text-black bg-white"
          />
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}

          <div className="flex justify-between w-full text-black mb-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={staySignedIn}
                onChange={(e) => setStaySignedIn(e.target.checked)}
              />
              Stay signed in
            </label>
            <a href="/admin/forgot-password" className="text-blue-700">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold cursor-pointer 
              transition-all duration-300 transform hover:scale-105 hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95"
          >
            Sign in
          </button>
        </form>

        
      </div>

      {/* Right side - Branding */}
      <SideBanner />
    </div>
  );
};

export default LoginAdminPage;