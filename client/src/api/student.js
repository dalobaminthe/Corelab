// URL de base de l'API — utilise la variable d'environnement Vite en priorité
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242/api";

// Récupère la progression d'un étudiant dans un cours
// Retourne { progressPercent, completedLessons, totalLessons }
// Le token est envoyé dans le header car la route est protégée (verifyToken côté backend)
export async function fetchProgress(courseId, token) {
  const response = await fetch(`${API_URL}/student/progress/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}
