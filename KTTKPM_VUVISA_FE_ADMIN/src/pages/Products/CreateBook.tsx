import React, { useState, useEffect } from "react";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { toast } from "sonner";
import apiClient from "../../services/apiClient";

import { Editor } from "@tinymce/tinymce-react";

const CreateBook: React.FC = () => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null); // File ảnh chính
  const [imageUrl, setImageUrl] = useState(""); // URL ảnh chính sau khi upload
  const [imageFiles, setImageFiles] = useState<File[]>([]); // Các file ảnh thành phần
  const [videoFile, setVideoFile] = useState<File | null>(null); // File video

  const [categoryId, setCategoryId] = useState<{id: number, name: string}>({id: 0, name: ""});
  const [supplierId, setSupplierId] = useState<{id: number, name: string}>({id: 0, name: ""});
  const [publisherId, setPublisherId] = useState<{id: number, name: string}>({id: 0, name: ""});

  const [isbn, setIsbn] = useState("");
  const [publisherDate, setPublisherDate] = useState("");

  const [categories, setCategories] = useState<{ id: number; categoryName: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: number; supplierName: string }[]>([]);
  const [publishers, setPublishers] = useState<{ id: number; publisherName: string }[]>([]);

  const [isMainImageDragActive, setIsMainImageDragActive] = useState(false);
  const [isImagesDragActive, setIsImagesDragActive] = useState(false);

  const [currentAuthors, setCurrentAuthors] = useState<{ id: number; authorName: string }[]>([]);
  const [allAuthors, setAllAuthors] = useState<{ id: number; authorName: string }[]>([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState<string>("");

  const handleRemoveImageFile = (index: number) => {
    const updatedFiles = [...imageFiles];
    updatedFiles.splice(index, 1);
    setImageFiles(updatedFiles);
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

  const loadSupplierOptions = async (inputValue: string) => {
    const res = await apiClient.get("/suppliers", { params: { supplierName: inputValue, page: 0 } });
    let arr: any[] = [];
    if (res.data?.result?.content) arr = res.data.result.content;
    else if (res.data?.content) arr = res.data.content;
    else if (Array.isArray(res.data)) arr = res.data;
    return arr.map((s) => ({ value: s.id, label: s.supplierName }));
  };

  const loadCategoryOptions = async (inputValue: string) => {
    const res = await apiClient.get("/categories", { params: { categoryName: inputValue, page: 0 } });
    let arr: any[] = [];
    if (res.data?.result?.content) arr = res.data.result.content;
    else if (res.data?.content) arr = res.data.content;
    else if (Array.isArray(res.data)) arr = res.data;
    return arr
      .filter(
        (c) =>
          c.categoryType === "SACH_NUOC_NGOAI" ||
          c.categoryType === "SACH_TRONG_NUOC" ||
          c.type === "SACH_NUOC_NGOAI" ||
          c.type === "SACH_TRONG_NUOC"
      )
      .map((c) => ({ value: c.id, label: c.categoryName }));
  };

  const loadPublisherOptions = async (inputValue: string) => {
    const res = await apiClient.get("/publishers", { params: { publisherName: inputValue, page: 0 } });
    let arr: any[] = [];
    if (res.data?.result?.content) arr = res.data.result.content;
    else if (res.data?.content) arr = res.data.content;
    else if (res.data?.result) arr = res.data.result;
    else if (Array.isArray(res.data)) arr = res.data;
    return arr.map((p) => ({ value: p.id, label: p.publisherName }));
  };

  const loadAuthorOptions = async (inputValue: string) => {
    const res = await apiClient.get("/authors", { params: { authorName: inputValue, page: 0 } });
    let arr: any[] = [];
    if (res.data?.result?.content) arr = res.data.result.content;
    else if (res.data?.content) arr = res.data.content;
    else if (Array.isArray(res.data)) arr = res.data;
    // Lọc các author chưa được chọn
    return arr
      .filter((a) => !currentAuthors.some((ca) => ca.id === a.id))
      .map((a) => ({ value: a.id, label: a.authorName }));
  };

  useEffect(() => {
    document.title = "Create Book";
  }, []);

  // Hàm upload ảnh lên Cloudinary
  const uploadImage = async (file: File): Promise<string> => {
    const toastId = toast.loading("Uploading image...");
    const formData = new FormData();
    formData.append("file", file); // File ảnh
    formData.append("upload_preset", "kttkpm-preset-name"); // Preset name của Cloudinary

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dirhvdm9j/image/upload", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      toast.success("Image uploaded successfully!", { id: toastId });
      return data.secure_url; // Trả về URL ảnh sau khi upload
    } catch (error) {
      toast.error("Failed to upload image.", { id: toastId });
      throw new Error("Failed to upload image.");
    }
  };

    // Hàm upload video lên Cloudinary
    const uploadVideo = async (file: File): Promise<string> => {
      const toastId = toast.loading("Uploading video...");
      const formData = new FormData();
      formData.append("file", file); // File video
      formData.append("upload_preset", "kttkpm-preset-name-video"); // Preset name của Cloudinary

      try {
        const response = await fetch("https://api.cloudinary.com/v1_1/dirhvdm9j/video/upload", {
          method: "POST",
          body: formData
        });

        const data = await response.json();
        toast.success("Video uploaded successfully!", { id: toastId });
        return data.secure_url; // Trả về URL file sau khi upload
      } catch (error) {
        toast.error("Failed to upload video.", { id: toastId });
        throw new Error("Failed to upload file.");
      }
    };


    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const toastId = toast.loading("Creating book...");

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
          publisher: { id: publisherId.id },
          imageProducts: uploadedImageProducts,
          isbn,
          publisherDate,
          authors: currentAuthors.map((author) => ({ id: author.id })), // Gửi danh sách ID của tác giả
        };

        await apiClient.post("/products/books", newProduct, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        toast.success("Book created successfully!", { id: toastId });
        window.location.href = "/admin/products"; 
      } catch (error) {
        console.error("Error creating book:", error);
        toast.error("Failed to create book. Please try again.", { id: toastId });
      }
    };

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files)); // Lưu trữ các file ảnh thành phần
    }
  };

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file); // Lưu file ảnh chính
      const uploadedUrl = await uploadImage(file);
      setImageUrl(uploadedUrl); // Cập nhật URL ảnh chính
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]); // Lưu file video
    }
  };

  return (
    <main className="bg-gray-900">
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 mb-15">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white/90">Create Product</h2>
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
                  Create Book
                </li>
              </ol>
            </nav>
        </div>
        <div className="pt-5">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-gray-800 bg-[#1f2636] p-6"
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
                <label htmlFor="isbn" className="block text-sm font-medium text-gray-400">
                  ISBN
                </label>
                <input
                  type="text"
                  id="isbn"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  className="mt-1 block w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      : setCategoryId({ id: 0, name: "" })}
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

              <div>
                <label htmlFor="publisherId" className="block text-sm font-medium text-gray-400">
                  Publisher
                </label>
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={loadPublisherOptions}
                  value={
                    publisherId && publisherId.id !== 0
                      ? { value: publisherId.id, label: publisherId.name }
                      : null
                  }
                  onChange={(option) =>
                    option
                      ? setPublisherId({ id: option.value, name: option.label })
                      : setPublisherId({ id: 0, name: "" })
                  }
                  placeholder="Search or select publisher"
                  isClearable
                  classNamePrefix="react-select"
                  className="mt-1 block w-full text-sm"
                  styles={customSelectStyles}
                  isMulti={false}
                />
              </div>

            </div>

            <div className="mb-4">
              <label htmlFor="addAuthor" className="block text-sm font-medium text-gray-400">
                Author
              </label>
              <AsyncSelect
                cacheOptions
                defaultOptions
                loadOptions={loadAuthorOptions}
                value={currentAuthors.map((a) => ({ value: a.id, label: a.authorName }))}
                onChange={(options) => {
                  setCurrentAuthors(
                    Array.isArray(options)
                      ? options.map((opt) => ({ id: opt.value, authorName: opt.label }))
                      : []
                  );
                }}
                placeholder="Search or select author(s)"
                isClearable
                isMulti
                classNamePrefix="react-select"
                styles={customSelectStyles}
              />
            </div>
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
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

              <div>
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

              <div>
                <label htmlFor="publisherDate" className="block text-sm font-medium text-gray-400">
                  Publisher Date
                </label>
                <input
                  type="date"
                  id="publisherDate"
                  value={publisherDate}
                  onChange={(e) => setPublisherDate(e.target.value)}
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
                Create Product
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

export default CreateBook;
