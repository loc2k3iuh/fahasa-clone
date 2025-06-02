import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CategoryType, getCategories,  createCategory, updateCategory,  deleteCategory } from "../../services/categoryService";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface Category {
  id: number;
  categoryName: string;
  description: string;
  type: CategoryType;
};

const ListCategories: React.FC = () => {
  const [isCreateModalOpen,setCreateModalOpen] = useState(false);
  const [isEditModalOpen,setEditModalOpen] = useState(false);
  const [currentCategory,setCurrentCategory] = useState<Category | null>(null);
  const [searchTerm,setSearchTerm]=useState("");
  const [currentPage,setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sử dụng useQuery để fetch danh sách categories
  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ["categories", searchTerm, currentPage],
    queryFn: () => getCategories(currentPage - 1, searchTerm),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
  });

  const categories: Category[] = data?.content || [];
  const totalPages = data?.totalPages || 0;

  // Hiển thị toast loading khi đang fetch dữ liệu
  useEffect(() => {
    let toastId: string | number | undefined;
    if (isFetching) {
      toastId = toast.loading("Loading categories...");
    }
    return () => {
      if (toastId !== undefined) {
        toast.dismiss(toastId);
      }
    };
  }, [isFetching]);

  const handleCreateCategory = async (newCategory: {
    categoryName: string;
    description: string;
    type: CategoryType;
  }) => {

    if (!newCategory.categoryName || newCategory.categoryName.trim().length < 2 || newCategory.categoryName.trim().length > 50) {
      toast.error("Category name must be between 2 and 50 characters.");
      return;
    }
  
    if (newCategory.description && newCategory.description.trim().length > 400) {
      toast.error("Description cannot exceed 400 characters.");
      return;
    }
  
    if (!newCategory.type) {
      toast.error("Category type is required.");
      return;
    }

    const toastId = toast.loading("Creating category...");

    try {
      await createCategory(newCategory);
      toast.success("Category created successfully!", { id: toastId });
      refetch();
      setCreateModalOpen(false);
    } catch (err) {
      toast.error("Failed to create category!", { id: toastId });
      console.error(err);
    }
  };

  const handleEditCategory = async (updateCategoryData: {
    categoryName: string;
    description: string;
    type: CategoryType;
  }) => {
    if (!currentCategory) return;

    if (updateCategoryData.categoryName.length < 2 || updateCategoryData.categoryName.length > 100) {
      toast.error("Category name must be between 2 and 100 characters.");
      return;
    }

    if (updateCategoryData.description.length > 500) {
      toast.error("Description cannot exceed 500 characters.");
      return;
    }

    if (!updateCategoryData.type) {
      toast.error("Category type is required.");
      return;
    }

    const toastId = toast.loading("Updating category...");

    try {
      await updateCategory(currentCategory.id, updateCategoryData);
      toast.success("Category updated successfully!", { id: toastId });
      refetch();
      setEditModalOpen(false);
    } catch (err) {
      toast.error("Failed to update category!", { id: toastId });
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: number) => {
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
      const toastId = toast.loading("Deleting category...");
      try {
        await deleteCategory(id);
        toast.success("Category deleted successfully!", { id: toastId });
        refetch();
      } catch (err) {
        toast.error("Failed to delete category!", { id: toastId });
        console.error(err);
      }
    }
  };

  const handleSearchChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
    setSearchTerm(e.target.value);
    setCurrentPage(0);
  };
  const handlePageChange = (page : number)=>{
    setCurrentPage(page);
  }

  const getCategoryTypeLabel = (type: CategoryType): string => {
    switch(type) {
      case CategoryType.SACH_TRONG_NUOC:
        return "Sách trong nước";
      case CategoryType.SACH_NUOC_NGOAI:
        return "Sách nước ngoài";
      case CategoryType.VAN_PHONG_PHAM:
        return "Văn phòng phẩm";
      default:
        return type; // Fallback nếu có giá trị mới
    }
  };

  return (
    <main className="bg-gray-900 relative">
      <div className="p-4 mx-auto max-w-7xl md:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white/90">Categories</h2>
            <nav>
                <ol className="flex items-center gap-1.5">
                <li>
                    <a className="inline-flex items-center gap-1.5 text-[0.875rem] text-gray-400" href="/admin">
                        Home
                        <svg className="stroke-current" width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366" stroke="" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"></path>
                        </svg>
                    </a>
                </li>
                <li className="text-[0.875rem] text-white/90">
                    Categories
                </li>
                </ol>
            </nav>
        </div>
             {/*Search && create categories */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-theme-xs ring-1 transition bg-gray-800 text-gray-400 ring-gray-700 hover:bg-white/[0.03] cursor-pointer"
          >
            Create Category
          </button>
        </div>
           {/* Loading state*/}
           {isLoading ?(
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ): isError ?(
            <div className="mb-4 p-4 text-red-500 bg-red-100 rounded-lg">
              {error?.message || "Failed to load categories!"}
            </div>
            ) : (
            <>
            {/* author table*/}
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#1f2636]">
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-5 py-4 sm:px-6 text-left">
                    <p className="font-medium text-[12px] text-gray-400">Name</p>
                  </th>
                  <th className="px-5 py-4 sm:px-6 text-right">
                    <p className="font-medium text-[12px] text-gray-400">Description</p>
                  </th>
                  <th className="px-5 py-4  sm:px-6 text-right">
                    <p className="font-medium text-[12px] text-gray-400">Type</p>
                  </th>
                  <th className="px-5 py-4  sm:px-6 text-right">
                    <p className="font-medium text-[12px] text-gray-400">Action</p>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-5 py-4 sm:px-6 text-left">
                      <p className="text-gray-400">{category.categoryName}</p>
                    </td>
                    
                     <td className="px-5 py-4 sm:px-6 text-left">
                      <p className="text-gray-400 line-clamp-2">{category.description}</p>
                     </td>
                     <td className="px-5 py-4 sm:px-6 text-left">
                        <span className={`px-2 py-1 text-xs rounded-full inline-block truncate ${
                          category.type === CategoryType.SACH_TRONG_NUOC ? 'bg-blue-500' :
                          category.type === CategoryType.SACH_NUOC_NGOAI ? 'bg-green-500' :
                          'bg-purple-500'
                        }`}>
                          {getCategoryTypeLabel(category.type)}
                        </span>
                      </td>
                    <td className="px-5 py-4 sm:px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setCurrentCategory(category);
                            setEditModalOpen(true);
                          }}
                          className="px-3 py-1 text-[12px] font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteCategory(category.id)
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

      {/* Popup Modals */}
      {isCreateModalOpen && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 z-10">
          <CategoryModal
            title="Create Category"
            onSubmit={handleCreateCategory}
            onClose={() => setCreateModalOpen(false)}
          />
        </div>
      )}

      {isEditModalOpen && currentCategory && (
        <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 z-10">
          <CategoryModal
            title="Edit Category"
            initialData={currentCategory}
            onSubmit={handleEditCategory}
            onClose={() => setEditModalOpen(false)}
          />
        </div>
      )}
    </main>
  );
};

const getCategoryTypeLabel = (type: CategoryType): string => {
  switch (type) {
    case CategoryType.SACH_TRONG_NUOC:
      return "Sách trong nước";
    case CategoryType.SACH_NUOC_NGOAI:
      return "Sách nước ngoài";
    case CategoryType.VAN_PHONG_PHAM:
      return "Văn phòng phẩm";
    default:
      return type; // Fallback nếu có giá trị mới
  }
};

interface CategoryModalProps {
  title: string;
  initialData?: Category;
  onSubmit : (Category : {
    categoryName : string;
    description : string;
    type : CategoryType;
  })=> void;
  onClose : () =>void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  title,
  initialData,
  onSubmit,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    categoryName: initialData?.categoryName || "",
    description: initialData?.description || "",
    type: initialData?.type || CategoryType.SACH_TRONG_NUOC
  });
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
            name="categoryName"
            value={formData.categoryName}
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
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2 text-sm text-gray-300 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(CategoryType).map((type) => (
              <option key={type as string} value={type as string}>
                {getCategoryTypeLabel(type as CategoryType)}
              </option>
            ))}
          </select>
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

export default ListCategories;