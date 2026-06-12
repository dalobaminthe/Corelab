import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchProgress, getLessons, getAttempts } from "../api/student.js";
import "./StudentDashboard.css";

const courseNames = [
  "Histoire de la Mode",
  "Stylisme & Création",
  "Textile & Matières",
  "Couture & Patronage",
  "Mode Digitale",
  "Mode Mondiale",
];

function timeAgo(dateStr) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Il y a 1j";
  return `Il y a ${days}j`;
}

function StudentDashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [nextLesson, setNextLesson] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      // Si l'utilisateur n'a pas de cours assignés, on arrête le chargement
      if (!user?.courses?.length) {
        setLoading(false);
        return;
      }
      try {
        // Promise.all lance tous les appels API en parallèle (plus rapide qu'un par un)
        const [progressData, firstLessons, attemptsData] = await Promise.all([
          Promise.all(
            user.courses.map((courseId, i) =>
              fetchProgress(courseId, token).then((data) => ({
                name: courseNames[i] || `Cours ${i + 1}`,
                progress: data.progressPercent,
                lessons: `${data.completedLessons}/${data.totalLessons}`,
                completedLessons: data.completedLessons,
              })),
            ),
          ),
          getLessons(user.courses[0], token),
          getAttempts(token),
        ]);
        setModules(progressData);
        setAttempts(attemptsData);
        const completed = progressData[0]?.completedLessons ?? 0;
        const nextIndex = Math.min(completed, firstLessons.length - 1);
        setNextLesson(firstLessons[nextIndex] ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        // finally s'exécute toujours, succès ou erreur — on arrête le chargement
        setLoading(false);
      }
    }
    loadProgress();
  }, [user, token]); // se relance si user ou token change

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Mon Parcours</h1>
          <p>Bienvenue, {user?.name?.split(" ")[0]}</p>
        </div>
        <span className="season-badge">AW 2026</span>
      </div>

      <div className="dashboard-body">
        <div className="dashboard-left">
          <div className="welcome-card">
            <h2>Bonne reprise, {user?.name?.split(" ")[0]} ✦</h2>
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
            <h3>{nextLesson?.title ?? "—"}</h3>
            <div className="lesson-meta">
              <div>
                <small>Module</small>
                <span>{courseNames[0]}</span>
              </div>
            </div>
            <button
              className="resume-btn"
              onClick={() =>
                nextLesson &&
                navigate(`/dashboard/cours/${nextLesson._id}`, {
                  state: { courseName: courseNames[0] },
                })
              }
            >
              ▶ Reprendre la leçon
            </button>
          </div>

          <div className="activity-section">
            <h3>Activité Récente</h3>
            {attempts.length === 0 && (
              <p style={{ color: "#9a9a9a", fontSize: "13px" }}>Aucune activité.</p>
            )}
            {attempts.slice(0, 5).map((attempt) => (
              <div key={attempt._id} className={`activity-item ${attempt.passed ? "success" : "fail"}`}>
                <div>
                  <p>{attempt.quiz?.title ?? "Quiz"}</p>
                  <small>Score : {attempt.score} / 100</small>
                </div>
                <span>{timeAgo(attempt.attemptedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
