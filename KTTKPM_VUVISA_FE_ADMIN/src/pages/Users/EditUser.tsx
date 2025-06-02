import React, { useState, useEffect } from "react";

import { useUserService } from "../../services/useUserService";
import { useParams } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { convertArrayToDateInputValue } from "../../components/tools/DateTime";

const EditUser: React.FC = () => {
  useEffect(() => {
    document.title = "Edit User";
  }, []);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [dobError, setDobError] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const { updateUserDetail, getUserDetail } = useUserService();
  const { id } = useParams(); // lấy ra tham số id từ URL

  const parseDateOfBirth = (dob: any): string => {
    if (!dob) return "";
    if (typeof dob === "string") return dob;
    if (Array.isArray(dob)) {
      if (dob.length === 3) {
        return convertArrayToDateInputValue(dob as [number, number, number]);
      } else {
        return "";
      }
    }
    if (dob instanceof Date) {
      // Date object
      return dob.toISOString().split("T")[0];
    }
    return "";
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getUserDetail();
        setFullName(data.full_name || "");
        setPhoneNumber(data.phone_number || "");
        setAddress(data.address || "");
        setAvatarPreview(data.avatar_url || "");
        setDateOfBirth(parseDateOfBirth(data.date_of_birth));

        // Validate date of birth when loading user data
        if (data.date_of_birth) {
          validateDateOfBirth(parseDateOfBirth(data.date_of_birth));
        }
      } catch (error) {
        console.error("Không thể lấy thông tin người dùng:", error);
      }
    };

    fetchUser();
  }, []);

  const validatePhoneNumber = (phone: string) => {
    const phonePattern = /^(09|03|02|07)\d{8}$/;
    return phonePattern.test(phone);
  };

  const validateDateOfBirth = (dob: string) => {
    if (!dob) return true;

    const birthDate = new Date(dob);
    const today = new Date();

    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // If birth month is ahead or same month but birth day is ahead, subtract one year
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      setDobError("Người dùng phải đủ 18 tuổi trở lên.");
      return false;
    } else {
      setDobError("");
      return true;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    setPhoneNumber(phone);

    if (phone && !validatePhoneNumber(phone)) {
      setPhoneError(
        "Số điện thoại không hợp lệ. Phải bắt đầu bằng 09, 03, 02 hoặc 07 và có 10 chữ số."
      );
    } else {
      setPhoneError("");
    }
  };

  const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dob = e.target.value;
    setDateOfBirth(dob);
    validateDateOfBirth(dob);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submitting
    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      setPhoneError(
        "Số điện thoại không hợp lệ. Phải bắt đầu bằng 09, 03, 02 hoặc 07 và có 10 chữ số."
      );
      return;
    }

    if (!validateDateOfBirth(dateOfBirth)) {
      return; // Stop submission if date of birth is invalid
    }

    try {
      const updateUserDTO = {
        full_name: fullName,
        phone_number: phoneNumber,
        address,
        date_of_birth: dateOfBirth,
        avatar, // File | null vẫn được chấp nhận trong FormData
      };

      if (!id) {
        console.log("User ID is missing");
        return;
      }
      await updateUserDetail(id, updateUserDTO);

      alert("Cập nhật thành công!");
      window.location.href = "/admin/users"; // Chuyển hướng về danh sách người dùng
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại!");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files?.[0];

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ảnh không được vượt quá 5MB");
        return;
      }

      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast.error("Chỉ chấp nhận các định dạng ảnh: JPEG, PNG, JPG và GIF");
        return;
      }

      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <main className="bg-gray-900">
      <div className="p-4 mx-auto max-w-[--breakpoint-2xl] md:p-6 mb-15">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white/90">Edit User</h2>
          <nav>
            <ol className="flex items-center gap-1.5">
              <li>
                <a
                  className="inline-flex items-center gap-1.5 text-[0.875rem] text-gray-500"
                  href="/admin"
                >
                  Home
                  <svg
                    className="stroke-current"
                    width="17"
                    height="16"
                    viewBox="0 0 17 16"
                    fill="none"
                  >
                    <path
                      d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </li>

              <li className="text-[0.875rem] text-white/90">Edit User</li>
            </ol>
          </nav>
        </div>

        <div className="pt-5">
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-xl border border-gray-800 bg-[#1f2636] p-6"
          >
            {/* Full Name */}
            <div className="mb-4">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-400"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="mb-4">
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-400"
              >
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className={`mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border ${
                  phoneError ? "border-red-500" : "border-gray-700"
                } rounded-lg`}
                required
              />
              {phoneError && (
                <p className="mt-1 text-sm text-red-500">{phoneError}</p>
              )}
            </div>

            {/* Address */}
            <div className="mb-4">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-400"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg"
                required
              />
            </div>

            {/* Date of Birth */}
            <div className="mb-4">
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-gray-400"
              >
                Date of Birth
              </label>
              <input
                type="date"
                id="dateOfBirth"
                value={dateOfBirth}
                onChange={handleDateOfBirthChange}
                className={`mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border ${
                  dobError ? "border-red-500" : "border-gray-700"
                } rounded-lg`}
                required
              />
              {dobError && (
                <p className="mt-1 text-sm text-red-500">{dobError}</p>
              )}
            </div>

            {/* Avatar Upload */}
            <div className="mb-4">
              <label
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-400"
              >
                Avatar
              </label>
              <input
                type="file"
                id="avatar"
                onChange={handleAvatarChange}
                className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg"
                accept="image/*"
              />
              {avatarPreview && (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="mt-2 h-24 rounded-full border border-gray-500"
                />
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 cursor-pointer transition duration-200 ease-in-out"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default EditUser;
