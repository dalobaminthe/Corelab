import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./AdminEtudiants.css";

function AdminEtudiants() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4242/api/admin/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const studentsOnly = data.filter((u) => u.role === "student");
        setStudents(studentsOnly);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger les étudiants.");
        setLoading(false);
      });
  }, [token]);

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
      </div>

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
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty">Aucun étudiant trouvé.</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s._id}>
                    <td className="bold">{s.name}</td>
                    <td className="muted">{s.email}</td>
                    <td>
                      {s.courses?.length > 0
                        ? s.courses.map((c) => (
                            <span key={c._id} className="course-tag">
                              {c.title}
                            </span>
                          ))
                        : <span className="muted">—</span>}
                    </td>
                    <td>
                      {s.isFirstLogin
                        ? <span className="badge pending">En attente</span>
                        : <span className="badge active">Actif</span>}
                    </td>
                  </tr>
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
