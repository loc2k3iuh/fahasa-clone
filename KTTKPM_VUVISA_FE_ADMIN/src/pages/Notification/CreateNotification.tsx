import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Editor } from "@tinymce/tinymce-react";
import { notificationService } from "../../services/notificationService";
import { FiAlertCircle, FiSend } from "react-icons/fi";

const CreateNotification: React.FC = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    document.title = "Create Notification";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a notification title");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a notification message");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Sending notification to all users...");

    try {
      const response = await notificationService.sendToAllUsers({
        title,
        message,
      });

      toast.success(`Notification sent to ${response.result} users!`, { id: toastId });
      setTitle("");
      setMessage("");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification. Please try again.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePreview = () => {
    setPreviewVisible(!previewVisible);
  };

  return (
    <main className="bg-gray-900">
      <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6 mb-15">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white/90">Create Notification</h2>
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
              <li className="text-[0.875rem] text-white/90">
                Create Notification
              </li>
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Notification Form */}
          <div className="md:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="rounded-xl border border-gray-800 bg-[#1f2636] p-6"
            >
              <div className="mb-5">
                <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">
                  Notification Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full px-4 py-2 text-gray-300 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notification title"
                  required
                />
              </div>

              <div className="mb-5">
                <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-1">
                  Notification Message
                </label>
                <Editor
                  id="message"
                  value={message}
                  apiKey="nxe8ac5qps6po2ar5ogqoajua9l730gmqorhemt25f6c57ip"
                  onEditorChange={(content) => setMessage(content)}
                  init={{
                    height: 300,
                    menubar: false,
                    skin: "oxide-dark",
                    content_css: "dark",
                    plugins: [
                      "lists", "link", "autolink", "paste", "help", "wordcount", "code"
                    ],
                    toolbar:
                      "undo redo | formatselect | bold italic underline | bullist numlist | link | alignleft aligncenter alignright | code | removeformat",
                    branding: false,
                  }}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex items-center">
                  <FiAlertCircle className="text-yellow-400 mr-2" size={20} />
                  <span className="text-sm text-gray-400">
                    This notification will be sent to all registered users.
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={togglePreview}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    {previewVisible ? "Hide Preview" : "Show Preview"}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                  >
                    <FiSend className="mr-2" />
                    {isSubmitting ? "Sending..." : "Send Notification"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Preview and Tips */}
          <div className="md:col-span-1">
            {previewVisible && (
              <div className="rounded-xl border border-gray-800 bg-[#1f2636] p-6 mb-6">
                <h3 className="text-lg font-medium text-white/90 mb-3">Preview</h3>
                <div className="border border-gray-700 rounded-lg p-4 bg-gray-800">
                  <h4 className="text-base font-semibold text-white/90 mb-2">
                    {title || "Notification Title"}
                  </h4>
                  <div 
                    className="text-sm text-gray-300 prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: message || "<p>Your notification message will appear here.</p>" 
                    }} 
                  />
                </div>
              </div>
            )}

            <div className="rounded-xl border border-gray-800 bg-[#1f2636] p-6">
              <h3 className="text-lg font-medium text-white/90 mb-3">Tips</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Keep notification titles short and descriptive.
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Use formatting to highlight important information.
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Include relevant links when necessary.
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Avoid sending too many notifications in a short period.
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Preview your notification before sending to ensure it looks good.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CreateNotification;