import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { setPassword } from "../api/auth.js";
import "./SetPassword.css";

// Page affichée quand isFirstLogin === true
// Permet au nouvel utilisateur de choisir son mot de passe personnel
function SetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false); // afficher/masquer les mots de passe
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { token, user, login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validation locale AVANT l'appel API — inutile d'appeler le backend si invalide
    if (newPassword !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    try {
      // Le backend renvoie un nouveau token avec isFirstLogin: false
      const data = await setPassword(newPassword, token);
      // On met à jour le context avec le nouveau token
      login(data.user, data.token);
      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="setpassword-page">
      <div className="setpassword-card">
        <h1>CORELAB</h1>
        <h2>Bienvenue, {user?.name} !</h2>
        <p>
          Avant d'accéder à votre espace, choisissez votre mot de passe
          personnel.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Nouveau mot de passe</label>
          {/* Le même toggle s'applique aux deux champs pour rester cohérent */}
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="8 caractères minimum"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          <label>Confirmer le mot de passe</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Répétez votre mot de passe"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit">Confirmer mon mot de passe</button>
        </form>
      </div>
    </div>
  );
}

export default SetPassword;
