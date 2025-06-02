import React, { useState, useEffect } from "react";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { toast } from "sonner";
import apiClient from "../../services/apiClient";
import { Editor } from "@tinymce/tinymce-react";

const CreateOfficeSupply: React.FC = () => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [categoryId, setCategoryId] = useState<{ id: number; name: string }>({ id: 0, name: "" });
  const [supplierId, setSupplierId] = useState<{ id: number; name: string }>({ id: 0, name: "" });

  const [categories, setCategories] = useState<{ id: number; categoryName: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: number; supplierName: string }[]>([]);
  const [classify, setClassify] = useState("THIET_BI_DIEN_TU");

  const [isMainImageDragActive, setIsMainImageDragActive] = useState(false);
  const [isImagesDragActive, setIsImagesDragActive] = useState(false);

  const handleRemoveImageFile = (index: number) => {
    const updatedFiles = [...imageFiles];
    updatedFiles.splice(index, 1);
    setImageFiles(updatedFiles);
  };

  useEffect(() => {
    document.title = "Create Office Supply";

    // const fetchCategoriesAndSuppliers = async () => {
    //   try {
    //     const [categoriesResponse, suppliersResponse] = await Promise.all([
    //       apiClient.get("/categories"),
    //       apiClient.get("/suppliers"),
    //     ]);

    //     // Ensure categories is an array and filter by type for office supplies (VAN_PHONG_PHAM)
    //     let categoriesArray = [];

    //     if (Array.isArray(categoriesResponse.data)) {
    //       categoriesArray = categoriesResponse.data;
    //     } else if (categoriesResponse.data && typeof categoriesResponse.data === 'object') {
    //       // Try to find an array in the response
    //       if (Array.isArray(categoriesResponse.data.content)) {
    //         categoriesArray = categoriesResponse.data.content;
    //       } else if (Array.isArray(categoriesResponse.data.data)) {
    //         categoriesArray = categoriesResponse.data.data;
    //       } else if (categoriesResponse.data.result && Array.isArray(categoriesResponse.data.result.content)) {
    //         categoriesArray = categoriesResponse.data.result.content;
    //       } else {
    //         console.error("Categories data is not in expected format:", categoriesResponse.data);
    //         categoriesArray = [];
    //       }
    //     } else {
    //       console.error("Categories data is not in expected format:", categoriesResponse.data);
    //       categoriesArray = [];
    //     }

    //     // Filter categories by type for office supplies (VAN_PHONG_PHAM)
    //     const filteredCategories = categoriesArray.filter(
    //       (category) => category.categoryType === "VAN_PHONG_PHAM" || 
    //                     category.type === "VAN_PHONG_PHAM"
    //     );

    //     setCategories(filteredCategories);

    //     // Ensure suppliers is an array
    //     if (Array.isArray(suppliersResponse.data)) {
    //       setSuppliers(suppliersResponse.data);
    //     } else if (suppliersResponse.data && typeof suppliersResponse.data === 'object') {
    //       // Try to find an array in the response
    //       if (Array.isArray(suppliersResponse.data.content)) {
    //         setSuppliers(suppliersResponse.data.content);
    //       } else if (Array.isArray(suppliersResponse.data.data)) {
    //         setSuppliers(suppliersResponse.data.data);
    //       } else if (suppliersResponse.data.result && Array.isArray(suppliersResponse.data.result.content)) {
    //         setSuppliers(suppliersResponse.data.result.content);
    //       } else {
    //         console.error("Suppliers data is not in expected format:", suppliersResponse.data);
    //         setSuppliers([]);
    //       }
    //     } else {
    //       console.error("Suppliers data is not in expected format:", suppliersResponse.data);
    //       setSuppliers([]);
    //     }
    //   } catch (error) {
    //     console.error("Error fetching categories or suppliers:", error);
    //     alert("Failed to fetch categories or suppliers. Please try again.");
    //   }
    // };

    // fetchCategoriesAndSuppliers();
  }, []);

  // Async load options
  const loadCategoryOptions = async (inputValue: string) => {
    const res = await apiClient.get("/categories", { params: { categoryName: inputValue, page: 0 } });
    let arr: any[] = [];
    if (res.data?.result?.content) arr = res.data.result.content;
    else if (res.data?.content) arr = res.data.content;
    else if (Array.isArray(res.data)) arr = res.data;
    // Chỉ lấy VAN_PHONG_PHAM
    return arr
      .filter(
        (c) =>
          c.categoryType === "VAN_PHONG_PHAM" ||
          c.type === "VAN_PHONG_PHAM"
      )
      .map((c) => ({ value: c.id, label: c.categoryName }));
  };

  const loadSupplierOptions = async (inputValue: string) => {
    const res = await apiClient.get("/suppliers", { params: { supplierName: inputValue, page: 0 } });
    let arr: any[] = [];
    if (res.data?.result?.content) arr = res.data.result.content;
    else if (res.data?.content) arr = res.data.content;
    else if (Array.isArray(res.data)) arr = res.data;
    return arr.map((s) => ({ value: s.id, label: s.supplierName }));
  };

  // Drag & drop cho ảnh chính
  const handleMainImageDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsMainImageDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      const uploadedUrl = await uploadImage(file);
      setImageUrl(uploadedUrl);
    }
  };

  // Drag & drop cho ảnh thành phần
  const handleImagesDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsImagesDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setImageFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const toastId = toast.loading("Uploading image...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "kttkpm-preset-name");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dirhvdm9j/image/upload", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      toast.success("Image uploaded successfully!", { id: toastId });
      return data.secure_url;
    } catch (error) {
      toast.error("Failed to upload image.", { id: toastId });
      throw new Error("Failed to upload image.");
    }
  };

  const uploadVideo = async (file: File): Promise<string> => {
    const toastId = toast.loading("Uploading video...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "kttkpm-preset-name-video");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dirhvdm9j/video/upload", {
        method: "POST",
        body: formData
      });

      const data = await response.json();
      toast.success("Video uploaded successfully!", { id: toastId });
      return data.secure_url;
    } catch (error) {
      toast.error("Failed to upload video.", { id: toastId });
      console.error("Error uploading video:", error);
      throw new Error("Failed to upload video.");
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const toastId = toast.loading("Creating office supply...");

  try {
    // Use the already uploaded image URL
    const uploadedImageUrl = imageUrl;

    // Upload các ảnh thành phần
    const uploadedImageProducts = [];
    for (const file of imageFiles) {
      const uploadedUrl = await uploadImage(file);
      uploadedImageProducts.push({
        description: "Additional image",
        url: uploadedUrl,
      });
    }

    // Upload video nếu có
    if (videoFile) {
      const uploadedVideoUrl = await uploadVideo(videoFile);
      uploadedImageProducts.push({
        description: "Product video",
        url: uploadedVideoUrl,
      });
    }

    const newProduct = {
      productName,
      description,
      price,
      stockQuantity,
      imageUrl: uploadedImageUrl,
      category: { id: categoryId.id },
      supplier: { id: supplierId.id },
      imageProducts: uploadedImageProducts,
      classify,
    };

    await apiClient.post("/products/office-supplies", newProduct, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    toast.success("Office Supply created successfully!", { id: toastId });
    window.location.href = "/admin/products";
  } catch (error) {
    console.error("Error creating office supply:", error);
    toast.error("Failed to create office supply. Please try again.", { id: toastId });
  }
};

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const uploadedUrl = await uploadImage(file);
      setImageUrl(uploadedUrl);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  return (
    <main className="bg-gray-900">
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 mb-15">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white/90">Create Office Supply</h2>
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
                  Create Office Supplies
                </li>
              </ol>
            </nav>
        </div>
        <div className="pt-5">
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-xl border border-gray-800 bg-[#1f2636] p-6"
          >
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="productName" className="block text-sm font-medium text-gray-400">
                  Product Name
                </label>
                <input
                  type="text"
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="classify" className="block text-sm font-medium text-gray-400">
                  Classify
                </label>
                <select
                  id="classify"
                  value={classify}
                  onChange={(e) => setClassify(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="THIET_BI_DIEN_TU">Thiết bị điện tử</option>
                  <option value="DUNG_CU_HO_TRO">Dụng cụ hỗ trợ</option>
                </select>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-400">
                  Category
                </label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={loadCategoryOptions}
                  value={
                    categoryId && categoryId.id !== 0
                      ? { value: categoryId.id, label: categoryId.name }
                      : null
                  }
                  onChange={(option) =>
                    option
                      ? setCategoryId({ id: option.value, name: option.label })
                      : setCategoryId({ id: 0, name: "" })
                  }
                  placeholder="Search or select category"
                  isClearable
                  classNamePrefix="react-select"
                  className="mt-1 block w-full text-sm"
                  styles={customSelectStyles}
                  isMulti={false}
                />
              </div>

              <div>
                <label htmlFor="supplierId" className="block text-sm font-medium text-gray-400">
                  Supplier
                </label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={loadSupplierOptions}
                  value={
                    supplierId && supplierId.id !== 0
                      ? { value: supplierId.id, label: supplierId.name }
                      : null
                  }
                  onChange={(option) =>
                    option
                      ? setSupplierId({ id: option.value, name: option.label })
                      : setSupplierId({ id: 0, name: "" })
                  }
                  placeholder="Search or select supplier"
                  isClearable
                  classNamePrefix="react-select"
                  className="mt-1 block w-full text-sm"
                  styles={customSelectStyles}
                  isMulti={false}
                />
              </div>

            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="mb-4">
                <label htmlFor="price" className="block text-sm font-medium text-gray-400">
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  value={price || ""}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="stockQuantity" className="block text-sm font-medium text-gray-400">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  id="stockQuantity"
                  value={stockQuantity || ""}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

            </div>

            <div className="mb-4">
              <label htmlFor="imageFile" className="block text-sm font-medium text-gray-400">
                Main Image (imageUrl)
              </label>
              <div
                onDrop={handleMainImageDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsMainImageDragActive(true);
                }}
                onDragLeave={() => setIsMainImageDragActive(false)}
                className={`mt-1 block w-full px-4 py-8 text-sm text-gray-300 bg-gray-800 border-2 ${
                  isMainImageDragActive ? "border-blue-500" : "border-gray-700"
                } border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-col items-center justify-center cursor-pointer`}
              >
                <input
                  type="file"
                  id="imageFile"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {imageUrl && (
                <div className="mt-2">
                  <img src={imageUrl} alt="Main" className="w-32 h-32 object-cover rounded-lg" />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="imageFiles" className="block text-sm font-medium text-gray-400">
                Additional Images (imageProducts)
              </label>
              <div
                onDrop={handleImagesDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsImagesDragActive(true);
                }}
                onDragLeave={() => setIsImagesDragActive(false)}
                className={`mt-1 block w-full px-4 py-8 text-sm text-gray-300 bg-gray-800 border-2 ${
                  isImagesDragActive ? "border-blue-500" : "border-gray-700"
                } border-dashed rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex flex-col items-center justify-center cursor-pointer`}
              >
                <input
                  type="file"
                  id="imageFiles"
                  accept="image/*"
                  multiple
                  onChange={handleImageFilesChange}
                  className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-4">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Additional image ${index + 1}`}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImageFile(index)}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>


<div className="mb-4">
  <label htmlFor="videoFile" className="block text-sm font-medium text-gray-400">
    Upload Video
  </label>
  <input
    type="file"
    id="videoFile"
    accept="video/*"
    onChange={handleVideoFileChange}
    className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  {videoFile && (
    <div className="mt-2">
      <video
        src={URL.createObjectURL(videoFile)}
        controls
        className="w-64 h-36 rounded-lg"
      />
      <button
        type="button"
        onClick={() => setVideoFile(null)}
        className="mt-2 px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-500"
      >
        Remove Video
      </button>
    </div>
  )}
</div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-400">
                Description
              </label>
              <Editor
                id="description"
                value={description}
                apiKey="nxe8ac5qps6po2ar5ogqoajua9l730gmqorhemt25f6c57ip"
                onEditorChange={(content) => setDescription(content)}
                init={{
                  height: 200,
                  menubar: false,
                  skin: "oxide-dark",
                  content_css: "dark",
                  plugins: [
                    "lists", "link", "autolink", "paste"
                  ],
                  toolbar:
                    "undo redo | bold italic underline | bullist numlist | link | removeformat",
                  branding: false,
                }}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500"
              >
                Create Office Supply
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: "#1f2937", // bg-gray-800
    borderColor: "#374151",     // border-gray-700
    color: "#d1d5db",           // text-gray-300
    minHeight: "40px",
    boxShadow: state.isFocused ? "0 0 0 2px #3b82f6" : provided.boxShadow, // focus:ring-2 focus:ring-blue-500
    "&:hover": {
      borderColor: "#3b82f6",   // hover border blue
    },
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "#d1d5db", // text-gray-300
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "#1f2937", // bg-gray-800
    color: "#d1d5db",
    zIndex: 100,
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#2563eb" // bg-blue-600
      : state.isFocused
      ? "#374151" // bg-gray-700
      : "#1f2937", // bg-gray-800
    color: "#d1d5db",
    cursor: "pointer",
  }),
  input: (provided: any) => ({
    ...provided,
    color: "#d1d5db",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#9ca3af", // text-gray-400
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (provided: any, state: any) => ({
    ...provided,
    color: "#9ca3af",
    "&:hover": {
      color: "#3b82f6",
    },
  }),
  multiValue: (provided: any) => ({
    ...provided,
    backgroundColor: "#374151", // bg-gray-700
    borderRadius: "6px",
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: "#d1d5db", // text-gray-300
    fontWeight: 500,
    padding: "2px 6px",
  }),
  multiValueRemove: (provided: any) => ({
    ...provided,
    color: "#9ca3af",
    backgroundColor: "transparent",
    borderRadius: "6px",
    cursor: "pointer",
    ":hover": {
      backgroundColor: "#ef4444", // bg-red-500
      color: "#fff",
    },
  }),
};

export default CreateOfficeSupply;
