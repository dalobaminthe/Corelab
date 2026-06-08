const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242/api";

export async function fetchProgress(courseId, token) {
  const response = await fetch(`${API_URL}/student/progress/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}
