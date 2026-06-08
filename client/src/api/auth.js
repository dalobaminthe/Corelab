const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4242/api";

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erreur de connexion");
  }

  return data;
}

export async function setPassword(newPassword, token) {
  const response = await fetch(`${API_URL}/auth/set-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newPassword }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erreur");
  return data;
}
