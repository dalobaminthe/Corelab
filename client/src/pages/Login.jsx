import "./Login.css";
import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../api/auth";

function LoginPage() {
  const location = useLocation();
  const role = location.state?.role;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await loginUser(email, password);
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

  const isAdmin = role === "admin";

  return (
    <div className={`login-page ${isAdmin ? "admin" : "student"}`}>
      <video
        className="video-bg"
        autoPlay
        muted
        loop
        playsInline
        src="/bg-video.mp4"
      />

      {/* Panneau gauche */}
      <div className="left-panel">
        <div className="panel-logo">
          <h1>CORLAB</h1>
          <span>Atelier Numérique de la Mode</span>
        </div>

        <div className="panel-title">
          <p className="panel-espace">Espace</p>
          <h2>{isAdmin ? "Administrateur" : "Étudiant"}</h2>
          <div className="panel-divider" />
          <span className="panel-badge">
            {isAdmin ? "⬛ Accès restreint" : "◈ AW 2026 en cours"}
          </span>
          <p className="panel-desc">
            {isAdmin
              ? "Gérez votre plateforme, vos cohortes et vos contenus depuis un espace dédié."
              : "Suivez vos cours, progressez à votre rythme et obtenez vos certificats de mode."}
          </p>
        </div>

        {isAdmin ? (
          <div className="admin-stats">
            <div>
              <strong>42</strong>
              <small>Étudiants actifs</small>
            </div>
            <div>
              <strong>6</strong>
              <small>Modules en cours</small>
            </div>
            <div>
              <strong>AW</strong>
              <small>Saison 2026</small>
            </div>
          </div>
        ) : (
          <div className="module-list">
            <small>Modules disponibles</small>
            <ul>
              <li>Histoire de la Mode</li>
              <li>Stylisme & Création</li>
              <li>Textile & Matières</li>
              <li>Couture & Patronage</li>
              <li>Mode Digitale</li>
              <li>Mode Mondiale</li>
            </ul>
          </div>
        )}

        <Link to="/" className="change-space">
          ← Changer d'espace
        </Link>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="right-panel">
        <div className="login-card">
          <h2>{isAdmin ? "Connexion Admin" : "Connexion Étudiant"}</h2>
          <p>
            {isAdmin
              ? "Entrez vos identifiants administrateur"
              : "Entrez vos identifiants pour accéder à vos cours"}
          </p>

          <form onSubmit={handleSubmit}>
            <label>Adresse e-mail</label>
            <input
              type="email"
              placeholder={
                isAdmin ? "admin@corlab.fr" : "prenom.nom@ecole-mode.fr"
              }
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <label>Mot de passe</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            <div className="info-banner">
              {isAdmin
                ? "⬛ Vous vous connectez en tant qu'Administrateur"
                : "◈ Cohorte détectée : Stylisme 2024 — Paris · Milan"}
            </div>

            <button type="submit" className="submit-btn">
              {isAdmin
                ? "Se connecter — Espace Admin"
                : "Se connecter — Espace Étudiant"}
            </button>
            {error && <p className="error">{error}</p>}
          </form>

          <p className="forgot">
            {isAdmin
              ? "Mot de passe oublié ? Contactez l'équipe Corlab"
              : "Mot de passe oublié ? Contactez votre professeur référent"}
          </p>
          <div className="card-divider" />

          {isAdmin ? (
            <div className="switch-role">
              <p>Vous êtes étudiant ?</p>
              <Link to="/login" state={{ role: "student" }}>
                → Accéder à l'espace Étudiant
              </Link>
            </div>
          ) : (
            <div className="switch-role">
              <p>
                Première connexion ?{" "}
                <Link to="/login" state={{ role: "student" }}>
                  → Configurer mon compte
                </Link>
              </p>
              <p>
                Vous êtes admin ?{" "}
                <Link to="/login" state={{ role: "admin" }}>
                  → Accéder à l'espace Admin
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
