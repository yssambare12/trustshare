import { useState, useEffect } from 'react';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/notifications?userId=${userId}`);

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.files);
        if (data.count > 0) {
          setShowNotifications(true);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleViewFile = async (fileId) => {
    const userId = localStorage.getItem('userId');

    await fetch(`${import.meta.env.VITE_BACKEND_URL}/mark-viewed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, userId })
    });

    setNotifications(prev => prev.filter(n => n._id !== fileId));

    if (notifications.length <= 1) {
      setShowNotifications(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/download/${file._id}?userId=${localStorage.getItem('userId')}`);

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

        handleViewFile(file._id);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  if (!showNotifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md">
      <div className="bg-white rounded-lg shadow-lg border-2 border-blue-500 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <svg className="h-5 w-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            New Shared Files ({notifications.length})
          </h3>
          <button
            onClick={() => setShowNotifications(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notifications.map((file) => (
            <div key={file._id} className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900 mb-2">
                {file.originalName}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(file)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={() => handleViewFile(file._id)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Notifications;
