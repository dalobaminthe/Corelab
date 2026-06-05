import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./StudentLayout.css";

function StudentLayout() {
  const { user } = useAuth();

  return (
    <div className="student-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>CORLAB</h2>
          <span>Atelier Numérique</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard">◈ Mon Parcours</NavLink>
          <NavLink to="/dashboard/cours">▣ Mes Cours</NavLink>
          <NavLink to="/dashboard/examens">≡ Mes Examens</NavLink>
          <NavLink to="/dashboard/notifications">🔔 Notifications</NavLink>
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.[0] ?? "E"}</div>
          <span>{user?.name ?? "Étudiant"}</span>
          <small>AW 2026 — Saison Active</small>
        </div>
      </aside>

      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}

export default StudentLayout;
