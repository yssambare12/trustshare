import { useState, useEffect, useCallback } from "react";
import UserListModal from "./UserListModal";
import ExpiryDatePicker from "./ExpiryDatePicker";

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareLinks, setShareLinks] = useState({});
  const [messages, setMessages] = useState({});
  const [showUserModal, setShowUserModal] = useState(null);
  const [expiryDates, setExpiryDates] = useState({});
  const [showExpiryPicker, setShowExpiryPicker] = useState({});

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const userId = localStorage.getItem("userId");

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch(
        `${backendUrl}/files?userId=${userId}`
      );
      if (!response.ok) throw new Error("Failed to fetch files");
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, userId]);

  useEffect(() => {
    fetchFiles();
    const handleFileUploaded = () => fetchFiles();
    window.addEventListener("fileUploaded", handleFileUploaded);
    return () =>
      window.removeEventListener("fileUploaded", handleFileUploaded);
  }, [fetchFiles]);

  const setMessage = (fileId, type, text) => {
    setMessages((prev) => ({
      ...prev,
      [fileId]: { type, text },
    }));
  };

  const clearMessageAfterDelay = (fileId, delay = 3000) => {
    setTimeout(() => {
      setMessages((prev) => {
        const updated = { ...prev };
        delete updated[fileId];
        return updated;
      });
    }, delay);
  };

  const handleShareSuccess = (message, fileId) => {
    setMessage(fileId, "success", message);
    clearMessageAfterDelay(fileId);
  };

  const handleGenerateLink = async (fileId) => {
    try {
      const requestBody = { fileId };
      if (expiryDates[fileId]) {
        requestBody.expiresAt = expiryDates[fileId].toISOString();
      }

      const response = await fetch(`${backendUrl}/share-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          fileId,
          "error",
          data.error || "Failed to generate link"
        );
        return;
      }

      const link = `${window.location.origin}/file/${data.token}`;
      setShareLinks((prev) => ({ ...prev, [fileId]: link }));
      setMessage(fileId, "success", "Share link generated!");
      setShowExpiryPicker((prev) => ({ ...prev, [fileId]: false }));
    } catch {
      setMessage(fileId, "error", "Network error");
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(
        `${backendUrl}/download/${fileId}?userId=${userId}`
      );

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 410 || error.expired) {
          alert("This file share has expired and is no longer accessible.");
        } else {
          alert(error.error || "Download failed");
        }
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert("Network error during download");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString();

  const formatExpiry = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (date < new Date()) return "Expired";
    return `Expires: ${date.toLocaleDateString()} at ${date.toLocaleTimeString(
      [],
      { hour: "2-digit", minute: "2-digit" }
    )}`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
          Your Files
        </h2>
        <p className="text-gray-500">Loading files...</p>
      </div>
    );
  }

  if (!files.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
          Your Files
        </h2>
        <p className="text-gray-500">
          No files uploaded yet. Upload your first file above!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
        Your Files
      </h2>

      <div className="space-y-4">
        {files.map((file) => {
          const link = shareLinks[file._id];
          const message = messages[file._id];

          return (
            <div
              key={file._id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 sm:space-x-4 mb-3">
                <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <svg
                    className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    {file.originalName}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {formatSize(file.size)} •{" "}
                    {formatDate(file.createdAt)}
                    {file.expiresAt && (
                      <span
                        className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                          file.isExpired
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {file.isExpired
                          ? "Expired"
                          : formatExpiry(file.expiresAt)}
                      </span>
                    )}
                  </p>
                </div>

                <button
                  onClick={() =>
                    handleDownload(file._id, file.originalName)
                  }
                  className="px-3 sm:px-4 cursor-pointer py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap flex items-center space-x-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span>Download</span>
                </button>
              </div>

              <div className="mb-3">
                <button
                  onClick={() =>
                    setShowUserModal({
                      id: file._id,
                      name: file.originalName,
                    })
                  }
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center space-x-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={file.isExpired}
                >
                  <span>
                    {file.isExpired
                      ? "Cannot Share (Expired)"
                      : "Share with User"}
                  </span>
                </button>
              </div>

              {!link && !file.shareToken && (
                <div className="mb-3">
                  <button
                    onClick={() =>
                      setShowExpiryPicker((prev) => ({
                        ...prev,
                        [file._id]: !prev[file._id],
                      }))
                    }
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium border border-gray-300"
                  >
                    {showExpiryPicker[file._id]
                      ? "Hide"
                      : "Set"}{" "}
                    Link Expiry
                  </button>

                  {showExpiryPicker[file._id] && (
                    <div className="mt-3">
                      <ExpiryDatePicker
                        onDateSelect={(date) =>
                          setExpiryDates((prev) => ({
                            ...prev,
                            [file._id]: date,
                          }))
                        }
                        selectedDate={expiryDates[file._id]}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="mb-3">
                <button
                  onClick={() =>
                    handleGenerateLink(file._id)
                  }
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={file.isExpired}
                >
                  Generate Share Link
                </button>
              </div>

              {link && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-700 mb-2 font-medium">
                    Share Link:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={link}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm"
                    />
                    <button
                      onClick={() =>
                        copyToClipboard(link)
                      }
                      className="px-3 sm:px-4 cursor-pointer py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm whitespace-nowrap"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              {message && (
                <div
                  className={`p-3 rounded-lg text-xs sm:text-sm ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showUserModal && (
        <UserListModal
          fileId={showUserModal.id}
          fileName={showUserModal.name}
          onClose={() => setShowUserModal(null)}
          onShareSuccess={(msg) =>
            handleShareSuccess(msg, showUserModal.id)
          }
        />
      )}
    </div>
  );
};

export default FileList;
