import React, { useState, useEffect } from "react";
import discountService from "../../services/discountService";
import { toast } from "sonner";
import { X, Search, Check } from "lucide-react";
import { productService } from "../../services/productService";

// Define the Product interface
interface Product {
  id: number;
  productName: string;
  price: number;
  imageUrl: string;
}

const CreateDiscount: React.FC = () => {
  const [code, setCode] = useState("");
  const [percentage, setPercentage] = useState<number | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // New states for product selection
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductSelector, setShowProductSelector] = useState(false);

  useEffect(() => {
    document.title = "Create Discount";
  }, []);

  // Fetch products when search term changes or product selector is opened
  useEffect(() => {
    if (showProductSelector) {
      fetchProducts();
    }
  }, [searchTerm, showProductSelector]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Assume productService has a method to search products
      const response = await productService.searchProducts(searchTerm);
      const productData = response;

      setProducts(productData);
      
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handlePercentageChange = (value: string) => {
    const parsedValue = value ? Number(value) : null;
    setPercentage(parsedValue);

    // If percentage has a value, clear amount
    if (parsedValue !== null) {
      setAmount(null);
    }
  };

  const handleAmountChange = (value: string) => {
    const parsedValue = value ? Number(value) : null;
    setAmount(parsedValue);

    // If amount has a value, clear percentage
    if (parsedValue !== null) {
      setPercentage(null);
    }
  };

  const toggleProductSelection = (product: Product) => {
    const isSelected = selectedProducts.some(p => p.id === product.id);
    
    if (isSelected) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== product.id));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const removeSelectedProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra nếu discountName không có giá trị
    if (!code.trim()) {
      toast.error("Discount name is required!");
      return;
    }

    // Kiểm tra nếu startDate không có giá trị
    if (!startDate) {
      toast.error("Start date is required!");
      return;
    }

    // Kiểm tra nếu endDate không có giá trị
    if (!endDate) {
      toast.error("End date is required!");
      return;
    }

    // Kiểm tra nếu endDate không nằm sau startDate
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error("End date must be after start date!");
      return;
    }

    // Kiểm tra nếu cả percentage và amount đều trống
    if (!percentage && !amount) {
      toast.error("You must provide either a discount percentage or a discount amount!");
      return;
    }

    try {
      const discountDTO = {
        discount_name: code,
        discount_percentage: percentage || null,
        discount_amount: amount || null,
        start_date: startDate,
        end_date: endDate,
        product_ids: selectedProducts.map(product => product.id),
      };

      // Gọi API tạo mã giảm giá
      await discountService.createDiscount(discountDTO);

      toast.success("Discount created successfully! Redirecting to the discount list...");

      // Chuyển hướng sau 3 giây
      // setTimeout(() => {
      //   window.location.href = "/admin/discounts";
      // }, 1000);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create discount!");
    }
  };

  return (
    <main className="bg-gray-900">
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 mb-15">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white/90">Create Discount</h2>
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
                  href="/admin/discounts"
                >
                  Discounts
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
              <li className="text-[0.875rem] text-white/90">Create Discount</li>
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
                Discount Name
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter discount code"
                required
              />
            </div>
            {amount === null && (
              <div className="mb-4">
                <label
                  htmlFor="percentage"
                  className="block text-sm font-medium text-gray-400"
                >
                  Discount Percentage
                </label>
                <input
                  type="number"
                  id="percentage"
                  value={percentage !== null ? percentage : ""}
                  onChange={(e) => handlePercentageChange(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter discount percentage"
                  required
                />
              </div>
            )}
            {percentage === null && (
              <div className="mb-4">
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-400"
                >
                  Discount Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount !== null ? amount : ""}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter discount amount"
                />
              </div>
            )}
            <div className="mb-4">
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-400"
              >
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
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-400"
              >
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

            {/* Product Selection Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-400">
                  Apply to Products
                </label>
                <button
                  type="button"
                  onClick={() => setShowProductSelector(!showProductSelector)}
                  className="px-3 py-1 text-xs font-medium text-blue-400 border border-blue-600 rounded-md hover:bg-blue-900/30"
                >
                  {showProductSelector ? "Hide Products" : "Select Products"}
                </button>
              </div>

              {/* Selected Products List */}
              {selectedProducts.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">
                    Selected Products ({selectedProducts.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProducts.map((product) => (
                      <div
                        key={`selected-${product.id}`}
                        className="flex items-center bg-gray-700 text-gray-200 text-sm rounded-md px-3 py-1"
                      >
                        <span className="truncate max-w-[150px] mr-1">
                          {product.productName}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeSelectedProduct(product.id)}
                          className="text-gray-400 hover:text-gray-200 ml-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Selector */}
              {showProductSelector && (
              <div className="border border-gray-700 rounded-lg p-4 mt-2 bg-gray-800/50">
                  <div className="relative mb-4">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search size={16} className="text-gray-500" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Search products by name..."
                      className="bg-gray-700 text-gray-200 border-gray-600 text-sm rounded-lg block w-full pl-10 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Product List */}
                  <div className="max-h-60 overflow-auto custom-scrollbar">
                    {loading && products.length === 0 ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      </div>
                    ) : products.length > 0 ? (
                      <ul className="divide-y divide-gray-700">
                        {products.map((product) => {
                          const isSelected = selectedProducts.some(p => p.id === product.id);
                          return (
                            <li 
                              key={product.id}
                              onClick={() => toggleProductSelection(product)}
                              className={`flex items-center py-2 px-1 cursor-pointer hover:bg-gray-700/50 ${
                                isSelected ? "bg-blue-800/30" : ""
                              }`}
                            >
                              <div className="flex-shrink-0 h-10 w-10 mr-3">
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.productName}
                                    className="h-10 w-10 object-cover rounded"
                                  />
                                ) : (
                                  <div className="h-10 w-10 bg-gray-700 rounded flex items-center justify-center text-gray-400">
                                    No img
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-200 truncate">
                                  {product.productName}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Price: {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                  }).format(product.price)}
                                </p>
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                {isSelected && (
                                  <Check size={18} className="text-blue-400" />
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : searchTerm && !loading ? (
                      <p className="text-center py-4 text-gray-400">No products found</p>
                    ) : null}

                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <a 
                href="/admin/discounts"
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </a>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500"
              >
                Create Discount
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default CreateDiscount;
