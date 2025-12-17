function Header({ userEmail, onLogout }) {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">TrustShare</h1>
            <p className="text-blue-100 mt-1">Secure File Sharing Platform</p>
          </div>
          {userEmail && (
            <div className="flex items-center space-x-4">
              <span className="text-sm sm:text-base text-blue-100">
                {userEmail}
              </span>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
