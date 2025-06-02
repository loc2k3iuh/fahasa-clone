import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import voucherService from "../../services/voucherService";
import { toast } from "sonner";
import { convertArrayToDateInputValue } from "../../components/tools/DateTime";

const EditVoucher: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [code, setCode] = useState("");
  const [discountName, setDiscountName] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState<number | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number | null>(null);
  const [minOrderValue, setMinOrderValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [isStartDateEditable, setIsStartDateEditable] = useState(true);

    const [initialValues, setInitialValues] = useState({
      code: "",
      discountName: "",
      minOrderValue: "",
      maxUses: "",
      percentage: null as number | null,
      amount: null as number | null,
      startDate: "",
      endDate: "",
    });

  useEffect(() => {
    document.title = "Edit Voucher";
  }, []);

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        const response = await voucherService.getVoucherById(Number(id));
        const data = response; // Lấy dữ liệu từ API

        if (data.result) {
          setCode(data.result.code);
          setDiscountName(data.result.discount_name);
          setDiscountPercentage(data.result.discount_percentage);
          setDiscountAmount(data.result.discount_amount);
          setMinOrderValue(data.result.min_order_value);
          setMaxUses(data.result.max_uses);
          
          // Thêm kiểm tra và xử lý an toàn cho dữ liệu ngày
          const startDateValue = Array.isArray(data.result.start_date) 
            ? convertArrayToDateInputValue(data.result.start_date)
            : "";
          setStartDate(startDateValue);
          
          const endDateValue = Array.isArray(data.result.end_date)
            ? convertArrayToDateInputValue(data.result.end_date)
            : "";
          setEndDate(endDateValue);

          // Kiểm tra ngày bắt đầu có nhỏ hơn hoặc bằng ngày hiện tại không
          if (new Date(startDateValue) <= new Date()) {
            setIsStartDateEditable(false);
          }

          // Đồng bộ tên thuộc tính để tránh lỗi
          setInitialValues({
            code: data.result.code,
            discountName: data.result.discount_name,  // Thay đổi từ discountName sang discount_name
            minOrderValue: data.result.min_order_value,  // Thay đổi từ minOrderValue sang min_order_value
            maxUses: data.result.max_uses,  // Thay đổi từ maxUses sang max_uses
            percentage: data.result.discount_percentage,
            amount: data.result.discount_amount,
            startDate: startDateValue,
            endDate: endDateValue,
          });
        }
      } catch (error: any) {
        toast.error(error?.message || "Failed to fetch voucher details!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVoucher();
  }, [id]);

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

    if (
      code === initialValues.code &&
      discountName === initialValues.discountName &&
      minOrderValue === initialValues.minOrderValue &&
      maxUses === initialValues.maxUses &&
      discountPercentage === initialValues.percentage &&
      discountAmount === initialValues.amount &&
      startDate === initialValues.startDate &&
      endDate === initialValues.endDate
    ) {
      toast.info("No changes detected. Update is not required.");
      return;
    }

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

    if (Number(maxUses) < 0 || !Number.isInteger(Number(maxUses))) {
      toast.error("Max uses must be a positive integer or zero!");
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

      // Gọi API cập nhật voucher
      await voucherService.updateVoucher(Number(id), voucherDTO);

      toast.success("Voucher updated successfully! Redirecting to the voucher list...");

      // Chuyển hướng sau 3 giây
      setTimeout(() => {
        window.location.href = "/admin/vouchers";
      }, 3000);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update voucher!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center justify-center flex flex-col items-center">
          <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
          <p className="mt-4 text-gray-300">Loading voucher details...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-gray-900">
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 mb-15">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white/90">Edit Voucher</h2>
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
              <li className="text-[0.875rem] text-white/90">Edit Voucher</li>
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
                disabled={initialValues.code === code}
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
                className={`mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border ${
                  isStartDateEditable ? "border-gray-700" : "border-gray-500"
                } rounded-lg focus:outline-none focus:ring-2 ${
                  isStartDateEditable ? "focus:ring-blue-500" : "focus:ring-gray-500"
                }`}
                disabled={!isStartDateEditable}
                required
              />
              {!isStartDateEditable && (
                <p className="mt-1 text-sm text-gray-500">
                  Start date cannot be edited because it is in the past or today.
                </p>
              )}
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
                Update Voucher
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default EditVoucher;
