import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getLesson, getLessons, getLessonQuiz } from "../api/student.js";
import "./StudentLecon.css";

function StudentLecon() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [courseLessons, setCourseLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const courseName = location.state?.courseName ?? "Mes Cours";

  useEffect(() => {
    setLoading(true);
    getLesson(lessonId, token)
      .then((lessonData) => {
        setLesson(lessonData);
        return getLessons(lessonData.courseId, token);
      })
      .then((lessonsData) => {
        setCourseLessons(lessonsData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [lessonId, token]);

  async function handleQuizClick() {
    setLoadingQuiz(true);
    try {
      const quiz = await getLessonQuiz(lessonId, token);
      navigate(`/dashboard/quiz/${quiz._id}`);
    } catch {
      alert("Aucun quiz disponible pour cette leçon.");
    } finally {
      setLoadingQuiz(false);
    }
  }

  if (loading) return <div className="lecon-state">Chargement…</div>;
  if (error) return <div className="lecon-state lecon-error">{error}</div>;
  if (!lesson) return null;

  const currentIndex = courseLessons.findIndex((l) => l._id === lessonId);
  const prevLesson = courseLessons[currentIndex - 1];
  const nextLesson = courseLessons[currentIndex + 1];

  return (
    <div className="student-lecon">
      <div className="lecon-header">
        <div>
          <h1>Lecture de Leçon</h1>
          <p>
            {courseName} — Leçon{" "}
            {String(currentIndex + 1).padStart(2, "0")}
          </p>
        </div>
        <span className="lecon-season">AW 2026</span>
      </div>

      <div className="lecon-body">
        <div className="lecon-main">
          <div className="lecon-content">
            <h2>{lesson.title}</h2>
            <div
              className="lecon-html"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        </div>

        <aside className="lecon-sidebar">
          <div className="sidebar-module">
            <h3>Progression du Module</h3>
            {courseLessons.map((l, i) => (
              <div
                key={l._id}
                className={`module-item ${l._id === lessonId ? "current" : ""}`}
                onClick={() =>
                  navigate(`/dashboard/cours/${l._id}`, {
                    state: { courseName },
                  })
                }
              >
                <span className="module-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="module-title">{l.title}</span>
              </div>
            ))}
          </div>

          <button
            className="lecon-quiz-btn"
            onClick={handleQuizClick}
            disabled={loadingQuiz}
          >
            {loadingQuiz ? "…" : "Passer le QCM →"}
          </button>

          <div className="lecon-nav">
            <button
              className="nav-btn"
              onClick={() =>
                navigate(`/dashboard/cours/${prevLesson._id}`, {
                  state: { courseName },
                })
              }
              disabled={!prevLesson}
            >
              ← Leçon {String(currentIndex).padStart(2, "0")}
            </button>
            <button
              className="nav-btn"
              onClick={() =>
                navigate(`/dashboard/cours/${nextLesson._id}`, {
                  state: { courseName },
                })
              }
              disabled={!nextLesson}
            >
              Leçon {String(currentIndex + 2).padStart(2, "0")} →
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default StudentLecon;
