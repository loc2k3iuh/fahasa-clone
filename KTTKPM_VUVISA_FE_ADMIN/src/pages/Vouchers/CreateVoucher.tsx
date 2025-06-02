import React, { useState, useEffect } from "react";
import voucherService from "../../services/voucherService";
import { toast } from "sonner";

const CreateVoucher: React.FC = () => {
  
  const [discountName, setDiscountName] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number | null>(null);
  const [minOrderValue, setMinOrderValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    document.title = "Create Voucher";
  }, []);

  const generateRandomCode = (length: number = 12): string => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const [code, setCode] = useState(generateRandomCode());

  const handlePercentageChange = (value: string) => {
    const parsedValue = value ? Number(value) : null;
    setDiscountPercentage(parsedValue);

    // Nếu discountPercentage có giá trị, xóa giá trị của discountAmount
    if (parsedValue !== null) {
      setDiscountAmount(null);
    }
  };

  const handleAmountChange = (value: string) => {
    const parsedValue = value ? Number(value) : null;
    setDiscountAmount(parsedValue);

    // Nếu discountAmount có giá trị, xóa giá trị của discountPercentage
    if (parsedValue !== null) {
      setDiscountPercentage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ràng buộc dữ liệu
    if (!code.trim() || code.length < 4 || code.length > 20 || !/^[A-Z0-9]+$/.test(code)) {
      toast.error("Code must be 4-20 characters long, uppercase, and contain only letters and numbers!");
      return;
    }

    if (!discountName.trim()) {
      toast.error("Discount name is required!");
      return;
    }

    if (!startDate) {
      toast.error("Start date is required!");
      return;
    }

    if (!endDate) {
      toast.error("End date is required!");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("End date must be after start date!");
      return;
    }

    if (!discountPercentage && !discountAmount) {
      toast.error("You must provide either a discount percentage or a discount amount!");
      return;
    }

    if (discountPercentage !== null && (discountPercentage <= 0 || discountPercentage > 100)) {
      toast.error("Discount percentage must be between 0 and 100!");
      return;
    }

    if (discountAmount !== null && discountAmount <= 0) {
      toast.error("Discount amount must be greater than 0!");
      return;
    }

    if (Number(minOrderValue) < 0) {
      toast.error("Minimum order value must be 0 or greater!");
      return;
    }

    if (Number(maxUses) <= 0 || !Number.isInteger(Number(maxUses))) {
      toast.error("Max uses must be a positive integer!");
      return;
    }

    try {
      const voucherDTO = {
        code,
        discountName,
        discountPercentage: discountPercentage || null,
        discountAmount: discountAmount || null,
        minOrderValue,
        maxUses,
        startDate,
        endDate,
      };

      // Gọi API tạo voucher
      await voucherService.createVoucher(voucherDTO);

      toast.success("Voucher created successfully! Redirecting to the voucher list...");

      // Chuyển hướng sau 3 giây
      setTimeout(() => {
        window.location.href = "/admin/vouchers";
      }, 3000);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create voucher!");
    }
  };

  return (
    <main className="bg-gray-900">
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 mb-15">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white/90">Create Voucher</h2>
          <nav>
            <ol className="flex items-center gap-1.5">
              <li>
                <a
                  className="inline-flex items-center gap-1.5 text-[0.875rem] text-gray-400"
                  href="/admin"
                >
                  Home
                  <svg
                    className="stroke-current"
                    width="17"
                    height="16"
                    viewBox="0 0 17 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </a>
              </li>
              <li>
                <a
                  className="inline-flex items-center gap-1.5 text-[0.875rem] text-gray-400"
                  href="/admin/vouchers"
                >
                  Vouchers
                  <svg
                    className="stroke-current"
                    width="17"
                    height="16"
                    viewBox="0 0 17 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </a>
              </li>
              <li className="text-[0.875rem] text-white/90">Create Voucher</li>
            </ol>
          </nav>
        </div>
        <div className="pt-5">
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-xl border border-gray-800 bg-[#1f2636] p-6"
          >
            <div className="mb-4">
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-400"
              >
                Voucher Code
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter voucher code"
                disabled
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="discountName" className="block text-sm font-medium text-gray-400">
                Discount Name
              </label>
              <input
                type="text"
                id="discountName"
                value={discountName}
                onChange={(e) => setDiscountName(e.target.value)}
                className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter discount name"
                required
              />
            </div>
            {discountAmount === null && (
              <div className="mb-4">
                <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-400">
                  Discount Percentage
                </label>
                <input
                  type="number"
                  id="discountPercentage"
                  value={discountPercentage !== null ? discountPercentage : ""}
                  onChange={(e) => handlePercentageChange(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter discount percentage"
                />
              </div>
            )}
            {discountPercentage === null && (
              <div className="mb-4">
                <label htmlFor="discountAmount" className="block text-sm font-medium text-gray-400">
                  Discount Amount
                </label>
                <input
                  type="number"
                  id="discountAmount"
                  value={discountAmount !== null ? discountAmount : ""}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter discount amount"
                />
              </div>
            )}
            <div className="mb-4">
              <label htmlFor="minOrderValue" className="block text-sm font-medium text-gray-400">
                Minimum Order Value
              </label>
              <input
                type="number"
                id="minOrderValue"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter minimum order value"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="maxUses" className="block text-sm font-medium text-gray-400">
                Max Uses
              </label>
              <input
                type="number"
                id="maxUses"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter max uses"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-400">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-400">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500"
              >
                Create Voucher
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default CreateVoucher;
