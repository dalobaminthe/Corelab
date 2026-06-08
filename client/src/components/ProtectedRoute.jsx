import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Composant garde-barrière : vérifie qu'un token existe avant d'afficher la page
// Sans token (non connecté) → redirige vers /login
// Utilisé dans main.jsx pour envelopper toutes les routes protégées
function ProtectedRoute({ children }) {
  const { token } = useAuth();

  // replace évite que l'utilisateur puisse revenir en arrière sur la page protégée
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
