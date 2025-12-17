function FileList() {
  const sampleFiles = [
    { id: 1, name: "document.pdf", size: "2.4 MB", date: "2024-12-17" },
    { id: 2, name: "image.png", size: "1.2 MB", date: "2024-12-17" },
    { id: 3, name: "spreadsheet.xlsx", size: "856 KB", date: "2024-12-16" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Files</h2>

      <div className="space-y-3">
        {sampleFiles.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg
                  className="h-6 w-6 text-blue-600"
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
              <div>
                <h3 className="font-medium text-gray-900">{file.name}</h3>
                <p className="text-sm text-gray-500">
                  {file.size} • {file.date}
                </p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FileList;
