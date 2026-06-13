import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getCourses, createStudent, assignCourses } from "../api/admin.js";
import "./AdminEtudiants.css";

function AdminEtudiants() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [newStudent, setNewStudent] = useState({ name: "", email: "" });
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editCourseIds, setEditCourseIds] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4242/api/admin/users", {
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

  async function handleSubmit(e) {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const result = await createStudent(
        { name: newStudent.name, email: newStudent.email, role: "student" },
        token
      );
      const created = result.created[0];

      let finalStudent = created;
      if (selectedCourseIds.length > 0) {
        finalStudent = await assignCourses(created._id, selectedCourseIds, token);
      }

      setStudents((prev) => [...prev, finalStudent]);
      setShowForm(false);
      setNewStudent({ name: "", email: "" });
      setSelectedCourseIds([]);
    } catch (err) {
      setFormError(err.message);
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
          {showForm ? "Annuler" : "Nouvel étudiant +"}
        </button>
      </div>

      {showForm && (
        <form className="student-form" onSubmit={handleSubmit}>
          <h2>Ajouter un étudiant</h2>
          {formError && <p className="state-msg error">{formError}</p>}
          <div className="form-row">
            <div className="form-group">
              <label>Nom complet</label>
              <input
                value={newStudent.name}
                onChange={(e) => setNewStudent((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={newStudent.email}
                onChange={(e) => setNewStudent((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>
          {allCourses.length > 0 && (
            <div className="form-group">
              <label>Assigner à une cohorte (cours)</label>
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
            {formLoading ? "Création…" : "Créer l'étudiant"}
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
        <div className="etudiants-table-wrap">
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
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty">Aucun étudiant trouvé.</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <>
                    <tr key={s._id}>
                      <td className="bold">{s.name}</td>
                      <td className="muted">{s.email}</td>
                      <td>
                        {s.courses?.length > 0
                          ? s.courses.map((c) => (
                              <span key={c._id} className="course-tag">{c.title}</span>
                            ))
                          : <span className="muted">—</span>}
                      </td>
                      <td>
                        {s.isFirstLogin
                          ? <span className="badge pending">En attente</span>
                          : <span className="badge active">Actif</span>}
                      </td>
                      <td>
                        <button
                          className="btn-assign"
                          onClick={() =>
                            editingStudentId === s._id
                              ? setEditingStudentId(null)
                              : handleAssignOpen(s)
                          }
                        >
                          {editingStudentId === s._id ? "Annuler" : "Assigner cours"}
                        </button>
                      </td>
                    </tr>
                    {editingStudentId === s._id && (
                      <tr key={`${s._id}-edit`} className="assign-row">
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
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminEtudiants;
