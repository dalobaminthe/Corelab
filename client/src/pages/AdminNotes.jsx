import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getActivity } from "../api/admin.js";
import "./AdminNotes.css";

function AdminNotes() {
  const { token } = useAuth();

  // ── États ──────────────────────────────────────────────────────────────────
  const [attempts, setAttempts] = useState([]); // 20 derniers passages de quiz
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Charge l'activité au montage ───────────────────────────────────────────
  useEffect(() => {
    getActivity(token)
      .then((data) => {
        setAttempts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div className="admin-notes">
      <div className="notes-header">
        <h1>Notes & Résultats</h1>
        <p>20 dernières tentatives de quiz</p>
      </div>

      {loading && <p className="notes-state">Chargement…</p>}
      {error && <p className="notes-state notes-error">{error}</p>}

      {!loading && !error && attempts.length === 0 && (
        <p className="notes-state">Aucune tentative enregistrée.</p>
      )}

      {/* Tableau enveloppé dans une div pour le responsive adaptatif */}
      {!loading && !error && attempts.length > 0 && (
        <div className="table-container">
          <table className="notes-table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Leçon</th>
                <th>Quiz</th>
                <th>Score</th>
                <th>Résultat</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt._id}>
                  <td data-label="Étudiant">{attempt.student?.name ?? "-"}</td>
                  {/* quiz.lesson.title : accès imbriqué grâce au populate du back */}
                  <td data-label="Leçon">{attempt.quiz?.lesson?.title ?? "-"}</td>
                  <td data-label="Quiz">{attempt.quiz?.title ?? "-"}</td>
                  <td data-label="Score">{attempt.score} / 100</td>
                  <td data-label="Résultat">
                    <span className={`result-badge ${attempt.passed ? "passed" : "failed"}`}>
                      {attempt.passed ? "Réussi" : "Échoué"}
                    </span>
                  </td>
                  <td data-label="Date">{new Date(attempt.attemptedAt).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminNotes;