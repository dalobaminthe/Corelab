import "./Login.css";
import { useState } from "react";
import { useLocation, useNavigate, Link, Navigate } from "react-router-dom";
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

  // Si on arrive sur /login sans avoir choisi d'espace (reload, accès direct),
  // on renvoie vers la page de sélection pour choisir Admin ou Étudiant
  if (!role) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await loginUser(email, password);
      login(data.user, data.token);
      // La redirection se fait selon le rôle réel du compte, pas selon le formulaire choisi
      if (data.isFirstLogin) {
        navigate("/set-password");
      } else if (data.user.role === "admin") {
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
          <h1>CORELAB</h1>
          <span>Atelier Numérique de la Mode</span>
        </div>

        <div className="panel-title">
          <p className="panel-espace">Espace</p>
          <h2>{isAdmin ? "Administrateur" : "Étudiant"}</h2>
          <div className="panel-divider" />
          <span className="panel-badge">
            {isAdmin ? "⬛ Accès restreint" : "◈ Espace de formation"}
          </span>
          <p className="panel-desc">
            {isAdmin
              ? "Gérez votre plateforme, vos cohortes et vos contenus depuis un espace dédié."
              : "Suivez vos cours, progressez à votre rythme et passez vos examens."}
          </p>
        </div>

        <Link to="/" className="change-space">
          ← Changer d'espace
        </Link>
      </div>

      {/* Panneau droit - formulaire */}
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
              placeholder={isAdmin ? "admin@corelab.dev" : "prenom.nom@corelab.dev"}
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
                {showPassword ? (
                /* Œil ouvert */
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              ) : (
                /* Œil fermé / barré */
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-7-10-7a16.42 16.42 0 0 1 2.18-3.94M8.84 8.84A3 3 0 0 0 13.16 13.16"/><path d="M2 2l20 20"/><path d="M9.88 4.22A10.16 10.16 0 0 1 12 4c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/></svg>
              )}
              </button>
            </div>

            <button type="submit" className="submit-btn">
              {isAdmin
                ? "Se connecter - Espace Admin"
                : "Se connecter - Espace Étudiant"}
            </button>
            {error && <p className="error">{error}</p>}
          </form>

          <p className="forgot">
            {isAdmin
              ? "Mot de passe oublié ? Contactez l'équipe Corelab"
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
              <p>Vous êtes admin ?</p>
              <Link to="/login" state={{ role: "admin" }}>
                → Accéder à l'espace Admin
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
