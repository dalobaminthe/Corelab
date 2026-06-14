import "./AdminDashboard.css";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Ajout de l'import pour la navigation

// Résolution de l'URL de l'API via les variables d'environnement
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242/api";

function AdminDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate(); // Initialisation du hook
  const firstName = user?.name?.split(" ")[0] ?? "Admin";
  
  // États de l'interface
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupération simultanée des métriques globales et de l'historique d'activité
  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_URL}/admin/activity`, {
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
        setError("Impossible de charger les données du tableau de bord.");
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="admin-dashboard">
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

      <div className="admin-welcome">
        <h2>Bonjour, {firstName}.</h2>
        <p>Collection Automne-Hiver 2026 - 12 nouvelles leçons disponibles</p>
      </div>

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

      <div className="admin-actions">
        <p className="section-label">Actions</p>
        <div className="actions-grid">
          {/* Ajout des évènements onClick pour valider l'utilisation du Router */}
          <button className="action-btn" onClick={() => navigate("/admin/etudiants")}>Importer des étudiants</button>
          <button className="action-btn" onClick={() => navigate("/admin/contenu")}>Créer une leçon</button>
          <button className="action-btn" onClick={() => navigate("/admin/contenu")}>Importer un QCM</button>
          <button className="action-btn outline" onClick={() => navigate("/admin/notes")}>Consulter les notes</button>
        </div>
      </div>

      <div className="admin-activity">
        <p className="section-label">Activité récente</p>
        <div className="table-container">
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
                  <td data-label="Étudiant" className="bold">{row.student?.name}</td>
                  <td data-label="Cours" className="muted">{row.quiz?.title}</td>
                  <td data-label="Action">Examen terminé</td>
                  <td data-label="Date" className="muted">
                    {new Date(row.attemptedAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td data-label="Résultat" className={row.passed ? "success" : "fail"}>
                    {row.score}% {row.passed ? "✓" : "✗"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;