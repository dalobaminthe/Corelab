import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./StudentLayout.css";

function StudentLayout() {
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
    <div className="student-layout">
      {/* Bouton hamburger visible uniquement en mobile */}
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Overlay sombre quand sidebar ouverte en mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <h2>CORELAB</h2>
          <span>Atelier Numérique</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" onClick={handleNavClick}>◈ Mon Parcours</NavLink>
          <NavLink to="/dashboard/cours" onClick={handleNavClick}>▣ Mes Cours</NavLink>
          <NavLink to="/dashboard/examens" onClick={handleNavClick}>≡ Mes Examens</NavLink>
          <NavLink to="/dashboard/notifications" onClick={handleNavClick}>🔔 Notifications</NavLink>
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.[0] ?? "E"}</div>
          <span>{user?.name?.split(" ")[0] ?? "Étudiant"}</span>
          <small>AW 2026 - Saison Active</small>
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

export default StudentLayout;
