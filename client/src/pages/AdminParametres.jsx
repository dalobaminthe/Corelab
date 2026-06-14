import { useAuth } from "../context/AuthContext.jsx";
import "./AdminParametres.css";

// Page paramètres : affiche les informations du compte admin connecté.
// Lecture seule pour l'instant (le back ne propose pas de route d'édition de profil).
function AdminParametres() {
  const { user } = useAuth();

  return (
    <div className="admin-parametres">
      <div className="parametres-header">
        <h1>Paramètres</h1>
        <p>Informations de votre compte administrateur</p>
      </div>

      {/* Carte d'identité du compte connecté */}
      <div className="parametres-card">
        <div className="parametres-avatar">{user?.name?.[0] ?? "A"}</div>
        <div className="parametres-info">
          <div className="info-row">
            <span className="info-label">Nom</span>
            <span className="info-value">{user?.name ?? "—"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email</span>
            <span className="info-value">{user?.email ?? "—"}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Rôle</span>
            <span className="info-value">
              <span className="role-badge">Administrateur</span>
            </span>
          </div>
        </div>
      </div>

      {/* Section informative sur la plateforme */}
      <div className="parametres-card">
        <h2>À propos de la plateforme</h2>
        <div className="parametres-info">
          <div className="info-row">
            <span className="info-label">Plateforme</span>
            <span className="info-value">Corelab — LMS</span>
          </div>
          <div className="info-row">
            <span className="info-label">Saison</span>
            <span className="info-value">AW 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminParametres;
