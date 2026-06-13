// URL de base : variable d'environnement en prod, localhost en dev
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242/api";

// Tous les cours de la plateforme (avec étudiants peuplés)
export async function getCourses(token) {
  const response = await fetch(`${API_URL}/admin/courses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

// Crée un étudiant — le back attend un tableau, d'où JSON.stringify([userData])
export async function createStudent(userData, token) {
  const response = await fetch(`${API_URL}/admin/users/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify([userData]),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

// Remplace la liste de cours d'un étudiant (PUT = remplacement total, pas ajout)
export async function assignCourses(userId, courseIds, token) {
  const response = await fetch(`${API_URL}/admin/users/${userId}/courses`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ courseIds }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

// Modifie le titre et/ou la description d'un cours
export async function updateCourse(id, data, token) {
  const response = await fetch(`${API_URL}/admin/courses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Erreur");
  return result;
}

// Supprime un cours (le back nettoie aussi les étudiants concernés)
export async function deleteCourse(id, token) {
  const response = await fetch(`${API_URL}/admin/courses/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Erreur");
  return result;
}

// 20 derniers passages de quiz avec étudiant et quiz peuplés (pour AdminNotes)
export async function getActivity(token) {
  const response = await fetch(`${API_URL}/admin/activity`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}
