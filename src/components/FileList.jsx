import { useState, useEffect } from 'react';
import UserListModal from './UserListModal';

function FileList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareLinks, setShareLinks] = useState({});
  const [messages, setMessages] = useState({});
  const [showUserModal, setShowUserModal] = useState(null);

  // Fetch files from backend
  useEffect(() => {
    fetchFiles();

    // Listen for file upload events
    const handleFileUploaded = () => {
      fetchFiles();
    };
    window.addEventListener('fileUploaded', handleFileUploaded);

    return () => {
      window.removeEventListener('fileUploaded', handleFileUploaded);
    };
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/files?userId=${localStorage.getItem("userId")}`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      } else {
        console.error('Failed to fetch files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareSuccess = (message, fileId) => {
    setMessages({
      ...messages,
      [fileId]: { type: 'success', text: message }
    });
    setTimeout(() => {
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[fileId];
        return newMessages;
      });
    }, 3000);
  };

  const handleGenerateLink = async (fileId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/share-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId })
      });

      if (response.ok) {
        const data = await response.json();
        const link = `${window.location.origin}/file/${data.token}`;
        setShareLinks({ ...shareLinks, [fileId]: link });
        setMessages({
          ...messages,
          [fileId]: { type: 'success', text: 'Share link generated!' }
        });
      } else {
        const error = await response.json();
        setMessages({
          ...messages,
          [fileId]: { type: 'error', text: error.error || 'Failed to generate link' }
        });
      }
    } catch (error) {
      setMessages({
        ...messages,
        [fileId]: { type: 'error', text: 'Network error' }
      });
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/download/${fileId}?userId=${localStorage.getItem("userId")}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        alert(error.error || 'Download failed');
      }
    } catch (error) {
      alert('Network error during download');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
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

  if (files.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
          Your Files
        </h2>
        <p className="text-gray-500">No files uploaded yet. Upload your first file above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
        Your Files
      </h2>

      <div className="space-y-4">
        {files.map((file) => (
          <div
            key={file._id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            {/* File Info */}
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
                  {formatSize(file.size)} • {formatDate(file.createdAt)}
                </p>
              </div>
              <button
                onClick={() => handleDownload(file._id, file.originalName)}
                className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </button>
            </div>

            {/* Share with User */}
            <div className="mb-3">
              <button
                onClick={() => setShowUserModal({ id: file._id, name: file.originalName })}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium flex items-center justify-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Share with User</span>
              </button>
            </div>

            {/* Generate Share Link */}
            <div className="mb-3">
              <button
                onClick={() => handleGenerateLink(file._id)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium"
              >
                Generate Share Link
              </button>
            </div>

            {/* Share Link Display */}
            {shareLinks[file._id] && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-700 mb-2 font-medium">
                  Share Link:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareLinks[file._id]}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(shareLinks[file._id])}
                    className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs sm:text-sm whitespace-nowrap"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages[file._id] && (
              <div
                className={`p-3 rounded-lg text-xs sm:text-sm ${
                  messages[file._id].type === 'success'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {messages[file._id].text}
              </div>
            )}
          </div>
        ))}
      </div>

      {showUserModal && (
        <UserListModal
          fileId={showUserModal.id}
          fileName={showUserModal.name}
          onClose={() => setShowUserModal(null)}
          onShareSuccess={(msg) => handleShareSuccess(msg, showUserModal.id)}
        />
      )}
    </div>
  );
}

export default FileList;
