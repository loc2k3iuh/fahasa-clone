import React, { useEffect, useState } from "react";
import apiClient from "../../services/apiClient";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Product {
  id: number;
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  imageUrl: string;
  category: {
    id: number;
    categoryName: string;
    description: string;
  };
  supplier: {
    id: number;
    supplierName: string | null;
    description: string | null;
  };
  imageProducts: {
    id: number;
    description: string;
    url: string;
  }[];
  discounts: unknown[];
  vouchers: unknown[];
  isbn?: string; // Chỉ có ở Books
  publisherDate?: number; // Chỉ có ở Books
  publisher?: {
    id: number;
    publisherName: string;
    description: string;
  }; // Chỉ có ở Books
  classify?: string; // Chỉ có ở Office Supplies
}

const fetchProductsApi = async (
  activeTab: "books" | "office-supplies",
  currentPage: number,
  itemsPerPage: number,
  searchTerm: string
) => {
  const toastId = toast.loading("Loading products...");
  try {
    const endpoint =
      activeTab === "books"
        ? "/products/books/page"
        : "/products/office-supplies/page";
    const params: Record<string, string | number> = {
      page: currentPage,
      size: itemsPerPage,
    };
    if (searchTerm.trim()) params.productName = searchTerm.trim();
    const response = await apiClient.get(endpoint, { params });

    let products: Product[] = [];
    let totalItems = 0;
    let totalPages = 1;

    if (Array.isArray(response.data)) {
      products = response.data;
      totalItems = response.data.length;
    } else if (response.data && response.data.content) {
      products = response.data.content || [];
      totalItems = response.data.totalElements || 0;
      totalPages = response.data.totalPages || 0;
    } else if (response.data && response.data.data) {
      if (Array.isArray(response.data.data)) {
        products = response.data.data;
        totalItems = response.data.data.length;
      } else if (response.data.data.content) {
        products = response.data.data.content || [];
        totalItems = response.data.data.totalElements || 0;
        totalPages = response.data.data.totalPages || 0;
      }
    } else if (response.data && response.data.result && response.data.result.content) {
      products = response.data.result.content || [];
      totalItems = response.data.result.totalElements || products.length || 0;
      totalPages = response.data.result.totalPages || 1;
    }
    toast.success("Products loaded successfully!", { id: toastId });
    return { products, totalItems, totalPages };
  } catch (error) {
    toast.error("Failed to fetch products. Please try again.", { id: toastId });
    throw error;
  }
};

