import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getCourses, assignCourses } from "../api/admin.js";
import "./AdminEtudiants.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242/api";

function AdminEtudiants() {
  const { token } = useAuth();
  
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [allCourses, setAllCourses] = useState([]);
  
  const [showForm, setShowForm] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editCourseIds, setEditCourseIds] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStudents(data.filter((u) => u.role === "student"));
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger les étudiants.");
        setLoading(false);
      });

    getCourses(token).then(setAllCourses).catch(() => {});
  }, [token]);

  function handleCourseToggle(courseId) {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  }

  async function handleImportSubmit(e) {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const parsedUsers = JSON.parse(importJson);
      if (!Array.isArray(parsedUsers)) {
        throw new Error("Format invalide : Un tableau d'objets est attendu.");
      }

      const response = await fetch(`${API_URL}/admin/users/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(parsedUsers),
      });

      if (!response.ok) {
        throw new Error("Erreur serveur lors de l'importation.");
      }

      const result = await response.json();
      let finalStudents = [...result.created];

      if (selectedCourseIds.length > 0 && finalStudents.length > 0) {
        for (let i = 0; i < finalStudents.length; i++) {
          finalStudents[i] = await assignCourses(finalStudents[i]._id, selectedCourseIds, token);
        }
      }

      setStudents((prev) => [...prev, ...finalStudents]);
      setShowForm(false);
      setImportJson("");
      setSelectedCourseIds([]);
      alert(`Import terminé : ${result.created.length} ajout(s), ${result.skipped.length} ignoré(s).`);
      
    } catch (err) {
      setFormError(err.message || "Erreur lors du traitement JSON.");
    } finally {
      setFormLoading(false);
    }
  }

  function handleAssignOpen(student) {
    setEditingStudentId(student._id);
    setEditCourseIds(student.courses?.map((c) => c._id) ?? []);
    setEditError(null);
  }

  function handleEditToggle(courseId) {
    setEditCourseIds((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  }

  async function handleAssignSubmit(studentId) {
    setEditLoading(true);
    setEditError(null);
    try {
      const updated = await assignCourses(studentId, editCourseIds, token);
      setStudents((prev) =>
        prev.map((s) => (s._id === studentId ? { ...s, courses: updated.courses } : s))
      );
      setEditingStudentId(null);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  }

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-etudiants">
      <div className="etudiants-header">
        <div>
          <h1>Étudiants</h1>
          <p>{students.length} inscrits sur la plateforme</p>
        </div>
        <button className="btn-add" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Annuler" : "Importer une liste +"}
        </button>
      </div>

      {showForm && (
        <form className="student-form" onSubmit={handleImportSubmit}>
          <h2>Importer des étudiants (JSON)</h2>
          <p className="muted" style={{ marginBottom: '16px', fontSize: '13px' }}>
            Format attendu : <code>{`[{"name": "Jean Dupont", "email": "jean@test.fr", "role": "student"}]`}</code>
          </p>
          
          {formError && <p className="state-msg error">{formError}</p>}
          
          <div className="form-group">
            <label>Upload du fichier ou saisie brute JSON</label>
            <input
              type="file"
              accept=".json"
              style={{ marginBottom: '10px' }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => setImportJson(event.target.result);
                reader.readAsText(file);
              }}
            />
            <textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              rows={8}
              placeholder='[ { "name": "Jane Doe", "email": "jane@test.com", "role": "student" } ]'
              required
            />
          </div>

          {allCourses.length > 0 && (
            <div className="form-group">
              <label>Assignation automatique aux cours existants (Optionnel)</label>
              <div className="courses-checkboxes">
                {allCourses.map((course) => (
                  <label key={course._id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedCourseIds.includes(course._id)}
                      onChange={() => handleCourseToggle(course._id)}
                    />
                    {course.title}
                  </label>
                ))}
              </div>
            </div>
          )}
          <button type="submit" className="submit-btn" disabled={formLoading}>
            {formLoading ? "Importation en cours…" : "Exécuter l'import"}
          </button>
        </form>
      )}

      <div className="etudiants-toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Rechercher par nom ou email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <p className="state-msg">Chargement…</p>}
      {error && <p className="state-msg error">{error}</p>}

      {!loading && !error && (
        <div className="table-container">
          <table className="etudiants-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Cours assignés</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            {filtered.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={5} className="empty">Aucun étudiant trouvé.</td>
                </tr>
              </tbody>
            ) : (
              filtered.map((s) => (
                <tbody key={s._id} className="student-card-group">
                  <tr>
                    <td data-label="Nom" className="bold">{s.name}</td>
                    <td data-label="Email" className="muted">{s.email}</td>
                    <td data-label="Cours assignés">
                      {s.courses?.length > 0
                        ? s.courses.map((c) => (
                            <span key={c._id} className="course-tag">{c.title}</span>
                          ))
                        : <span className="muted">-</span>}
                    </td>
                    <td data-label="Statut">
                      {s.isFirstLogin
                        ? <span className="badge pending">En attente</span>
                        : <span className="badge active">Actif</span>}
                    </td>
                    <td data-label="Actions">
                      <button
                        className="btn-assign"
                        onClick={() =>
                          editingStudentId === s._id
                            ? setEditingStudentId(null)
                            : handleAssignOpen(s)
                        }
                      >
                        {editingStudentId === s._id ? "Annuler" : "Gérer les cours"}
                      </button>
                    </td>
                  </tr>
                  {editingStudentId === s._id && (
                    <tr className="assign-row">
                      <td colSpan={5}>
                        {editError && <p className="state-msg error">{editError}</p>}
                        <div className="assign-panel">
                          <div className="courses-checkboxes">
                            {allCourses.map((course) => (
                              <label key={course._id} className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={editCourseIds.includes(course._id)}
                                  onChange={() => handleEditToggle(course._id)}
                                />
                                {course.title}
                              </label>
                            ))}
                          </div>
                          <button
                            className="submit-btn assign-save-btn"
                            onClick={() => handleAssignSubmit(s._id)}
                            disabled={editLoading}
                          >
                            {editLoading ? "Enregistrement…" : "Enregistrer"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              ))
            )}
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminEtudiants;