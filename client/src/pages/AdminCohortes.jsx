import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getCourses } from "../api/admin.js";
import "./AdminCohortes.css";

// Une cohorte = un cours avec ses étudiants assignés.
// Cette page liste chaque cours et les étudiants qui y sont rattachés.
function AdminCohortes() {
  const { token } = useAuth();

  const [courses, setCourses] = useState([]); // cours avec étudiants peuplés
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charge les cours (avec leurs étudiants) au montage
  useEffect(() => {
    getCourses(token)
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  return (
    <div className="admin-cohortes">
      <div className="cohortes-header">
        <h1>Cohortes</h1>
        <p>Chaque cours représente une cohorte d'étudiants</p>
      </div>

      {loading && <p className="cohortes-state">Chargement…</p>}
      {error && <p className="cohortes-state cohortes-error">{error}</p>}

      {!loading && !error && courses.length === 0 && (
        <p className="cohortes-state">Aucune cohorte pour le moment.</p>
      )}

      {/* Une carte par cohorte (cours) avec la liste de ses étudiants */}
      <div className="cohortes-grid">
        {courses.map((course) => (
          <div key={course._id} className="cohorte-card">
            <div className="cohorte-card-head">
              <h2>{course.title}</h2>
              <span className="cohorte-count">
                {course.students?.length ?? 0} étudiant
                {(course.students?.length ?? 0) > 1 ? "s" : ""}
              </span>
            </div>
            {course.description && (
              <p className="cohorte-desc">{course.description}</p>
            )}
            {/* Liste des étudiants rattachés à cette cohorte */}
            <div className="cohorte-students">
              {course.students?.length > 0 ? (
                course.students.map((student) => (
                  <div key={student._id} className="cohorte-student">
                    <div className="student-avatar">
                      {student.name?.[0] ?? "?"}
                    </div>
                    <div>
                      <p className="student-name">{student.name}</p>
                      <small className="student-email">{student.email}</small>
                    </div>
                  </div>
                ))
              ) : (
                <p className="cohorte-empty">Aucun étudiant assigné.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminCohortes;