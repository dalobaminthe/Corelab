const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242/api";

function getToken() {
  return localStorage.getItem("token");
}

export async function fetchProgress(courseId, token) {
  const response = await fetch(`${API_URL}/student/progress/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}

export async function getLessons(courseId) {
  const response = await fetch(`${API_URL}/student/lessons?courseId=${courseId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

export async function getLesson(id) {
  const response = await fetch(`${API_URL}/student/lessons/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

export async function getQuiz(id) {
  const response = await fetch(`${API_URL}/student/quizzes/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

export async function submitQuiz(quizId, answers) {
  const response = await fetch(`${API_URL}/student/quizzes/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ quizId, answers }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}
