import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AsyncSelect from "react-select/async";
import { toast } from "sonner";
import apiClient from "../../services/apiClient";
import { Editor } from "@tinymce/tinymce-react";

const EditOfficeSupply: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();


  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0)
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [categoryId, setCategoryId] = useState<{ id: number; name: string }>({ id: 0, name: "" });
  const [supplierId, setSupplierId] = useState<{ id: number; name: string }>({ id: 0, name: "" });

  const [classify, setClassify] = useState("THIET_BI_DIEN_TU");
  const [imageProducts, setImageProducts] = useState<{ description: string; url: string }[]>([]);

  const [isMainImageDragActive, setIsMainImageDragActive] = useState(false);
  const [isImagesDragActive, setIsImagesDragActive] = useState(false);

  // Async load options
  const loadCategoryOptions = async (inputValue: string) => {
    const res = await apiClient.get("/categories", { params: { categoryName: inputValue, page: 0 } });
    let arr: any[] = [];
    if (res.data?.result?.content) arr = res.data.result.content;
    else if (res.data?.content) arr = res.data.content;
    else if (Array.isArray(res.data)) arr = res.data;
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


  
  // const handleRemoveImageFromAPI = (index: number) => {
  //   const updatedImages = [...imageProducts];
  //   updatedImages.splice(index, 1);
  //   setImageProducts(updatedImages);
  // };

  // const handleRemoveNewImage = (index: number) => {
  //   const updatedFiles = [...imageFiles];
  //   updatedFiles.splice(index, 1);
  //   setImageFiles(updatedFiles);
  // };

  useEffect(() => {
    document.title = "Edit Office Supply";

    const fetchData = async () => {
      const toastId = toast.loading("Loading office supply...");
      try {
        const res = await apiClient.get(`/products/office-supplies/${id}`);
        const product = res.data;
        setProductName(product.productName);
        setDescription(product.description);
        setPrice(product.price);
        setStockQuantity(product.stockQuantity);
        setImageUrl(product.imageUrl);
        setCategoryId({ id: product.category.id, name: product.category.categoryName });
        setSupplierId({ id: product.supplier.id, name: product.supplier.supplierName });
        setClassify(product.classify);
        
        const images = (product.imageProducts || []).filter(
          (item: { url: string }) => !item.url.endsWith(".mp4")
        );
        const video = (product.imageProducts || []).find(
          (item: { url: string }) => item.url.endsWith(".mp4")
        );
        setImageProducts(images);
        setVideoFile(video || null);

        toast.success("Loaded office supply!", { id: toastId });
      } catch (error) {
        toast.error("Failed to load office supply.", { id: toastId });
      }
    };
    fetchData();
  }, [id]);


    // Hàm upload ảnh lên Cloudinary
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

  // Hàm upload video lên Cloudinary
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
      throw new Error("Failed to upload video.");
    }
  };

  const uploadImageFromUrl = async (imageUrl: string): Promise<string> => {
    const toastId = toast.loading("Uploading image from URL...");
    const formData = new FormData();
    formData.append("file", imageUrl);
    formData.append("upload_preset", "kttkpm-preset-name");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dirhvdm9j/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      toast.success("Image uploaded from URL successfully!", { id: toastId });
      return data.secure_url;
    } catch (error) {
      toast.error("Failed to upload image from URL.", { id: toastId });
      throw new Error("Failed to upload image from URL.");
    }
  };

  const uploadVideoFromUrl = async (videoUrl: string): Promise<string> => {
    const toastId = toast.loading("Uploading video from URL...");
    const formData = new FormData();
    formData.append("file", videoUrl);
    formData.append("upload_preset", "kttkpm-preset-name-video");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dirhvdm9j/video/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      toast.success("Video uploaded from URL successfully!", { id: toastId });
      return data.secure_url;
    } catch (error) {
      toast.error("Failed to upload video from URL.", { id: toastId });
      throw new Error("Failed to upload video from URL.");
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Updating office supply...");

    try {
      // Upload ảnh chính nếu có thay đổi
      let uploadedImageUrl = "";
      if (imageFile) {
        uploadedImageUrl = await uploadImage(imageFile);
        setImageUrl(uploadedImageUrl);
      } else{
        uploadedImageUrl = await uploadImageFromUrl(imageUrl);
        setImageUrl(uploadedImageUrl);
      }

    // Upload các ảnh mới
    const uploadedImageProducts = [...imageProducts];

    // Upload video mới nếu có

    if (videoFile instanceof File) {
      const uploadedVideoUrl = await uploadVideo(videoFile);

      // Thêm hoặc cập nhật video mới vào uploadedImageProducts
      const videoIndex = uploadedImageProducts.findIndex((item) => item.url.endsWith(".mp4"));
      if (videoIndex !== -1) {
        // Nếu đã có video cũ, cập nhật URL
        uploadedImageProducts[videoIndex].url = uploadedVideoUrl;
      } else {
        // Nếu không có video cũ, thêm mới
        uploadedImageProducts.push({
          description: "Product video",
          url: uploadedVideoUrl,
        });
      }
    } else {
      // Nếu không chọn file video mới
      const videoIndex = uploadedImageProducts.findIndex((item) => item.url.endsWith(".mp4"));
      if (videoIndex !== -1) {
        // Nếu có video cũ, upload lại video cũ để lấy URL mới
        const uploadedVideoUrl = await uploadVideoFromUrl(uploadedImageProducts[videoIndex].url);
        uploadedImageProducts[videoIndex].url = uploadedVideoUrl; // Cập nhật URL mới
      }
    }

      // Upload lại các ảnh trong uploadedImageProducts để lấy URL mới
      for (let i = 0; i < uploadedImageProducts.length; i++) {
        const image = uploadedImageProducts[i];
        if (!image.url.endsWith(".mp4")) { // Chỉ upload lại ảnh, bỏ qua video
          const newUrl = await uploadImageFromUrl(image.url);
          uploadedImageProducts[i].url = newUrl; // Cập nhật URL mới
        }
      }

        // Upload các file ảnh mới từ imageFiles
        for (const file of imageFiles) {
          const uploadedUrl = await uploadImage(file);
          uploadedImageProducts.push({
            description: "Additional image",
            url: uploadedUrl,
          });
        }

      // Chuẩn bị dữ liệu để gửi
      const updatedProduct = {
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

      // Gửi dữ liệu cập nhật
      await apiClient.put(`/products/office-supplies/${id}`, updatedProduct, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      toast.success("Office Supply updated successfully!", { id: toastId });
      navigate("/admin/products");
    } catch (error) {
      toast.error("Failed to update office supply. Please try again.", { id: toastId });
    }
  };


  const handleRemoveImageFile = (index: number) => {
    const updatedFiles = [...imageFiles];
    updatedFiles.splice(index, 1);
    setImageFiles(updatedFiles);
  };

  const handleRemoveImageProduct = (index: number) => {
    const updated = [...imageProducts];
    updated.splice(index, 1);
    setImageProducts(updated);
  };


  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file); // Lưu file ảnh chính
      setImageUrl(URL.createObjectURL(file)); // Tạo URL tạm thời để xem trước
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newVideoFile = e.target.files[0];

      // Tìm và xóa video cũ trong imageProducts
      const updatedImageProducts = imageProducts.filter(
        (item) => !item.url.endsWith(".mp4")
      );

      // Cập nhật lại danh sách imageProducts
      setImageProducts(updatedImageProducts);

      // Lưu video mới vào state
      setVideoFile(newVideoFile);
    }
  };

  // Tách video và ảnh từ imageProducts
