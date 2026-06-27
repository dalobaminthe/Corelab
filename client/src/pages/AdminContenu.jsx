import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import "./AdminContenu.css";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { createCourse, updateCourse, deleteCourse } from "../api/admin.js"

// Résolution de l'URL de l'API via les variables d'environnement
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242/api";

function AdminContenu() {
  const { token } = useAuth();

  const [lessonForm, setLessonForm] = useState({
    title: "",
    content: "",
    courseId: "",
    availableFrom: "",
  });
  const [editingLessonId, setEditingLessonId] = useState(null); // Savoir si on modifie une leçon
  const [courseLessons, setCourseLessons] = useState([]); // Leçons du cours sélectionné

  const [quizJson, setQuizJson] = useState("");
  const [quizCourseId, setQuizCourseId] = useState("");   // cours choisi pour filtrer les leçons
  const [quizLessonId, setQuizLessonId] = useState("");   // leçon à laquelle rattacher le quiz
  const [quizLessons, setQuizLessons] = useState([]);     // leçons du cours choisi pour le quiz
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showCourses, setShowCourses] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: "", description: "" });

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      setLessonForm(prev => ({ ...prev, content: editor.getHTML() }))
    },
  })

  useEffect(() => {
    fetch(`${API_URL}/admin/courses`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch(() =>
        setMessage({ type: "error", text: "Impossible de charger les cours." }),
      );
  }, [token]);

  // Si on sélectionne un cours, on récupère TOUTES ses leçons (route admin, sans filtre de date)
  // pour pouvoir modifier même les leçons planifiées dans le futur.
  useEffect(() => {
    if (lessonForm.courseId) {
      fetch(`${API_URL}/admin/lessons?courseId=${lessonForm.courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => res.json())
      .then(data => setCourseLessons(data))
      .catch(() => setCourseLessons([]));
    } else {
      setCourseLessons([]);
    }
  }, [lessonForm.courseId, token]);

  // Pour le quiz : quand on choisit un cours, on charge ses leçons pour pouvoir
  // rattacher le quiz à une leçon précise (un quiz est lié à une leçon, pas à un cours).
  useEffect(() => {
    if (quizCourseId) {
      fetch(`${API_URL}/admin/lessons?courseId=${quizCourseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => res.json())
      .then(data => setQuizLessons(data))
      .catch(() => setQuizLessons([]));
    } else {
      setQuizLessons([]);
    }
    setQuizLessonId(""); // reset la leçon choisie si on change de cours
  }, [quizCourseId, token]);

  function handleLessonChange(e) {
    setLessonForm({ ...lessonForm, [e.target.name]: e.target.value });
  }

  // Permet de charger le contenu d'une leçon existante dans l'éditeur
  function handleSelectLessonToEdit(e) {
    const lessonId = e.target.value;
    if (!lessonId) {
      setEditingLessonId(null);
      setLessonForm(prev => ({ ...prev, title: "", content: "", availableFrom: "" }));
      editor.commands.setContent('');
      return;
    }
    const lesson = courseLessons.find(l => l._id === lessonId);
    if (lesson) {
      setEditingLessonId(lessonId);
      const formattedDate = new Date(lesson.availableFrom).toISOString().slice(0, 16);
      setLessonForm(prev => ({
        ...prev,
        title: lesson.title,
        content: lesson.content,
        availableFrom: formattedDate
      }));
      editor.commands.setContent(lesson.content);
    }
  }

  function handleLessonSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const method = editingLessonId ? "PUT" : "POST";
    const endpoint = editingLessonId ? `${API_URL}/admin/lessons/${editingLessonId}` : `${API_URL}/admin/lessons`;

    fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(lessonForm),
    })
      .then(async (res) => {
        const data = await res.json();
        // 2. LA VÉRIFICATION : Si le backend refuse (400, 401, 500), on arrête tout et on affiche l'erreur
        if (!res.ok) {
          console.error("Détails du rejet par le backend :", data);
          throw new Error(data.error || "Le serveur a refusé la création (voir console)");
        }
        return data;
      })
      .then(() => {
        setMessage({ type: "success", text: editingLessonId ? "Leçon modifiée." : "Leçon créée avec succès." });
        setLessonForm({ title: "", content: "", courseId: "", availableFrom: "" });
        setEditingLessonId(null);
        editor.commands.setContent('');
        // Rafraîchir les leçons du cours (route admin)
        if (lessonForm.courseId) {
          fetch(`${API_URL}/admin/lessons?courseId=${lessonForm.courseId}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => res.json()).then(data => setCourseLessons(data));
        }
      })
      .catch(() =>
        setMessage({ type: "error", text: "Erreur lors de l'enregistrement." }),
      )
      .finally(() => setLoading(false));
  }
  // --------------------------------

  async function handleCourseSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const newCourse = await createCourse(courseForm, token);
      setCourses([...courses, newCourse]);
      setCourseForm({ title: "", description: "" });
      setShowCreateCourse(false);
      setMessage({ type: "success", text: "Cours créé avec succès." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  function handleEditClick(course) {
    setEditingCourse(course);
    setEditForm({ title: course.title, description: course.description || "" });
  }

  function handleEditCancel() {
    setEditingCourse(null);
    setEditForm({ title: "", description: "" });
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await updateCourse(editingCourse._id, editForm, token);
      setCourses(courses.map((c) => (c._id === updated._id ? updated : c)));
      setEditingCourse(null);
      setMessage({ type: "success", text: "Cours modifié avec succès." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(courseId) {
    if (!window.confirm("Supprimer ce cours ? Cette action est irréversible.")) return;
    setLoading(true);
    try {
      await deleteCourse(courseId, token);
      setCourses(courses.filter((c) => c._id !== courseId));
      setMessage({ type: "success", text: "Cours supprimé." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  function handleQuizSubmit(e) {
    e.preventDefault();

    // Un quiz doit être rattaché à une leçon précise
    if (!quizLessonId) {
      setMessage({ type: "error", text: "Veuillez sélectionner une leçon pour ce QCM." });
      return;
    }

    setLoading(true);

    let finalBody = quizJson;
    try {
      const parsedJson = JSON.parse(quizJson);
      parsedJson.lesson = quizLessonId; // le back attend un champ "lesson"
      finalBody = JSON.stringify(parsedJson);
    } catch (err) {
      setMessage({ type: "error", text: "Le texte dans le champ n'est pas un JSON valide." });
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/admin/quizzes/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: finalBody,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur serveur");
        return data;
      })
      .then(() => {
        setMessage({ type: "success", text: "QCM importé avec succès." });
        setQuizJson("");
        setQuizCourseId("");
        setQuizLessonId("");
      })
      .catch((err) =>
        setMessage({ type: "error", text: err.message }),
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
        <div className="header-actions">
          <button className="btn-courses" onClick={() => setShowCourses((v) => !v)}>
            {showCourses ? "Fermer la liste" : "Liste des cours"}
          </button>
          <button className="btn-create-course" onClick={() => setShowCreateCourse((v) => !v)}>
            {showCreateCourse ? "Annuler" : "+ Créer un cours"}
          </button>
        </div>
      </div>

      {message && (
        <p className={`contenu-message ${message.type}`}>{message.text}</p>
      )}

      {showCreateCourse && (
        <div className="create-course-form">
          <h2>Créer un cours</h2>
          <form onSubmit={handleCourseSubmit}>
            <div className="form-group">
              <label>Titre</label>
              <input
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                placeholder="Ex : Histoire de la Mode"
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                placeholder="Courte description du cours (optionnel)"
              />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Création…" : "Créer le cours"}
            </button>
          </form>
        </div>
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
                <th>Actions</th>
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
                    <td className="muted">{course.description || "-"}</td>
                    <td className="muted">
                      {new Date(course.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditClick(course)}
                      >
                        Modifier
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(course._id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {editingCourse && (
            <div className="edit-course-form">
              <h3>Modifier : {editingCourse.title}</h3>
              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label>Titre</label>
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
                <div className="edit-course-actions">
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "Enregistrement…" : "Enregistrer"}
                  </button>
                  <button type="button" className="btn-cancel" onClick={handleEditCancel}>
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      <div className="contenu-grid">
        <div className="contenu-card">
          <h2>{editingLessonId ? "Modifier la leçon" : "Créer une leçon"}</h2>
          <form onSubmit={handleLessonSubmit}>
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

            {lessonForm.courseId && (
              <div className="mode-edition-box">
                <label>Mode édition : Sélectionner une leçon existante (Optionnel)</label>
                <select value={editingLessonId || ""} onChange={handleSelectLessonToEdit}>
                  <option value="">-- Nouvelle leçon --</option>
                  {courseLessons.map((l) => (
                    <option key={l._id} value={l._id}>{l.title}</option>
                  ))}
                </select>
              </div>
            )}

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
                    if (editor) editor.commands.setContent(html)
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
              {loading ? "Envoi…" : editingLessonId ? "Enregistrer les modifications" : "Créer la leçon"}
            </button>
          </form>
        </div>

        <div className="contenu-card">
          <h2>Importer un QCM</h2>
          <form onSubmit={handleQuizSubmit}>

            <div className="form-group">
              <label>Cours</label>
              <select
                value={quizCourseId}
                onChange={(e) => setQuizCourseId(e.target.value)}
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

            {/* Un quiz est rattaché à une leçon précise */}
            {quizCourseId && (
              <div className="form-group">
                <label>Leçon associée</label>
                <select
                  value={quizLessonId}
                  onChange={(e) => setQuizLessonId(e.target.value)}
                  required
                >
                  <option value="">-- Sélectionner une leçon --</option>
                  {quizLessons.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Importer depuis un fichier JSON</label>
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const jsonText = event.target.result;
                    setQuizJson(jsonText);
                  };
                  reader.readAsText(file);
                }}
              />
            </div>
            <div className="form-group">
              <label>Contenu du JSON</label>
              <textarea
                value={quizJson}
                onChange={(e) => setQuizJson(e.target.value)}
                rows={10}
                placeholder='{ "title": "Quiz JS", "passingScore": 60, "questions": [...] }'
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
