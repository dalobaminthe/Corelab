import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AdminLayout.css";

function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Déconnexion : on vide le token (côté front uniquement, JWT stateless)
  // puis on renvoie vers la page de choix d'espace
  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-tag">SS 2026</span>
          <h2>Corelab</h2>
          <span>Administration</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin" end>Dashboard</NavLink>
          <NavLink to="/admin/etudiants">Étudiants</NavLink>
          <NavLink to="/admin/cohortes">Cohortes</NavLink>
          <NavLink to="/admin/contenu">Contenu</NavLink>
          <NavLink to="/admin/planning">Planning</NavLink>
          <NavLink to="/admin/notes">Notes</NavLink>
          <NavLink to="/admin/parametres">Paramètres</NavLink>
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
