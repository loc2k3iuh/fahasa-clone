import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublishers, createPublisher, updatePublisher, deletePublisher, Publisher } from "../../services/publisherService";
import { toast } from "sonner";
import Swal from "sweetalert2";

const ListPublisher: React.FC = () => {
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [currentPublisher, setCurrentPublisher] = useState<Publisher | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["publishers", searchTerm, currentPage],
    queryFn: () => getPublishers(currentPage - 1, searchTerm),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const publishers: Publisher[] = data?.content || [];
  const totalPages = data?.totalPages || 0;

  useEffect(() => {
    let toastId: string | number | undefined;
    if (isFetching) {
      toastId = toast.loading("Loading publishers...");
    }
    return () => {
      if (toastId !== undefined) {
        toast.dismiss(toastId);
      }
    };
  }, [isFetching]);

  const handleCreatePublisher = async (newPublisher: { publisherName: string; description: string }) => {
    if (!newPublisher.publisherName || newPublisher.publisherName.trim().length < 2 || newPublisher.publisherName.trim().length > 50) {
      toast.error("Publisher name must be between 2 and 50 characters.");
      return;
    }
    if (newPublisher.description && newPublisher.description.trim().length > 400) {
      toast.error("Description cannot exceed 400 characters.");
      return;
    }
    const toastId = toast.loading("Creating publisher...");
    try {
      await createPublisher(newPublisher);
      toast.success("Publisher created successfully!", { id: toastId });
      refetch();
      setCreateModalOpen(false);
    } catch (err) {
      toast.error("Failed to create publisher!", { id: toastId });
      console.error(err);
    }
  };

  const handleEditPublisher = async (updatedPublisher: { publisherName: string; description: string }) => {
    if (!currentPublisher) return;
    if (updatedPublisher.publisherName.length < 2 || updatedPublisher.publisherName.length > 50) {
      toast.error("Publisher name must be between 2 and 50 characters.");
      return;
    }
    if (updatedPublisher.description.length > 400) {
      toast.error("Description cannot exceed 400 characters.");
      return;
    }
    const toastId = toast.loading("Updating publisher...");
    try {
      await updatePublisher(currentPublisher.id, updatedPublisher);
      toast.success("Publisher updated successfully!", { id: toastId });
      refetch();
      setEditModalOpen(false);
    } catch (err) {
      toast.error("Failed to update publisher!", { id: toastId });
      console.error(err);
    }
  };

  const handleDeletePublisher = async (id: number) => {
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
      const toastId = toast.loading("Deleting publisher...");
      try {
        await deletePublisher(id);
        toast.success("Publisher deleted successfully!", { id: toastId });
        refetch();
      } catch (err) {
        toast.error("Failed to delete publisher!", { id: toastId });
        console.error(err);
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <main className="bg-gray-900 relative">
      <div className="p-4 mx-auto max-w-7xl md:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white/90">Publishers</h2>
        </div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <input
            type="text"
            placeholder="Search publishers..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-theme-xs ring-1 transition bg-gray-800 text-gray-400 ring-gray-700 hover:bg-white/[0.03] cursor-pointer"
          >
            Create Publisher
          </button>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : isError ? (
          <div className="mb-4 p-4 text-red-500 bg-red-100 rounded-lg">
            {error?.message || "Failed to load publishers!"}
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#1f2636]">
              <div className="max-w-full overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 sm:px-6 text-left">
                        <p className="font-medium text-[12px] text-gray-400">Name</p>
                      </th>
                      <th className="px-5 py-3 sm:px-6 text-left">
                        <p className="font-medium text-[12px] text-gray-400">Description</p>
                      </th>
                      <th className="px-5 py-3 sm:px-6 text-right">
                        <p className="font-medium text-[12px] text-gray-400">Tools</p>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {publishers.map((publisher) => (
                      <tr key={publisher.id}>
                        <td className="px-5 py-4 sm:px-6 text-left">
                          <p className="text-gray-400">{publisher.publisherName}</p>
                        </td>
                        <td className="px-5 py-4 sm:px-6 text-left">
                          <p className="text-gray-400 line-clamp-2">{publisher.description}</p>
                        </td>
                        <td className="px-5 py-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setCurrentPublisher(publisher);
                                setEditModalOpen(true);
                              }}
                              className="px-3 py-1 text-[12px] font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeletePublisher(publisher.id)}
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
                  className={`px-3 py-1 text-sm font-medium rounded-lg ${currentPage === index + 1
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
      {/* Create Publisher Modal */}
      {isCreateModalOpen && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 z-10">
          <PublisherModal
            title="Create Publisher"
            onSubmit={handleCreatePublisher}
            onClose={() => setCreateModalOpen(false)}
          />
        </div>
      )}
      {/* Edit Publisher Modal */}
      {isEditModalOpen && currentPublisher && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 z-10">
          <PublisherModal
            title="Edit Publisher"
            initialData={currentPublisher}
            onSubmit={handleEditPublisher}
            onClose={() => setEditModalOpen(false)}
          />
        </div>
      )}
    </main>
  );
};

interface PublisherModalProps {
  title: string;
  initialData?: Publisher;
  onSubmit: (publisher: { publisherName: string; description: string }) => void;
  onClose: () => void;
}

const PublisherModal: React.FC<PublisherModalProps> = ({
  title,
  initialData,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    publisherName: initialData?.publisherName || "",
    description: initialData?.description || ""
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
            name="publisherName"
            value={formData.publisherName}
            onChange={handleChange}
            required
            minLength={2}
            className="w-full px-4 py-2 text-sm text-gray-300 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Description</label>
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

export default ListPublisher;