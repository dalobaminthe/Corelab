import "./AdminDashboard.css";
import { useAuth } from "../context/AuthContext.jsx";

const mockActivity = [
  {
    student: "Sophie Martin",
    course: "Stylisme & Création",
    action: "Examen terminé",
    date: "Aujourd'hui 14h12",
    result: "87%",
    passed: true,
  },
  {
    student: "Lucas Bernard",
    course: "Mode Mondiale",
    action: "Leçon consultée",
    date: "Aujourd'hui 13h44",
    result: "—",
    passed: null,
  },
  {
    student: "Emma Dupont",
    course: "Textile & Matières",
    action: "Examen terminé",
    date: "Aujourd'hui 11h05",
    result: "48%",
    passed: false,
  },
  {
    student: "Antoine Leroy",
    course: "Histoire de la Mode",
    action: "Inscrit au cours",
    date: "Hier 17h30",
    result: "—",
    passed: null,
  },
  {
    student: "Chloé Rousseau",
    course: "Couture & Patronage",
    action: "Examen terminé",
    date: "Hier 16h22",
    result: "91%",
    passed: true,
  },
  {
    student: "Nathan Petit",
    course: "Mode Digitale",
    action: "Leçon consultée",
    date: "Hier 09h14",
    result: "—",
    passed: null,
  },
];

function AdminDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "Admin";

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue d'ensemble de la plateforme</p>
        </div>
        <div className="admin-header-right">
          <span className="season-badge">AW 2026</span>
          <div className="admin-avatar">{user?.name?.[0] ?? "A"}</div>
        </div>
      </div>

      {/* Bienvenue */}
      <div className="admin-welcome">
        <h2>Bonjour, {firstName}.</h2>
        <p>Collection Automne-Hiver 2026 — 12 nouvelles leçons disponibles</p>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <strong>248</strong>
          <span>Étudiants inscrits</span>
          <small className="positive">+12 ce mois</small>
        </div>
        <div className="admin-stat-card">
          <strong>14</strong>
          <span>Cours actifs</span>
          <small>3 collections</small>
        </div>
        <div className="admin-stat-card">
          <strong>832</strong>
          <span>Examens passés</span>
          <small>ce trimestre</small>
        </div>
        <div className="admin-stat-card">
          <strong>73%</strong>
          <span>Taux de réussite</span>
          <small className="warning">seuil moy. 60%</small>
        </div>
      </div>

      {/* Actions */}
      <div className="admin-actions">
        <p className="section-label">Actions</p>
        <div className="actions-grid">
          <button className="action-btn">Importer des étudiants</button>
          <button className="action-btn">Créer une leçon</button>
          <button className="action-btn">Importer un QCM</button>
          <button className="action-btn outline">Consulter les notes</button>
        </div>
      </div>

      {/* Tableau activité */}
      <div className="admin-activity">
        <p className="section-label">Activité récente</p>
        <table className="activity-table">
          <thead>
            <tr>
              <th>Étudiant</th>
              <th>Cours</th>
              <th>Action</th>
              <th>Date</th>
              <th>Résultat</th>
            </tr>
          </thead>
          <tbody>
            {mockActivity.map((row, i) => (
              <tr key={i}>
                <td className="bold">{row.student}</td>
                <td className="muted">{row.course}</td>
                <td>{row.action}</td>
                <td className="muted">{row.date}</td>
                <td
                  className={
                    row.passed === true
                      ? "success"
                      : row.passed === false
                        ? "fail"
                        : "muted"
                  }
                >
                  {row.result}{" "}
                  {row.passed === true ? "✓" : row.passed === false ? "✗" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
