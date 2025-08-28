import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Pages
import Login from "../pages/Login";

function AppRouter() {
  const { auth, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {!auth ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          // Por ahora solo redirigimos al login, más adelante agregaremos las rutas por rol
          <>
            <Route path="/dashboard" element={<div className="p-8 text-center">Dashboard - Coming Soon</div>} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
