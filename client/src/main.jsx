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
import StudentLayout from "./layouts/StudentLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import SetPassword from "./pages/SetPassword.jsx";
import QuizPage from "./pages/QuizPage.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminEtudiants from "./pages/AdminEtudiants.jsx";
import AdminContenu from "./pages/AdminContenu.jsx";
import AdminNotes from "./pages/AdminNotes.jsx";
import StudentNotifications from "./pages/StudentNotifications.jsx";
import StudentExamens from "./pages/StudentExamens.jsx";
import StudentCours from "./pages/StudentCours.jsx";
import StudentLecon from "./pages/StudentLecon.jsx";

// Définition des routes : path = URL, element = composant à afficher
const router = createBrowserRouter([
  { path: "/", element: <RoleSelection /> },
  { path: "/login", element: <LoginPage /> },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        {" "}
        <StudentLayout />{" "}
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <StudentDashboard /> },
      { path: "cours", element: <StudentCours /> },
      { path: "cours/:lessonId", element: <StudentLecon /> },
      { path: "notifications", element: <StudentNotifications /> },
      { path: "quiz/:quizId", element: <QuizPage /> },
      { path: "examens", element: <StudentExamens /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "etudiants", element: <AdminEtudiants /> },
      { path: "contenu", element: <AdminContenu /> },
      { path: "notes", element: <AdminNotes /> },
    ],
  },
  {
    path: "/set-password",
    element: (
      <ProtectedRoute>
        <SetPassword />
      </ProtectedRoute>
    ),
  },
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
