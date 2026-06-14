import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getCourses } from "../api/admin.js";
import "./AdminPlanning.css";

// Résolution de l'URL de l'API via les variables d'environnement
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242/api";

// Page de planification : permet de modifier la date de mise à disposition
// d'une leçon (PATCH /api/admin/lessons/:id/schedule).
function AdminPlanning() {
  const { token } = useAuth();

  const [courses, setCourses] = useState([]);       // liste des cours (pour le filtre)
  const [selectedCourse, setSelectedCourse] = useState(""); // cours sélectionné
  const [lessons, setLessons] = useState([]);       // leçons du cours sélectionné
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  // editingId stocke l'ID de la leçon en cours d'édition (pas un booléen)
  const [editingId, setEditingId] = useState(null);
  const [newDate, setNewDate] = useState("");

  // Charge les cours au montage
  useEffect(() => {
    getCourses(token)
      .then((data) => setCourses(data))
      .catch(() => setMessage({ type: "error", text: "Impossible de charger les cours." }));
  }, [token]);

  // Recharge les leçons à chaque changement de cours sélectionné
  useEffect(() => {
    if (!selectedCourse) {
      setLessons([]);
      return;
    }
    setLoading(true);
    // On récupère toutes les leçons du cours via la route admin
    fetch(`${API_URL}/admin/lessons?courseId=${selectedCourse}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setLessons(data);
        setLoading(false);
      })
      .catch(() => {
        setMessage({ type: "error", text: "Impossible de charger les leçons." });
        setLoading(false);
      });
  }, [selectedCourse, token]);

  // Envoie la nouvelle date de disponibilité au back
  async function handleSchedule(lessonId) {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(
        `${API_URL}/admin/lessons/${lessonId}/schedule`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ availableFrom: new Date(newDate).toISOString() }),
        }
      );
      if (!res.ok) throw new Error("Erreur lors de la planification");
      const updated = await res.json();
      // Met à jour la leçon dans la liste locale
      setLessons((prev) =>
        prev.map((l) => (l._id === updated._id ? updated : l))
      );
      setEditingId(null);
      setNewDate("");
      setMessage({ type: "success", text: "Date mise à jour." });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-planning">
      <div className="planning-header">
        <h1>Planning</h1>
        <p>Planifiez la date de mise à disposition des leçons</p>
      </div>

      {message && (
        <p className={`planning-message ${message.type}`}>{message.text}</p>
      )}

      {/* Sélecteur de cours */}
      <div className="planning-filter">
        <label>Cours</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">-- Sélectionner un cours --</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="planning-state">Chargement…</p>}

      {!loading && selectedCourse && lessons.length === 0 && (
        <p className="planning-state">Aucune leçon disponible pour ce cours.</p>
      )}

      {/* Liste des leçons avec leur date actuelle et le bouton de planification */}
      {lessons.length > 0 && (
        <table className="planning-table">
          <thead>
            <tr>
              <th>Leçon</th>
              <th>Disponible à partir du</th>
              <th>Statut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => {
              const isAvailable = new Date(lesson.availableFrom) <= new Date();
              return (
                <tr key={lesson._id}>
                  <td className="lesson-title">{lesson.title}</td>
                  <td className="muted">
                    {new Date(lesson.availableFrom).toLocaleString("fr-FR")}
                  </td>
                  <td>
                    <span className={`status-badge ${isAvailable ? "available" : "scheduled"}`}>
                      {isAvailable ? "Disponible" : "Planifiée"}
                    </span>
                  </td>
                  <td>
                    {editingId === lesson._id ? (
                      <div className="schedule-edit">
                        <input
                          type="datetime-local"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                        />
                        <button
                          className="btn-save"
                          onClick={() => handleSchedule(lesson._id)}
                          disabled={!newDate || loading}
                        >
                          OK
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => setEditingId(null)}
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn-schedule"
                        onClick={() => {
                          setEditingId(lesson._id);
                          setNewDate("");
                        }}
                      >
                        Planifier
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminPlanning;