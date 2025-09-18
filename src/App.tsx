import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import { Toaster } from "@/components/ui/sonner";

import AuthPage from "@/pages/AuthPage";
import HomePage from "@/pages/HomePage";

import PasswordRecovery from "@/pages/PasswordRecovery";
import PasswordReset from "@/pages/PasswordReset";
import UsersPage from "@/pages/admin/UsersPage";
import TasksPage from "@/pages/TasksPage";

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
        <Route
          path="/password-recovery"
          element={
            <PublicRoute>
              <PasswordRecovery />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <PasswordReset />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TasksPage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/users"
          element={
            <AdminRoute>
              <UsersPage />
            </AdminRoute>
          }
        />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
