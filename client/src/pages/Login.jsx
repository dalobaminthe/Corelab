import "./Login.css";
import { useLocation } from "react-router-dom";

function LoginPage() {
  const location = useLocation();
  const role = location.state?.role;
  return (
    <div className={`login-page ${role === `student` ? `student` : ""}`}>
      <video
        className="video-bg"
        autoPlay
        muted
        loop
        playsInline
        src="/bg-video.mp4"
      />
      {/* Colonne gauche — présentation */}
      <div className="left-panel">
        <span className="tag">SS 2026</span>
        <h1>Corelab</h1>
        <p className="subtitle">
          La plateforme d'excellence pour les métiers de la Mode.
        </p>
        <p className="description">
          Apprenez auprès des meilleurs experts en stylisme, textile et culture
          mode.
        </p>

        <ul className="course-list">
          <li>Histoire & Culture de la Mode</li>
          <li>Stylisme, Couture & Patronage</li>
          <li>Mode Mondiale — Paris, Tokyo, Lagos, NYC</li>
          <li>Textile, Matières & Tendances Saisonnières</li>
        </ul>

        <div className="collection-card">
          <span>Collection en cours</span>
          <p>Automne — Hiver 2026 · Régions : Europe, Asie, Afrique</p>
          <small>12 nouvelles leçons disponibles ce trimestre</small>
        </div>

        <footer>© 2026 Corelab — École de Mode Digitale</footer>
      </div>

      {/* Colonne droite — formulaire */}
      <div className="right-panel">
        <div className="login-card">
          <h2>Connexion</h2>
          <p>Accédez à votre espace formation mode.</p>

          <form>
            <label>Adresse email</label>
            <input type="email" placeholder="exemple@ecole-mode.fr" />

            <label>Mot de passe</label>
            <input type="password" placeholder="••••••••" />
            <a href="#">Mot de passe oublié ?</a>

            <button type="submit">SE CONNECTER</button>
          </form>

          <div className="divider">ou</div>

          <button className="first-login">
            Première connexion ? Activer mon compte →
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
