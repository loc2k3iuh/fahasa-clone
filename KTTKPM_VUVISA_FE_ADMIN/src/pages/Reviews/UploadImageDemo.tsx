import React, { useState } from "react";
import axios from "axios";

const UploadImage: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageFile(file || null);
    setUploadedUrl(null); // reset when new file selected
  };

  const handleUpload = async () => {
    if (!imageFile) return;

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      setUploading(true);
      const response = await axios.post("/api/images/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadedUrl(response.data.data.link);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Image upload failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="bg-gray-900">
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 mb-15">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white/90">Upload Image</h2>
          <nav>
            <ol className="flex items-center gap-1.5">
              <li>
                <a
                  className="inline-flex items-center gap-1.5 text-[0.875rem] text-gray-500"
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
                    />
                  </svg>
                </a>
              </li>
              <li className="text-[0.875rem] text-white/90">Upload</li>
            </ol>
          </nav>
        </div>

        <div className="pt-5">
          <div className="p-6 border border-gray-800 bg-[#1f2636] rounded-xl">
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Select an image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-400 file:bg-gray-700 file:text-gray-300 file:border-none file:px-4 file:py-2 file:rounded-lg file:cursor-pointer hover:file:bg-gray-600"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={!imageFile || uploading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>

            {uploadedUrl && (
              <div className="mt-6">
                <h4 className="text-sm text-gray-300 mb-2">Uploaded Image:</h4>
                <img
                  src={uploadedUrl}
                  alt="Uploaded"
                  className="rounded-lg shadow-lg max-w-xs"
                />
                <p className="mt-2 text-sm text-blue-400">
                  <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
                    {uploadedUrl}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default UploadImage;
