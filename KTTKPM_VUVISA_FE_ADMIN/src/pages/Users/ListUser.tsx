import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ToggleSwitch from "../../components/ToggleSwitch";
import {useUserService} from "../../services/useUserService";
import { UserResponse } from "../../types/user";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { disableUser } from "../../socket/connectWebSocket";


const ListUser: React.FC = () => {
  const { getAllUsers, inactivateUser } = useUserService();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["users", searchTerm, selectedState, currentPage],
    queryFn: () => {
      const stateParam = selectedState === "all" ? undefined : selectedState === "active";
      return getAllUsers(currentPage - 1, itemsPerPage, searchTerm, stateParam);
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const users: UserResponse[] = data?.users || [];
  const totalPages = data?.totalPages || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); 
    refetch(); 
  };

  const handleToggleChange = async (userId: number, isActive: boolean) => {
    // Thông báo cảnh báo đặc biệt cho việc vô hiệu hóa tài khoản
    let confirmTitle = isActive 
      ? "Vô hiệu hóa tài khoản này?"
      : "Kích hoạt tài khoản này?";
    
    let confirmText = isActive
      ? "Người dùng này sẽ bị buộc đăng xuất ngay lập tức và không thể đăng nhập lại cho đến khi tài khoản được kích hoạt lại."
      : "Người dùng này sẽ có thể đăng nhập lại vào hệ thống.";
    
    const result = await Swal.fire({
      title: confirmTitle,
      text: confirmText,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: isActive ? "#d33" : "#3085d6",
      cancelButtonColor: "#6c757d",
      confirmButtonText: isActive ? "Vô hiệu hóa" : "Kích hoạt",
      cancelButtonText: "Hủy",
      background: "#1f2636",
      color: "#ffffff",
    });
  
    if (result.isConfirmed) {
      const toastId = toast.loading(isActive ? "Đang vô hiệu hóa tài khoản..." : "Đang kích hoạt tài khoản...");
      try {
        await inactivateUser(userId); // Gọi API để thay đổi trạng thái
           disableUser(userId); // Gửi thông báo qua WebSocket
        toast.success(isActive 
          ? "Tài khoản đã được vô hiệu hóa và người dùng đã bị ngắt kết nối." 
          : "Tài khoản đã được kích hoạt thành công.", {
          id: toastId, 
        });
        refetch();
      } catch (err) {
        console.error("Error updating user status:", err);
        toast.error("Không thể thay đổi trạng thái tài khoản.", {
          id: toastId, // Cập nhật trạng thái error
        });
      }
    }
  };

  useEffect(() => {
    let toastId: string | number | undefined;
    if (isFetching) {
      toastId = toast.loading("Loading users...");
    }
    return () => {
      if (toastId !== undefined) {
        toast.dismiss(toastId);
      }
    };
  }, [isFetching]);

  return (
    <main className="bg-gray-900">
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 mb-15">
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white/90">Users</h2>
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
                <li className="text-[0.875rem] text-white/90">Users</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="pt-5">
          <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#1f2636] p-4">
            <div className="mb-4 flex items-center">
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setCurrentPage(1); 
                  refetch();
                }}
                className="px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-500"
              />

              <button
                onClick={handleSearch}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-500 rounded-r-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                    d="M21 21l-4.35-4.35M16.65 11a5.65 5.65 0 11-11.3 0 5.65 5.65 0 0111.3 0z"
                  />
                </svg>
              </button>
            </div>

            <div className="max-w-full overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-5 py-3 text-left text-gray-400 text-xs">Full Name</th>
                    <th className="px-5 py-3 text-left text-gray-400 text-xs">Email</th>
                    <th className="px-5 py-3 text-left text-gray-400 text-xs">Phone</th>
                    <th className="px-5 py-3 text-left text-gray-400 text-xs">Address</th>
                    <th className="px-5 py-3 text-center text-gray-400 text-xs">Status</th>
                    <th className="px-5 py-3 text-right text-gray-400 text-xs">Set Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-5 py-4 text-left text-gray-400">{user.full_name}</td>
                      <td className="px-5 py-4 text-left text-gray-400">{user.email}</td>
                      <td className="px-5 py-4 text-left text-gray-400">{user.phone_number}</td>
                      <td className="px-5 py-4 text-left text-gray-400">{user.address}</td>
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${user.is_active
                            ? "bg-green-900 text-green-400"
                            : "bg-red-900 text-red-400"
                            }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <ToggleSwitch
                          checked={user.is_active || false}
                          onChange={() => handleToggleChange(user.id, user.is_active || false)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-center items-center mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`px-3 py-1 text-sm font-medium rounded-lg ${currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

export default ListUser;
