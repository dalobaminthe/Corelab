const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242/api";

export async function getActivity(token) {
  const response = await fetch(`${API_URL}/admin/activity`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}
