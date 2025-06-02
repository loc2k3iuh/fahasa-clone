import React from "react";
import { CheckCircle2 } from "lucide-react";
import SideBanner from "../components/SideBanner";

const ForgotPasswordSuccessPage: React.FC = () => {
  return (
    <div className="flex h-screen">
      {/* Left side - Success message */}
      <div className="w-1/2 bg-gray-50 flex flex-col justify-center items-center p-8">
        <div className="text-center max-w-md">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-black mb-4">Success!</h2>
          <p className="text-black">
            We have sent an email to change your password. Please check your inbox and follow the instructions.
            </p>
          <a
            href="/admin/login"
            className="inline-block mt-6 bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold transition-all duration-300 hover:bg-blue-700 shadow-md"
          >
            Go to Login
          </a>
        </div>
      </div>

      {/* Right side - Branding */}
      <SideBanner />
    </div>
  );
};

export default ForgotPasswordSuccessPage;
