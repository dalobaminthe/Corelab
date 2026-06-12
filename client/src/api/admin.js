const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242/api";

export async function getCourses(token) {
  const response = await fetch(`${API_URL}/admin/courses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}

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

export async function getActivity(token) {
  const response = await fetch(`${API_URL}/admin/activity`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}