const ListProduct: React.FC = () => {
    // const [products, setProducts] = useState<Product[]>([]);
    // const [currentPage, setCurrentPage] = useState(0);
    // const [activeTab, setActiveTab] = useState<"books" | "office-supplies">("books");
    // const [itemsPerPage, setItemsPerPage] = useState(10);
    // const [totalItems, setTotalItems] = useState(0);
    // const [totalPages, setTotalPages] = useState(0);
    // const [searchTerm, setSearchTerm] = useState("");

    const [currentPage, setCurrentPage] = useState(0);
    const [activeTab, setActiveTab] = useState<"books" | "office-supplies">("books");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const queryClient = useQueryClient();

    // Query for products
    const { data, isLoading } = useQuery({
      queryKey: ["products", activeTab, currentPage, itemsPerPage, searchTerm],
      queryFn: () => fetchProductsApi(activeTab, currentPage, itemsPerPage, searchTerm),
      placeholderData: (previousData) => previousData,
    });

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    useEffect(() => {
        document.title = "Product List";

    }, []);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const toastId = toast.loading("Deleting product...");
      try {
        const endpoint =
          activeTab === "books"
            ? `/products/books/${id}`
            : `/products/office-supplies/${id}`;
        await apiClient.delete(endpoint);
        toast.success("Product deleted successfully!", { id: toastId });
        return id;
      } catch (error) {
        toast.error("Failed to delete product. Please try again.", { id: toastId });
        throw error;
      }
    },
    onSuccess: (deletedId) => {
      // Cập nhật cache trực tiếp
      queryClient.setQueryData(["products", activeTab, currentPage, itemsPerPage, searchTerm], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          products: old.products.filter((product: Product) => product.id !== deletedId),
          totalItems: old.totalItems - 1,
        };
      });
    },
  });

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
      deleteMutation.mutate(id);
    }
  };

  const handlePageChange = (page: number) => {
      setCurrentPage(page);
  };

  const handleItemsPerPageChange = (size: number) => {
      setItemsPerPage(size);
      setCurrentPage(0);
  };

  const products = data?.products || [];
  const totalItems = data?.totalItems || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <main className="bg-gray-900">
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 mb-15">
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-white/90">Products</h2>
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
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    className="inline-flex items-center gap-1.5 text-[0.875rem] text-gray-500 dark:text-gray-400"
                    href="/admin/products"
                  >
                    Products
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
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  </a>
                </li>
                <li className="text-[0.875rem] text-white/90">
                  {activeTab === "books" ? "Books" : "Office Supplies"}
                </li>
              </ol>
            </nav>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-700">
              <nav className="-mb-px flex">
                <button
                  onClick={() => {
                    setActiveTab("books");
                    setCurrentPage(0); // Reset to first page when switching tabs
                  }}
                  className={`py-3 px-6 text-sm font-medium border-b-2 flex-1 ${
                    activeTab === "books"
                      ? "border-blue-500 text-blue-500"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                  } transition-colors duration-200`}
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                    Books
                  </div>
                </button>
                <button
                  onClick={() => {
                    setActiveTab("office-supplies");
                    setCurrentPage(0); // Reset to first page when switching tabs
                  }}
                  className={`py-3 px-6 text-sm font-medium border-b-2 flex-1 ${
                    activeTab === "office-supplies"
                      ? "border-blue-500 text-blue-500"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                  } transition-colors duration-200`}
                >
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                    </svg>
                    Office Supplies
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* Search and Create Controls */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-200 px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-theme-xs ring-1 transition bg-blue-600 text-white ring-blue-700 hover:bg-blue-700 cursor-pointer w-68"
              >
                {/*{activeTab === "books" ? "Create Book" : "Create Office Supply"}*/}
                  {activeTab === "books" ? "Create Product" : "Create Product"}
                <svg
                  className={`w-4 h-4 transform transition-transform ${
                    isDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-68 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
                  <a
                    href="/admin/products/create-book"
                    className={`block px-4 py-2 text-sm ${activeTab === "books" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
                  >
                    Create Book
                  </a>
                  <a
                    href="/admin/products/create-office-supply"
                    className={`block px-4 py-2 text-sm ${activeTab === "office-supplies" ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}
                  >
                    Create Office Supply
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-5">
          <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#1f2636]">
            <div className="max-w-full overflow-x-auto">
              <table className="min-w-full">

<thead>
  <tr>
    <th className="px-5 py-3 hidden sm:table-cell sm:px-6 w-[130px] text-center">
      <div className="flex items-center justify-center">
        <p className="font-medium text-[12px] leading-[12px] text-gray-400">Image</p>
      </div>
    </th>
    <th className="px-5 py-3 sm:px-6 text-left">
      <div className="flex items-center">
        <p className="font-medium text-[12px] leading-[12px] text-gray-400">Name</p>
      </div>
    </th>
    <th className="px-5 py-3 sm:px-6 text-center">
      <div className="flex items-center justify-center">
        <p className="font-medium text-[12px] leading-[12px] text-gray-400">Price</p>
      </div>
    </th>
    <th className="px-5 py-3 sm:px-6 text-center">
      <div className="flex items-center justify-center">
        <p className="font-medium text-[12px] leading-[12px] text-gray-400">Stock Quantity</p>
      </div>
    </th>
    <th className="px-5 py-3 sm:px-6 text-center">
      <div className="flex items-center justify-center">
        <p className="font-medium text-[12px] leading-[12px] text-gray-400">Category</p>
      </div>
    </th>
    <th className="px-5 py-3 sm:px-6 text-center">
      <div className="flex items-center justify-center">
        <p className="font-medium text-[12px] leading-[12px] text-gray-400">Supplier</p>
      </div>
    </th>
    {activeTab === "books" && (
      <>
        <th className="px-5 py-3 sm:px-6 text-center">
          <div className="flex items-center justify-center">
            <p className="font-medium text-[12px] leading-[12px] text-gray-400">ISBN</p>
          </div>
        </th>
        <th className="px-5 py-3 sm:px-6 text-center">
          <div className="flex items-center justify-center">
            <p className="font-medium text-[12px] leading-[12px] text-gray-400">Publisher</p>
          </div>
        </th>
      </>
    )}
    {activeTab === "office-supplies" && (
      <th className="px-5 py-3 sm:px-6 text-center">
        <div className="flex items-center justify-center">
          <p className="font-medium text-[12px] leading-[12px] text-gray-400">Classify</p>
        </div>
      </th>
    )}
    <th className="px-5 py-3 sm:px-6 text-right">
      <div className="flex items-center justify-end">
        <p className="font-medium text-[12px] leading-[12px] text-gray-400">Tools</p>
      </div>
    </th>
  </tr>
</thead>
<tbody className="divide-y divide-gray-800">
  {(products || []).map((product) => (
    <tr key={product.id}>
      <td className="px-5 hidden sm:table-cell py-4 sm:px-6 text-center">
        <div className="flex items-center justify-center">
          <img src={product.imageUrl} alt={product.productName} className="w-[80px]" />
        </div>
      </td>
      <td className="px-5 py-4 sm:px-6 text-left">
        <div className="flex items-center">
          <a
            className="text-gray-400 hover:text-blue-400 duration-300 text-[14px] leading-[20px] flex items-center group"
            href={`/admin/products/${product.id}/${activeTab === "books" ? "edit-book" : "edit-office-supply"}`}
          >
            <span className="mr-1">{product.productName}</span>
            <svg 
              className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </a>
        </div>
      </td>
      <td className="px-5 py-4 sm:px-6 text-center">
        <div className="flex items-center justify-center">
          <span className="text-gray-400">{product.price.toLocaleString()} VND</span>
        </div>
      </td>
      <td className="px-5 py-4 sm:px-6 text-center">
        <div className="flex items-center justify-center">
          <span className="text-gray-400">{product.stockQuantity}</span>
        </div>
      </td>
      <td className="px-5 py-4 sm:px-6 text-center">
        <div className="flex items-center justify-center">
          <span className="text-gray-400">{product.category.categoryName}</span>
        </div>
      </td>
      <td className="px-5 py-4 sm:px-6 text-center">
        <div className="flex items-center justify-center">
          <span className="text-gray-400">{product.supplier?.supplierName || "N/A"}</span>
        </div>
      </td>
      {activeTab === "books" && (
        <>
          <td className="px-5 py-4 sm:px-6 text-center">
            <div className="flex items-center justify-center">
              <span className="text-gray-400">{product.isbn || "N/A"}</span>
            </div>
          </td>
          <td className="px-5 py-4 sm:px-6 text-center">
            <div className="flex items-center justify-center">
              <span className="text-gray-400">{product.publisher?.publisherName || "N/A"}</span>
            </div>
          </td>
        </>
      )}
      {activeTab === "office-supplies" && (
        <td className="px-5 py-4 sm:px-6 text-center">
          <div className="flex items-center justify-center">
            <span className="text-gray-400">{product.classify || "N/A"}</span>
          </div>
        </td>
      )}
      <td className="px-5 py-4 sm:px-6 text-right">
        <div className="flex items-center justify-end space-x-2">
          <a
            href={`/admin/products/${product.id}/${
              activeTab === "books" ? "edit-book" : "edit-office-supply"
            }`}
            className="px-3 py-1 text-[12px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 flex items-center"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
            Edit
          </a>
          <button
            onClick={() => handleDelete(product.id)}
            className="px-3 py-1 text-[12px] font-medium text-white bg-red-700 rounded-lg hover:bg-red-500 flex items-center"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
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
          <div className="flex flex-col md:flex-row justify-between items-center mt-6 space-y-4 md:space-y-0">
            <div className="flex items-center">
              <span className="text-gray-400 mr-2">Showing</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-2 py-1 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="text-gray-400 mx-2">of</span>
              <span className="text-gray-300 font-medium">{totalItems}</span>
              <span className="text-gray-400 ml-2">{activeTab === "books" ? "books" : "office supplies"}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0}
                className="px-2 py-1 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center"
                title="First Page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
                </svg>
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-3 py-1 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Previous
              </button>

              <div className="flex items-center px-3 py-1 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg">
                <span>Page</span>
                <span className="mx-1 font-medium text-white">{currentPage + 1}</span>
                <span>of</span>
                <span className="mx-1 font-medium text-white">{totalPages || 1}</span>
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1 || totalPages === 0}
                className="px-3 py-1 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center"
              >
                Next
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
              <button
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={currentPage === totalPages - 1 || totalPages === 0}
                className="px-2 py-1 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center"
                title="Last Page"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ListProduct;
