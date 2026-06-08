import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchProgress } from "../api/student.js";
import "./StudentDashboard.css";

const courseNames = [
  "Histoire de la Mode",
  "Stylisme & Création",
  "Textile & Matières",
  "Couture & Patronage",
  "Mode Digitale",
  "Mode Mondiale",
];

const mockActivity = [
  {
    type: "success",
    text: "QCM Histoire — Module 1 validé",
    detail: "Score : 18/20",
    time: "Il y a 2j",
  },
  {
    type: "lesson",
    text: "Leçon : Fibres naturelles et synthétiques",
    detail: "Vue à 80%",
    time: "Il y a 3j",
  },
  {
    type: "cert",
    text: "Certificat Stylisme & Création obtenu",
    detail: "Félicitations !",
    time: "Il y a 5j",
  },
  {
    type: "fail",
    text: "QCM Couture — Module 2 à repasser",
    detail: "Score insuffisant : 8/20",
    time: "Il y a 7j",
  },
];

function StudentDashboard() {
  const { user, token } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      if (!user?.courses?.length) {
        setLoading(false);
        return;
      }
      try {
        const progressData = await Promise.all(
          user.courses.map((courseId, i) =>
            fetchProgress(courseId, token).then((data) => ({
              name: courseNames[i] || `Cours ${i + 1}`,
              progress: data.progressPercent,
              lessons: `${data.completedLessons}/${data.totalLessons}`,
            })),
          ),
        );
        setModules(progressData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProgress();
  }, [user, token]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Mon Parcours</h1>
          <p>Bienvenue, {user?.name}</p>
        </div>
        <span className="season-badge">AW 2026</span>
      </div>

      <div className="dashboard-body">
        <div className="dashboard-left">
          <div className="welcome-card">
            <h2>Bonne reprise, {user?.name} ✦</h2>
            <p>Stylisme 2024 · Paris — Milan · Semestre 3 en cours · AW 2026</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <small>Cours suivis</small>
              <strong>{user?.courses?.length ?? 0}</strong>
              <span>cours assignés</span>
            </div>
            <div className="stat-card">
              <small>Moyenne générale</small>
              <strong>17,6</strong>
              <span>sur 20 · Excellent</span>
            </div>
            <div className="stat-card">
              <small>Prochain examen</small>
              <strong>15 Sep</strong>
              <span>Histoire — QCM 03</span>
            </div>
            <div className="stat-card">
              <small>Certificats</small>
              <strong>2</strong>
              <span>obtenus cette année</span>
            </div>
          </div>

          <div className="progress-section">
            <h3>Progression par Module</h3>
            {loading ? (
              <p style={{ color: "#9a9a9a", fontSize: "13px" }}>
                Chargement...
              </p>
            ) : (
              modules.map((module) => (
                <div key={module.name} className="progress-row">
                  <div className="progress-info">
                    <span>{module.name}</span>
                    <span>
                      {module.lessons} leçons · {module.progress}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${module.progress}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="dashboard-right">
          <div className="next-lesson-card">
            <small>Prochaine Leçon</small>
            <h3>L'évolution du costume occidental — XVIIe au XXe</h3>
            <div className="lesson-meta">
              <div>
                <small>Module</small>
                <span>Histoire de la Mode</span>
              </div>
              <div>
                <small>Durée</small>
                <span>45 min</span>
              </div>
              <div>
                <small>Semestre</small>
                <span>3 — AW 2026</span>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "75%" }} />
            </div>
            <button className="resume-btn">▶ Reprendre la leçon</button>
          </div>

          <div className="activity-section">
            <h3>Activité Récente</h3>
            {mockActivity.map((item, i) => (
              <div key={i} className={`activity-item ${item.type}`}>
                <div>
                  <p>{item.text}</p>
                  <small>{item.detail}</small>
                </div>
                <span>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
