import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import "./AdminContenu.css";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

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
  const [showCourses, setShowCourses] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      setLessonForm(prev => ({ ...prev, content: editor.getHTML() }))
    },
  })

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
        setLessonForm({ title: "", content: "", courseId: "", availableFrom: "" });
        editor.commands.setContent('')
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
        <div>
          <h1>Gestion du contenu</h1>
          <p>Créer des leçons et importer des QCM</p>
        </div>
        <button className="btn-courses" onClick={() => setShowCourses((v) => !v)}>
          {showCourses ? "Fermer la liste" : "Liste des cours"}
        </button>
      </div>

      {message && (
        <p className={`contenu-message ${message.type}`}>{message.text}</p>
      )}

      {showCourses && (
        <div className="courses-list-wrap">
          <h2>Cours disponibles ({courses.length})</h2>
          <table className="courses-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Titre</th>
                <th>Description</th>
                <th>Date d'ajout</th>
                <th>Disponible depuis</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty">Aucun cours trouvé.</td>
                </tr>
              ) : (
                courses.map((course, i) => (
                  <tr key={course._id}>
                    <td className="num">{String(i + 1).padStart(2, "0")}</td>
                    <td className="course-title">{course.title}</td>
                    <td className="muted">{course.description || "—"}</td>
                    <td className="muted">
                      {new Date(course.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="muted">—</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
              <label>Importer depuis un fichier HTML</label>
              <input
                type="file"
                accept=".html"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = (event) => {
                    const html = event.target.result
                    editor.commands.setContent(html)
                    setLessonForm(prev => ({ ...prev, content: html }))
                  }
                  reader.readAsText(file)
                }}
              />
            </div>
            <div className="form-group">
              <label>Contenu HTML</label>
              <div className="editor-toolbar">
                <button type="button"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={editor?.isActive('bold') ? 'active' : ''}>
                  <b>G</b>
                </button>
                <button type="button"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={editor?.isActive('italic') ? 'active' : ''}>
                  <i>I</i>
                </button>
                <button type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={editor?.isActive('heading', { level: 2 }) ? 'active' : ''}>
                  H2
                </button>
                <button type="button"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={editor?.isActive('heading', { level: 3 }) ? 'active' : ''}>
                  H3
                </button>
                <button type="button"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={editor?.isActive('bulletList') ? 'active' : ''}>
                  • Liste
                </button>
                <button type="button"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={editor?.isActive('orderedList') ? 'active' : ''}>
                  1. Liste
                </button>
              </div>
              <EditorContent editor={editor} className="editor-content" />
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