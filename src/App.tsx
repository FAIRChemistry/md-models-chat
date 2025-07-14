import { useEffect, useState } from "react";
import Dashboard from "./app/page";
import PasswordModal from "./components/PasswordModal";
import { setJWTCookie } from "./utils/requests";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const shouldShowPasswordModal = import.meta.env.VITE_USE_PASSWORD?.toLowerCase() === "true" || false;

  useEffect(() => {
    // Set initial password modal state
    setIsPasswordModalOpen(shouldShowPasswordModal);

    setJWTCookie()
      .then(() => {
        setIsAuthenticated(true);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to authenticate');
        console.error('Authentication failed:', err);
      });
  }, [shouldShowPasswordModal]);

  const handlePasswordModalClose = () => {
    setIsPasswordModalOpen(false);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  // If password modal should be shown and is open, only render the modal
  if (shouldShowPasswordModal && isPasswordModalOpen) {
    return <PasswordModal onClose={handlePasswordModalClose} />;
  }

  // Otherwise, render the main app
  return (
    <>
      {isAuthenticated ? <Dashboard /> : <div>Loading...</div>}
    </>
  );
}

export default App;