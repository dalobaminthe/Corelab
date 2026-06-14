/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

// La "boîte" vide qui contiendra les données de l'utilisateur connecté
const AuthContext = createContext(null);

// URL de base : variable d'environnement en prod, localhost en dev
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242/api";

// AuthProvider enveloppe toute l'app (dans main.jsx) pour rendre le context accessible partout
export function AuthProvider({ children }) {
  // user : les infos de l'utilisateur connecté (id, rôle, nom...)
  const [user, setUser] = useState(null);
  // token : le JWT récupéré depuis le localStorage au démarrage (persiste après rechargement)
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Au rechargement de la page, le token persiste mais user redevient null.
  // On rappelle GET /me pour réhydrater user à partir du token stocké.
  useEffect(() => {
    if (token && !user) {
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => setUser(data))
        .catch(() => {
          // token invalide ou expiré : on nettoie
          setToken(null);
          localStorage.removeItem("token");
        });
    }
  }, [token, user]);

  // Appelée après un login réussi : stocke l'utilisateur et le token
  function login(userData, jwt) {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem("token", jwt);
  }

  // Appelée lors de la déconnexion : efface tout
  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  }

  // On met user, token, login et logout dans value pour les rendre accessibles à toute l'app
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé : permet d'accéder au context depuis n'importe quel composant avec useAuth()
export function useAuth() {
  return useContext(AuthContext);
}
