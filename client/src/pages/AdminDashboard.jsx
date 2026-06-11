import "./AdminDashboard.css";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";

function AdminDashboard() {
  const { user, token } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "Admin";
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:4242/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("http://localhost:4242/api/admin/activity", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ])
      .then(([resStats, resActivity]) =>
        Promise.all([resStats.json(), resActivity.json()]),
      )
      .then(([statsData, activityData]) => {
        setStats(statsData);
        setActivity(activityData);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger les données.");
        setLoading(false);
      });
  }, [token]);

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
      {error && (
        <p style={{ color: "#eb5757", marginBottom: "16px" }}>{error}</p>
      )}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <strong>{loading ? "…" : stats?.totalStudents}</strong>
          <span>Étudiants inscrits</span>
          <small className="positive">inscrits</small>
        </div>
        <div className="admin-stat-card">
          <strong>{loading ? "…" : stats?.totalCourses}</strong>
          <span>Cours actifs</span>
          <small>sur la plateforme</small>
        </div>
        <div className="admin-stat-card">
          <strong>{loading ? "…" : stats?.totalAttempts}</strong>
          <span>Examens passés</span>
          <small>au total</small>
        </div>
        <div className="admin-stat-card">
          <strong>{loading ? "…" : `${stats?.successRate}%`}</strong>
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
            {activity.map((row) => (
              <tr key={row._id}>
                <td className="bold">{row.student?.name}</td>
                <td className="muted">{row.quiz?.title}</td>
                <td>Examen terminé</td>
                <td className="muted">
                  {new Date(row.attemptedAt).toLocaleDateString("fr-FR")}
                </td>
                <td className={row.passed ? "success" : "fail"}>
                  {row.score}% {row.passed ? "✓" : "✗"}
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
