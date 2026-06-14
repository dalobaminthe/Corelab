import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AdminLayout.css";

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Déconnexion : on vide le token (côté front uniquement, JWT stateless)
  // puis on renvoie vers la page de choix d'espace
  function handleLogout() {
    logout();
    navigate("/");
  }

  // Ferme la sidebar quand on clique sur un lien (mobile)
  function handleNavClick() {
    setSidebarOpen(false);
  }

  return (
    <div className="admin-layout">
      {/* Bouton hamburger visible uniquement en mobile */}
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Overlay sombre quand sidebar ouverte en mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <span className="sidebar-tag">SS 2026</span>
          <h2>Corelab</h2>
          <span>Administration</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin" end onClick={handleNavClick}>Dashboard</NavLink>
          <NavLink to="/admin/etudiants" onClick={handleNavClick}>Étudiants</NavLink>
          <NavLink to="/admin/cohortes" onClick={handleNavClick}>Cohortes</NavLink>
          <NavLink to="/admin/contenu" onClick={handleNavClick}>Contenu</NavLink>
          <NavLink to="/admin/planning" onClick={handleNavClick}>Planning</NavLink>
          <NavLink to="/admin/notes" onClick={handleNavClick}>Notes</NavLink>
          <NavLink to="/admin/parametres" onClick={handleNavClick}>Paramètres</NavLink>
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.[0] ?? "A"}</div>
          <span>{user?.name ?? "Admin"}</span>
          <small>Administrateur</small>
          <button className="logout-btn" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
