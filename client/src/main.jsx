import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import RoleSelection from "./pages/RoleSelection.jsx";

// Import de chaque page — une page = une route dans le router
import LoginPage from "./pages/Login.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

// Définition des routes : path = URL, element = composant à afficher
const router = createBrowserRouter([
  { path: "/", element: <RoleSelection /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/dashboard", element: <StudentDashboard /> },
  { path: "/admin", element: <AdminDashboard /> },
]);

// AuthProvider englobe tout pour que le context soit accessible dans toutes les pages
// RouterProvider active le système de navigation entre les pages
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
