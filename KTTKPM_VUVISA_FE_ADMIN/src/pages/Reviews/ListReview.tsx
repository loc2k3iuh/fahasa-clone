import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import reviewService from "../../services/reviewService";
import { toast } from "sonner";
import Swal from "sweetalert2";
interface Review {
  id: number;
  product: string | { productName: string };
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    avatar_url: string;
  };
  comment: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

const ListReview: React.FC = () => {
  useEffect(() => {
    document.title = "Review List";
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedComment, setEditedComment] = useState<string>("");

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["reviews", searchTerm, currentPage],
    queryFn: () =>
      reviewService.getAllReviews(currentPage - 1, itemsPerPage),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const handleEditClick = (id: number, currentComment: string) => {
    setEditingId(id);
    setEditedComment(currentComment);
  };

  const handleSaveClick = async (id: number) => {

    if (!editedComment.trim()) {
      toast.error("Comment cannot be empty!");
      return;
    }

    try {
      // Hiển thị toast loading
      const toastId = toast.loading("Updating review...");

      // Gọi API để cập nhật review
      await reviewService.updateReview(id, { comment: editedComment });

      // Hiển thị toast success
      toast.success("Review updated successfully!", { id: toastId });

      // Làm mới danh sách review
      refetch();

      // Đặt lại trạng thái chỉnh sửa
      setEditingId(null);
      setEditedComment("");
    } catch (error: any) {
      // Hiển thị toast fail
      toast.error(error?.response?.data?.message || "Failed to update review!");
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditedComment("");
  };

  const reviews: Review[] =
  data?.result?.content.map((review: any) => ({
    id: review.id,
    user: {
      id: review.user.id,
      username: review.user.username,
      email: review.user.email,
      full_name: review.user.full_name,
      avatar_url: review.user.avatar_url,
    },
    product: typeof review.product === 'object' ? review.product.productName : review.product,
    comment: review.comment,
    rating: review.rating,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
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
    setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm
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
        await reviewService.deleteReview(id);
        toast.success("Review deleted successfully!");
        refetch();
      } catch (error: any) {
        toast.error(error?.message || "Failed to delete review!");
      }
    }
  };

  return (
    <main className="bg-gray-900">
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 mb-15">
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white/90">Reviews</h2>
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
                        stroke=""
                        stroke-width="1.2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></path>
                    </svg>
                  </a>
                </li>
                <li className="text-[0.875rem] text-white/90">Reviews</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="pt-5">
          <div className="mb-4 flex items-center justify-between">
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                placeholder="Search reviews..."
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
            <button
                  className="ml-2 px-3 py-2 text-sm font-medium text-white bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 focus:outline-none"
                  onClick={() => {
                    refetch();
                  }}
                >
                  Reload
            </button>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#1f2636]">
            <div className="max-w-full overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-5 py-3 sm:px-6 text-left">
                      <div className="flex items-center">
                        <p className="font-medium text-[12px] leading-[12px] text-gray-400">
                          Product
                        </p>
                      </div>
                    </th>
                    <th className="px-5 py-3 sm:px-6 text-left">
                      <div className="flex items-center">
                        <p className="font-medium text-[12px] leading-[12px] text-gray-400">
                          User
                        </p>
                      </div>
                    </th>
                    <th className="px-5 py-3 sm:px-6 text-left">
                      <div className="flex items-center">
                        <p className="font-medium text-[12px] leading-[12px] text-gray-400">
                          Comment
                        </p>
                      </div>
                    </th>
                    <th className="px-5 py-3 sm:px-6 text-center">
                      <div className="flex items-center justify-center">
                        <p className="font-medium text-[12px] leading-[12px] text-gray-400">
                          Rating
                        </p>
                      </div>
                    </th>
                    <th className="px-5 py-3 sm:px-6 text-right">
                      <div className="flex items-center justify-end">
                        <p className="font-medium text-[12px] leading-[12px] text-gray-400">
                          Tools
                        </p>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-4 sm:px-6 text-gray-400 text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : (
                    reviews.map((review) => (
                    <tr key={review.id}>
                      <td className="px-5 py-4 sm:px-6 text-left">
                        <div className="flex items-center">
                          <p className="text-gray-400 text-[14px] leading-[20px]">
                            {typeof review.product === 'object' 
                              ? review.product.productName 
                              : review.product
                            }
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 sm:px-6 text-left">
                        <div className="flex items-center">
                          <p className="text-gray-400 text-[14px] leading-[20px]">
                            {review.user.full_name}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 sm:px-6 text-left">
                        <div className="flex items-center">
                          {editingId === review.id ? (
                            <>
                              <input
                                type="text"
                                value={editedComment}
                                onChange={(e) =>
                                  setEditedComment(e.target.value)
                                }
                                className="px-2 py-1 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <button
                                onClick={() => handleSaveClick(review.id)}
                                className="ml-2 px-2 py-1 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-500"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelClick}
                                className="ml-2 px-2 py-1 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-500"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <p className="text-gray-400 text-[14px] leading-[20px]">
                                {review.comment}
                              </p>
                              <button
                                onClick={() =>
                                  handleEditClick(review.id, review.comment)
                                }
                                className="ml-2 text-blue-500 hover:text-blue-400"
                              >
                                ✏️
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 sm:px-6 text-center">
                        <div className="flex items-center justify-center">
                          <span className="text-gray-400 text-[14px] leading-[20px]">
                            {review.rating}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleDelete(review.id)}
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

export default ListReview;
