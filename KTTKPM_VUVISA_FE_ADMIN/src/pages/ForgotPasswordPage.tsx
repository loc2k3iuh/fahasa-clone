import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import SideBanner from "../components/SideBanner";
import {useUserService} from "../services/useUserService";

interface ForgotPasswordForm {
  email: string;

}

const ForgotPasswordPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();

  const { sendResetPasswordEmail } = useUserService(); // Giả sử bạn có hàm sendResetPasswordEmail
  const onSubmit = async (data: ForgotPasswordForm) => {
    try {
      await sendResetPasswordEmail({ email: data.email, is_admin: true });
      toast.success("An email to reset your password has been sent! Please check your inbox.");
      window.location.href = "/admin/forgot-password/success"; // Redirect to success page
    } catch (error: any) {
      toast.error(error?.message || "Unable to send email!");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side - Form */}
      <div className="w-1/2 bg-gray-50 flex flex-col justify-center items-center p-8">
        <h2 className="text-3xl font-bold text-black mb-4">Forgot Password</h2> {/* Updated title */}
        <p className="text-black mb-6 text-center">Enter your email to receive password reset instructions</p> {/* Updated text */}

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
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold cursor-pointer 
            transition-all duration-300 transform hover:scale-105 hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95">
            Send recovery email
          </button>
        </form>

        <p className="mt-4 text-black">
          <a href="/admin/login" className="text-blue-700 hover:underline">Back to login</a> {/* Updated text */}
        </p>
      </div>

      {/* Right side - Branding */}
      <SideBanner />
    </div>
  );
};

export default ForgotPasswordPage;
