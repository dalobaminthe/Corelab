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

      {/* Tableau : student et quiz sont "peuplés" par le back (populate) */}
      {!loading && !error && attempts.length > 0 && (
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
                <td>{attempt.student?.name ?? "—"}</td>
                {/* quiz.lesson.title : accès imbriqué grâce au populate du back */}
                <td>{attempt.quiz?.lesson?.title ?? "—"}</td>
                <td>{attempt.quiz?.title ?? "—"}</td>
                <td>{attempt.score} / 100</td>
                <td>
                  <span className={`result-badge ${attempt.passed ? "passed" : "failed"}`}>
                    {attempt.passed ? "Réussi" : "Échoué"}
                  </span>
                </td>
                <td>{new Date(attempt.attemptedAt).toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminNotes;
