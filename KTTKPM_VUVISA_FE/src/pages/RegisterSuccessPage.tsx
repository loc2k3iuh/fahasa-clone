import React, { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useUserService } from "../services/useUserService";

const RegisterSuccessPage: React.FC = () => {
  const { confirmEmail } = useUserService();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromURL = params.get("token");
    if (!tokenFromURL) {
      toast.error("Token is invalid or expired.");
      return;
    }
    (async () => {
      try {
        await confirmEmail({ token: tokenFromURL });
      } catch (error) {
        console.error("Error confirming email:", error);
        toast.error("Xác nhận email thất bại!");
      }
    })();

    // Call your API to verify the token here
  }, [location.search]);

  return (
    <div className="flex h-screen">
      {/* Left side - Success message */}
      <div className="w-2/2 bg-gray-50 flex flex-col justify-center items-center p-8">
        <div className="text-center max-w-md">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-black mb-4">Success!</h2>
          <p className="text-black">
            Tài khoản của bạn đã được tạo thành công.
          </p>
          <a
            href="/user/login"
            className="inline-block mt-6 bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-700 shadow-md"
          >
            Về trang đăng nhập
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccessPage;
