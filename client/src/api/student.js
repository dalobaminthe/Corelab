const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242/api";

export async function getStudentCourses(token) {
  const response = await fetch(`${API_URL}/student/courses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

export async function fetchProgress(courseId, token) {
  const response = await fetch(`${API_URL}/student/progress/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}

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

export async function getLessonQuiz(lessonId, token) {
  const response = await fetch(`${API_URL}/student/lessons/${lessonId}/quiz`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

export async function getLesson(id, token) {
  const response = await fetch(`${API_URL}/student/lessons/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

export async function getQuiz(id, token) {
  const response = await fetch(`${API_URL}/student/quizzes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

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

export async function getAttempts(token) {
  const response = await fetch(`${API_URL}/student/attempts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

export async function getNotifications(token) {
  const response = await fetch(`${API_URL}/student/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

export async function markNotificationRead(id, token) {
  const response = await fetch(`${API_URL}/student/notifications/${id}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}