const videoProduct = imageProducts.find((item) => item.url.endsWith(".mp4"));
const imageOnlyProducts = imageProducts.filter((item) => !item.url.endsWith(".mp4"));


  return (
    <main className="bg-gray-900">
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 mb-15">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white/90">Edit Office Supply</h2>
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
                  Edit Office Supplies
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
                  className="hidden"
                />
                <span>Kéo & thả ảnh vào đây hoặc click để chọn ảnh</span>
                {imageUrl && (
                  <div className="mt-2">
                    <img src={imageUrl} alt="Main" className="w-32 h-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>
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
      className="hidden"
    />
    <span>Kéo & thả nhiều ảnh vào đây hoặc click để chọn ảnh</span>
    <div className="mt-2 flex flex-wrap gap-4">
      {imageOnlyProducts.map((item, index) => (
        <div key={index} className="relative">
          <img
            src={item.url}
            alt={item.description}
            className="w-32 h-32 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={() => handleRemoveImageProduct(index)}
            className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
          >
            &times;
          </button>
        </div>
      ))}
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
  {(videoFile || videoProduct) && (
    <div className="mt-2">
      <video
        src={
          videoFile
            ? videoFile instanceof File
              ? URL.createObjectURL(videoFile)
              : (videoFile as any).url
            : videoProduct?.url
        }
        controls
        className="w-64 h-36 rounded-lg"
      />
      <button
        type="button"
        onClick={() => {
          setVideoFile(null);
          // Xóa video khỏi imageProducts nếu là video cũ
          if (videoProduct) {
            setImageProducts(imageOnlyProducts);
          }
        }}
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
                Update Office Supply
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

export default EditOfficeSupply;
