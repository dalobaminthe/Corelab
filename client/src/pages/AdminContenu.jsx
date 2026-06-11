import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import "./AdminContenu.css";

function AdminContenu() {
  const { token } = useAuth();

  const [lessonForm, setLessonForm] = useState({
    title: "",
    content: "",
    courseId: "",
    availableFrom: "",
  });
  const [quizJson, setQuizJson] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4242/api/admin/courses", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch(() =>
        setMessage({ type: "error", text: "Impossible de charger les cours." }),
      );
  }, [token]);

  function handleLessonChange(e) {
    setLessonForm({ ...lessonForm, [e.target.name]: e.target.value });
  }

  function handleLessonSubmit(e) {
    e.preventDefault();
    setLoading(true);
    fetch("http://localhost:4242/api/admin/lessons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(lessonForm),
    })
      .then((res) => res.json())
      .then(() => {
        setMessage({ type: "success", text: "Leçon créée avec succès." });
        setLessonForm({
          title: "",
          content: "",
          courseId: "",
          availableFrom: "",
        });
      })
      .catch(() =>
        setMessage({ type: "error", text: "Erreur lors de la création." }),
      )
      .finally(() => setLoading(false));
  }

  function handleQuizSubmit(e) {
    e.preventDefault();
    setLoading(true);
    fetch("http://localhost:4242/api/admin/quizzes/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: quizJson,
    })
      .then((res) => res.json())
      .then(() => {
        setMessage({ type: "success", text: "QCM importé avec succès." });
        setQuizJson("");
      })
      .catch(() =>
        setMessage({ type: "error", text: "JSON invalide ou erreur serveur." }),
      )
      .finally(() => setLoading(false));
  }

  return (
    <div className="admin-contenu">
      <div className="contenu-header">
        <h1>Gestion du contenu</h1>
        <p>Créer des leçons et importer des QCM</p>
      </div>

      {message && (
        <p className={`contenu-message ${message.type}`}>{message.text}</p>
      )}

      <div className="contenu-grid">
        {/* Formulaire leçon */}
        <div className="contenu-card">
          <h2>Créer une leçon</h2>
          <form onSubmit={handleLessonSubmit}>
            <div className="form-group">
              <label>Titre</label>
              <input
                name="title"
                value={lessonForm.title}
                onChange={handleLessonChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Cours</label>
              <select
                name="courseId"
                value={lessonForm.courseId}
                onChange={handleLessonChange}
                required
              >
                <option value="">-- Sélectionner un cours --</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Disponible à partir du</label>
              <input
                type="datetime-local"
                name="availableFrom"
                value={lessonForm.availableFrom}
                onChange={handleLessonChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contenu HTML</label>
              <textarea
                name="content"
                value={lessonForm.content}
                onChange={handleLessonChange}
                rows={6}
                required
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Envoi…" : "Créer la leçon"}
            </button>
          </form>
        </div>

        {/* Formulaire QCM */}
        <div className="contenu-card">
          <h2>Importer un QCM</h2>
          <form onSubmit={handleQuizSubmit}>
            <div className="form-group">
              <label>Coller le JSON du QCM</label>
              <textarea
                value={quizJson}
                onChange={(e) => setQuizJson(e.target.value)}
                rows={14}
                placeholder='{ "title": "Quiz JS", "lesson": "...", "passingScore": 60, "questions": [...] }'
                required
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Envoi…" : "Importer le QCM"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminContenu;
