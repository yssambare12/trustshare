import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function SharedFileAccess() {
  const { token } = useParams();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    fetchFileByToken();
  }, [token]);

  const fetchFileByToken = async () => {
    try {
      const userId = localStorage.getItem('userId');

      if (!userId) {
        setError('Please log in to access shared files');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/file-by-link/${token}?userId=${userId}`
      );

      if (response.ok) {
        const data = await response.json();
        setFile(data);
      } else {
        const errorData = await response.json();

        if (response.status === 410 || errorData.expired) {
          setExpired(true);
          setError('This share link has expired');
        } else {
          setError(errorData.error || 'Failed to load file');
        }
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/download/${file._id}?userId=${userId}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.originalName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        if (response.status === 410 || errorData.expired) {
          setExpired(true);
          setError('This file share has expired');
        } else {
          alert(errorData.error || 'Download failed');
        }
      }
    } catch (error) {
      alert('Network error during download');
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading shared file...</p>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h2>
          <p className="text-gray-600 mb-6">
            This share link has expired and is no longer accessible. Please contact the file owner for a new link.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Shared File
        </h2>

        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg break-words">
                {file.originalName}
              </h3>
              <p className="text-sm text-gray-600">
                {formatSize(file.size)}
              </p>
            </div>
          </div>

          {file.expiresAt && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Expires:</span>{' '}
                {new Date(file.expiresAt).toLocaleString()}
              </p>
            </div>
          )}

          <button
            onClick={handleDownload}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download File</span>
          </button>
        </div>

        <button
          onClick={() => window.location.href = '/'}
          className="w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default SharedFileAccess;
