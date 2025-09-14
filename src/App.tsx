import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";

import AuthPage from "@/pages/AuthPage";
import HomePage from "@/pages/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route
          path="/authenticate"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
