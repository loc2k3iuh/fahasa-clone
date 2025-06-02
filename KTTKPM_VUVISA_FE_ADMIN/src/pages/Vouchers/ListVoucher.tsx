import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import voucherService from "../../services/voucherService";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { convertArrayToDateInputValue } from "../../components/tools/DateTime";

interface Voucher {
  id: number;
  code: string;
  discountName: string;
  discountPercentage: number | null;
  discountAmount: number | null;
  minOrderValue: number;
  maxUses: number;
  startDate: [number, number, number];
  endDate: [number, number, number];
  status: string;
}

const ListVoucher: React.FC = () => {
  useEffect(() => {
    document.title = "Voucher List";
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showDropdown, setShowDropdown] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["vouchers", searchTerm, currentPage],
    queryFn: () =>
      searchTerm
        ? voucherService.searchVouchersByName(searchTerm, currentPage - 1, itemsPerPage)
        : voucherService.getVouchers(currentPage - 1, itemsPerPage),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const vouchers: Voucher[] =
  data?.result?.content.map((voucher: any) => ({
    id: voucher.id,
    code: voucher.code,
    discountName: voucher.discount_name,
    discountPercentage: voucher.discount_percentage,
    discountAmount: voucher.discount_amount,
    minOrderValue: voucher.min_order_value,
    maxUses: voucher.max_uses,
    startDate: voucher.start_date,
    endDate: voucher.end_date,
    status: new Date() < new Date(voucher.startDate)
      ? "Not Started"
      : new Date() > new Date(voucher.endDate)
      ? "Expired"
      : "Active",
  })) || [];

  if (isError) {
    toast.error(error?.message || "Something went wrong!");
  }

  const totalPages = data?.result?.totalPages || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); 
  };

  useEffect(() => {
    let toastId: string | number | undefined;
    if (isFetching) {
      toastId = toast.loading("Loading data...");
    }
    return () => {
      if (toastId !== undefined) {
        toast.dismiss(toastId);
      }
    };
  }, [isFetching]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      background: "#1f2636",
      color: "#ffffff",
    });

    if (result.isConfirmed) {
      try {
        await voucherService.deleteVoucher(id);
        toast.success("Voucher deleted successfully!");
        refetch();
      } catch (error: any) {
        toast.error(error?.message || "Failed to delete voucher!");
      }
    }
  };

  // useEffect(() => {
  //   if (filterStatus !== "All") {
  //     setVouchers(
  //       mockVoucherData.filter((voucher) => voucher.status === filterStatus)
  //     );
  //   } else {
  //     setVouchers(mockVoucherData);
  //   }
  // }, [filterStatus]);

  // const filteredVouchers = vouchers.filter(
  //   (voucher) =>
  //     voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     voucher.status.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  // const totalPages = Math.ceil(filteredVouchers.length / itemsPerPage);
  // const paginatedVouchers = filteredVouchers.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );

  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page);
  // };

  // const handleDelete = (id: number) => {
  //   if (window.confirm("Are you sure you want to delete this voucher?")) {
  //     setVouchers(vouchers.filter((voucher) => voucher.id !== id));
  //     alert("Voucher deleted successfully!");
  //   }
  // };

  return (
    <main className="bg-gray-900">
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 mb-15">
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white/90">Vouchers</h2>
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
                <li className="text-[0.875rem] text-white/90">Vouchers</li>
              </ol>
            </nav>
          </div>
        </div>
        <div className="pt-5">
          <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#1f2636] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search vouchers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
                  />
                  <button
                    type="submit"
                    className="ml-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500"
                  >
                    Search
                  </button>
                </form>
              </div>
              <div className="relative">
                <button
                  className="px-3 py-2 text-sm font-medium text-white bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 focus:outline-none"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 9l6 6 6-6"
                    />
                  </svg>
                </button>
                <button
                  className="ml-2 px-3 py-2 text-sm font-medium text-white bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 focus:outline-none"
                  onClick={() => window.location.href = "/admin/vouchers/create"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
                <button
                  className="ml-2 px-3 py-2 text-sm font-medium text-white bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 focus:outline-none"
                  onClick={() => {
                    refetch();
                  }}
                >
                  Reload
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
                    <button
                      onClick={() => setFilterStatus("All")}
                      className="block w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-700"
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterStatus("Active")}
                      className="block w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-700"
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setFilterStatus("Expired")}
                      className="block w-full px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-700"
                    >
                      Expired
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="max-w-full overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-5 py-3 sm:px-6 text-gray-400 text-[12px] text-left">Code</th>
                    <th className="px-5 py-3 sm:px-6 text-gray-400 text-[12px] text-left">Percentage</th>
                    <th className="px-5 py-3 sm:px-6 text-gray-400 text-[12px] text-left">Start Date</th>
                    <th className="px-5 py-3 sm:px-6 text-gray-400 text-[12px] text-left">End Date</th>
                    <th className="px-5 py-3 sm:px-6 text-gray-400 text-[12px] text-center">Status</th>
                    <th className="px-5 py-3 sm:px-6 text-gray-400 text-[12px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  { isLoading ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-4 sm:px-6 text-gray-400 text-center">
                            Loading...
                          </td>
                        </tr>
                  ) : (
                    vouchers.map((voucher) => (
                    <tr key={voucher.code}>
                      <td className="px-5 py-4 sm:px-6 text-gray-400 text-left">{voucher.code}<br/><span className="text-[12px] text-gray-400">({voucher.discountName})</span></td>
                      <td className="px-5 py-4 sm:px-6 text-gray-400 text-left">{voucher.discountPercentage !== null
                            ? `-${voucher.discountPercentage}%`
                            : `-${voucher.discountAmount} VNĐ`}</td>
                      <td className="px-5 py-4 sm:px-6 text-gray-400 text-left">{convertArrayToDateInputValue(voucher.startDate)}</td>
                      <td className="px-5 py-4 sm:px-6 text-gray-400 text-left">{convertArrayToDateInputValue(voucher.endDate)}</td>
                      <td className="px-5 py-4 sm:px-6 text-center">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${
                            voucher.status === "Active"
                              ? "bg-green-900 text-green-400"
                              : voucher.status === "Not Started"
                              ? "bg-blue-900 text-blue-400"
                              : "bg-red-900 text-red-400"
                          }`}
                        >
                          {voucher.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={`/admin/vouchers/${voucher.id}/edit`}
                            className="px-3 py-1 text-[12px] font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-600"
                          >
                            Edit
                          </a>
                          <button
                            onClick={() => handleDelete(voucher.id)}
                            className="px-3 py-1 text-[12px] font-medium text-white bg-red-700 rounded-lg hover:bg-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-center items-center mt-4 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 text-sm font-medium rounded-lg ${
                  currentPage === index + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ListVoucher;
