import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getLessons, getLessonQuiz } from "../api/student.js";
import { useNavigate } from "react-router-dom";
import "./StudentExamens.css";

function StudentExamens() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // ── États ──────────────────────────────────────────────────────────────────
  const [lessonsByCourse, setLessonsByCourse] = useState([]); // leçons groupées par cours
  const [loading, setLoading] = useState(true);
  // loadingQuiz stocke l'ID de la leçon en cours (pas un booléen)
  // → permet de désactiver uniquement le bouton cliqué, pas tous les boutons
  const [loadingQuiz, setLoadingQuiz] = useState(null);

  // ── Charge les leçons de chaque cours en parallèle ─────────────────────────
  useEffect(() => {
    if (!user?.courses?.length) {
      setLoading(false);
      return;
    }
    Promise.all(
      user.courses.map((courseId) =>
        getLessons(courseId, token).then((lessons) => ({ courseId, lessons })),
      ),
    )
      .then((results) => {
        setLessonsByCourse(results);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, token]);

  // ── Au clic : cherche le quiz de la leçon puis redirige ────────────────────
  async function handleQuizClick(lessonId) {
    setLoadingQuiz(lessonId);
    try {
      const quiz = await getLessonQuiz(lessonId, token);
      navigate(`/dashboard/quiz/${quiz._id}`);
    } catch {
      alert("Aucun quiz disponible pour cette leçon.");
    } finally {
      setLoadingQuiz(null);
    }
  }

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="student-examens">
      <div className="examens-header">
        <h1>Mes Examens</h1>
        <p>Accédez aux quiz de vos leçons disponibles</p>
      </div>

      {loading && <p className="examens-state">Chargement…</p>}

      {!loading && lessonsByCourse.length === 0 && (
        <p className="examens-state">Aucun cours assigné.</p>
      )}

      {/* Une section par cours, avec ses leçons et le bouton quiz */}
      <div className="examens-list">
        {lessonsByCourse.map(({ courseId, lessons }) => (
          <div key={courseId} className="course-block">
            <h2>Cours {courseId.slice(-4)}</h2>
            {lessons.length === 0 ? (
              <p className="examens-state">Aucune leçon disponible.</p>
            ) : (
              lessons.map((lesson) => (
                <div key={lesson._id} className="lesson-row">
                  <div>
                    <p className="lesson-title">{lesson.title}</p>
                    <small>Quiz disponible</small>
                  </div>
                  {/* disabled si ce bouton précis est en chargement */}
                  <button
                    className="quiz-link-btn"
                    onClick={() => handleQuizClick(lesson._id)}
                    disabled={loadingQuiz === lesson._id}
                  >
                    {loadingQuiz === lesson._id ? "…" : "Passer le quiz"}
                  </button>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentExamens;
