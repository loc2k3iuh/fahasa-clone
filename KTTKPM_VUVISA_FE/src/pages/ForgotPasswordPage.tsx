import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {useUserService} from "../services/useUserService";

interface ForgotPasswordForm {
  email: string;
  
}

const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();

  const { sendResetPasswordEmail } = useUserService(); // Giả sử bạn có hàm sendResetPasswordEmail
  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      setIsLoading(true);
      await sendResetPasswordEmail({ email: data.email, is_admin: false }); // Gọi hàm gửi email với đối tượng đúng
      toast.success("An email to reset your password has been sent! Please check your inbox.");
      setTimeout(() => {
        window.location.href = "/user/forgot-password/success"; // Redirect to success page
      }, 1000);
    } catch (error: any) {
      setIsLoading(false);
      toast.error(error?.message || "Unable to send email!");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side - Form */}
      <div className="w-2/2 bg-gray-50 flex flex-col justify-center items-center p-8">
        <h2 className="text-3xl font-bold text-black mb-4">Quên mật khẩu</h2> {/* Updated title */}
        <p className="text-black mb-6 text-center">Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu</p> {/* Updated text */}

        <form className="w-full max-w-md" onSubmit={handleSubmit(onSubmit)}>
          <input
            type="email"
            placeholder="Your email"
            {...register("email", {
              required: "Please enter your email!",
              pattern: {
                value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                message: "Invalid email!"
              }
            })}
            className="w-full p-3 rounded-md border mb-3 text-black bg-white"
            disabled={isLoading}
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold cursor-pointer 
            transition-all duration-300 transform hover:scale-105 hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95 relative"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="opacity-0">Gửi email đặt lại mật khẩu</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></div>
                </div>
              </>
            ) : (
              "Gửi email đặt lại mật khẩu"
            )}
          </button>
        </form>

        <p className="mt-4 text-black">
          <a href="/user/login" className="text-blue-700 hover:underline" tabIndex={isLoading ? -1 : 0}>Quay lại trang đăng nhập</a>
        </p>
      </div>

      {/* Right side - Branding */}
    </div>
  );
};

export default ForgotPasswordPage;
