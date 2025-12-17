import { useState } from "react";

function UploadSection() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [uploadProgress, setUploadProgress] = useState({});

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      setMessage({ type: "", text: "" });
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setMessage({ type: "error", text: "Please select at least one file" });
      return;
    }

    setUploading(true);
    setMessage({ type: "", text: "" });
    const progress = {};
    selectedFiles.forEach((_, index) => {
      progress[index] = 0;
    });
    setUploadProgress(progress);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      try {
        setUploadProgress(prev => ({ ...prev, [i]: 50 }));

        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", localStorage.getItem("userId"));

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/upload`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          successCount++;
          setUploadProgress(prev => ({ ...prev, [i]: 100 }));
        } else {
          failCount++;
          setUploadProgress(prev => ({ ...prev, [i]: -1 }));
        }
      } catch (error) {
        failCount++;
        setUploadProgress(prev => ({ ...prev, [i]: -1 }));
      }
    }

    if (successCount > 0) {
      setMessage({
        type: "success",
        text: `${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully!${failCount > 0 ? ` ${failCount} failed.` : ''}`,
      });
      window.dispatchEvent(new Event("fileUploaded"));
      setTimeout(() => {
        setSelectedFiles([]);
        setUploadProgress({});
      }, 2000);
    } else {
      setMessage({
        type: "error",
        text: "All uploads failed. Please try again.",
      });
    }

    setUploading(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      setMessage({ type: "", text: "" });
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
        Upload Files
      </h2>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById("fileInput").click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
      >
        <svg
          className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-gray-600 mb-2 text-sm sm:text-base">
          <span className="font-semibold text-blue-600">Click to upload</span>{" "}
          or drag and drop
        </p>
        <p className="text-xs sm:text-sm text-gray-500">
          Support for all file types
        </p>

        <input
          id="fileInput"
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">
            {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
          </p>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="p-3 sm:p-4 bg-blue-50 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <svg
                  className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0"
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
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {uploadProgress[index] !== undefined && (
                  <div className="flex items-center space-x-2">
                    {uploadProgress[index] === 100 ? (
                      <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : uploadProgress[index] === -1 ? (
                      <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="w-5 h-5">
                        <svg className="animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {!uploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {message.text && (
        <div
          className={`mt-4 p-3 sm:p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-center">
            {message.type === "success" ? (
              <svg
                className="h-5 w-5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <p className="text-sm sm:text-base">{message.text}</p>
          </div>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={selectedFiles.length === 0 || uploading}
        className={`mt-4 w-full py-2 sm:py-3 px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
          selectedFiles.length === 0 || uploading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {uploading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Uploading...
          </span>
        ) : (
          `Upload ${selectedFiles.length > 0 ? selectedFiles.length + ' File' + (selectedFiles.length > 1 ? 's' : '') : 'Files'}`
        )}
      </button>
    </div>
  );
}

export default UploadSection;
