import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Composant garde-barrière : vérifie qu'un token existe avant d'afficher la page
// Sans token (non connecté) → redirige vers /login
// Utilisé dans main.jsx pour envelopper toutes les routes protégées
function ProtectedRoute({ children, allowedRole }) {
  const { token, user } = useAuth();

  // replace évite que l'utilisateur puisse revenir en arrière sur la page protégée
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Vérification de sécurité (Cahier des charges) : on s'assure que le rôle correspond
  // On attend que 'user' soit chargé depuis le context pour faire la vérification
  if (allowedRole && user && user.role !== allowedRole) {
    // Si un étudiant essaie d'aller sur /admin (ou l'inverse), on le renvoie chez lui
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return children;
}

export default ProtectedRoute;