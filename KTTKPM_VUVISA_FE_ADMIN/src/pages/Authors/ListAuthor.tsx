import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuthors, createAuthor, updateAuthor, deleteAuthor } from "../../services/authorService";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface Author {
  id: number;
  authorName: string;
  description: string;
}

const ListAuthor: React.FC = () => {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [currentAuthor, setCurrentAuthor] = useState<Author | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sử dụng useQuery để fetch danh sách authors
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["authors", searchTerm, currentPage],
    queryFn: () => getAuthors(currentPage - 1, searchTerm),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const authors: Author[] = data?.content || [];
  const totalPages = data?.totalPages || 0;

  // Hiển thị toast loading khi đang fetch dữ liệu
  useEffect(() => {
    let toastId: string | number | undefined;
    if (isFetching) {
      toastId = toast.loading("Loading authors...");
    }
    return () => {
      if (toastId !== undefined) {
        toast.dismiss(toastId);
      }
    };
  }, [isFetching]);

  const handleCreateAuthor = async (newAuthor: { authorName: string; description: string }) => {
    if (!newAuthor.authorName || newAuthor.authorName.trim().length < 2 || newAuthor.authorName.trim().length > 50) {
      toast.error("Author name must be between 2 and 50 characters.");
      return;
    }

    if (newAuthor.description && newAuthor.description.trim().length > 400) {
      toast.error("Description cannot exceed 400 characters.");
      return;
    }

    const toastId = toast.loading("Creating author...");
    try {
      await createAuthor(newAuthor);
      toast.success("Author created successfully!", { id: toastId });
      refetch();
      setCreateModalOpen(false);
    } catch (err) {
      toast.error("Failed to create author!", { id: toastId });
      console.error(err);
    }
  };

  const handleEditAuthor = async (updatedAuthor: { authorName: string; description: string }) => {
    if (!currentAuthor) return;

    if (updatedAuthor.authorName.length < 2 || updatedAuthor.authorName.length > 50) {
      toast.error("Author name must be between 2 and 50 characters.");
      return;
    }

    if (updatedAuthor.description.length > 400) {
      toast.error("Description cannot exceed 400 characters.");
      return;
    }

    const toastId = toast.loading("Updating author...");
    try {
      await updateAuthor(currentAuthor.id, updatedAuthor);
      toast.success("Author updated successfully!", { id: toastId });
      refetch();
      setEditModalOpen(false);
    } catch (err) {
      toast.error("Failed to update author!", { id: toastId });
      console.error(err);
    }
  };

  const handleDeleteAuthor = async (id: number) => {
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
      const toastId = toast.loading("Deleting author...");
      try {
        await deleteAuthor(id);
        toast.success("Author deleted successfully!", { id: toastId });
        refetch();
      } catch (err) {
        toast.error("Failed to delete author!", { id: toastId });
        console.error(err);
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <main className="bg-gray-900 relative">
      <div className="p-4 mx-auto max-w-7xl md:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white/90">Authors</h2>
            <nav>
                <ol className="flex items-center gap-1.5">
                <li>
                    <a className="inline-flex items-center gap-1.5 text-[0.875rem]text-gray-400" href="/admin">
                        Home
                        <svg className="stroke-current" width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366" stroke="" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </a>
                </li>
                <li className="text-[0.875rem] text-white/90">
                    Authors
                </li>
                </ol>
            </nav>
        </div>
          {/*Search && create author */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <input
            type="text"
            placeholder="Search authors..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-theme-xs ring-1 transition bg-gray-800 text-gray-400 ring-gray-700 hover:bg-white/[0.03] cursor-pointer"
          >
            Create Author
          </button>
        </div>
          
          {/* Loading state*/}
          {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : isError ? (
          <div className="mb-4 p-4 text-red-500 bg-red-100 rounded-lg">
            {error?.message || "Failed to load authors!"}
          </div>
        ) : (
            <>
            {/* author table*/}
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#1f2636]">
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-5 py-3 sm:px-6 text-left">
                    <p className="font-medium text-[12px] text-gray-400">Name</p>
                  </th>
                  <th className="px-5 py-3 sm:px-6 text-right">
                    <p className="font-medium text-[12px] text-gray-400">Description</p>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {authors.map((author) => (
                  <tr key={author.id}>
                    <td className="px-5 py-4 sm:px-6 text-left">
                      <p className="text-gray-400">{author.authorName}</p>
                    </td>
                    <td className="px-5 py-4 sm:px-6 text-left">
                          <p className="text-gray-400 line-clamp-2">{author.description}</p>
                    </td>
                    <td className="px-5 py-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setCurrentAuthor(author);
                            setEditModalOpen(true);
                          }}
                          className="px-3 py-1 text-[12px] font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteAuthor(author.id)
                          }
                          className="px-3 py-1 text-[12px] font-medium text-white bg-red-700 rounded-lg hover:bg-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Pagination*/}
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

        </>
      )}
      </div>

      {/* Create Author Modals */}
      {isCreateModalOpen && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 z-10">
          <AuthorModal
            title="Create Author"
            onSubmit={handleCreateAuthor}
            onClose={() => setCreateModalOpen(false)}
          />
        </div>
      )}
      {/*Edit Author modals */}
      {isEditModalOpen && currentAuthor && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 z-10">
          <AuthorModal
            title="Edit Author"
            initialData={currentAuthor}
            onSubmit={handleEditAuthor}
            onClose={() => setEditModalOpen(false)}
          />
        </div>
      )}
    </main>
  );
};

interface AuthorModalProps {
  title: string;
  initialData?: Author;
  onSubmit: (author: {authorName : string, description : string}) => void;
  onClose: () => void;
}

const AuthorModal: React.FC<AuthorModalProps> = ({
  title,
  initialData,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    authorName: initialData?.authorName || "",
    description : initialData?.description || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Name</label>
          <input
            type="text"
            name="authorName"
            value={formData.authorName}
            onChange={handleChange}
            required
            minLength={2}
            className="w-full px-4 py-2 text-sm text-gray-300 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Bio</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={400}
            className="w-full px-4 py-2 text-sm text-gray-300 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default ListAuthor;