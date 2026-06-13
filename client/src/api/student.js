// URL de base : variable d'environnement en prod, localhost en dev
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242/api";

// Cours assignés à l'étudiant connecté (titre + leçons inclus)
export async function getStudentCourses(token) {
  const response = await fetch(`${API_URL}/student/courses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

// Progression d'un cours : % complété, leçons faites / total
export async function fetchProgress(courseId, token) {
  const response = await fetch(`${API_URL}/student/progress/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}

// Leçons disponibles d'un cours (filtrées par date côté back)
export async function getLessons(courseId, token) {
  const response = await fetch(
    `${API_URL}/student/lessons?courseId=${courseId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

// Quiz lié à une leçon (sans les bonnes réponses, masquées côté back)
export async function getLessonQuiz(lessonId, token) {
  const response = await fetch(`${API_URL}/student/lessons/${lessonId}/quiz`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

// Contenu complet d'une leçon (HTML stocké en base)
export async function getLesson(id, token) {
  const response = await fetch(`${API_URL}/student/lessons/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

// Quiz par son ID, utilisé sur la page QuizPage
export async function getQuiz(id, token) {
  const response = await fetch(`${API_URL}/student/quizzes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

// Soumet les réponses et retourne score, passed, et le détail question par question
export async function submitQuiz(quizId, answers, token) {
  const response = await fetch(`${API_URL}/student/quizzes/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quizId, answers }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

// Tous les passages de quiz de l'étudiant, triés du plus récent au plus ancien
export async function getAttempts(token) {
  const response = await fetch(`${API_URL}/student/attempts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

// Notifications de l'étudiant (non lues en premier)
export async function getNotifications(token) {
  const response = await fetch(`${API_URL}/student/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

// Marque une notification comme lue via PATCH
export async function markNotificationRead(id, token) {
  const response = await fetch(`${API_URL}/student/notifications/${id}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}
