import { useState, useEffect } from "react";
import Header from "./components/Header";
import UploadSection from "./components/UploadSection";
import FileList from "./components/FileList";
import Auth from "./components/Auth";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    if (token && email) {
      setIsAuthenticated(true);
      setUserEmail(email);
    }
  }, []);

  const handleAuthSuccess = (data) => {
    setIsAuthenticated(true);
    setUserEmail(data.email);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    setIsAuthenticated(false);
    setUserEmail("");
  };

  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header userEmail={userEmail} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        <UploadSection />
        <FileList />
      </main>
    </div>
  );
}

export default App;
