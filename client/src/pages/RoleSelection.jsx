import { useNavigate } from "react-router-dom";
import "./RoleSelection.css";

function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="role-page">
      <video
        className="video-bg"
        autoPlay
        muted
        loop
        playsInline
        src="/bg-video.mp4"
      />
      <div className="role-header">
        <h1>CORELAB</h1>
        <p className="role-tagline">Atelier Numérique de la Mode</p>
        <p className="role-instruction">
          Choisissez votre espace pour continuer
        </p>
      </div>

      <div className="role-cards">
        <div className="role-card admin">
          <div className="role-icon">▣</div>
          <h2>Espace Admin</h2>
          <p>Gérez les cohortes, les cours, les QCM et le planning.</p>
          <ul>
            <li>Dashboard & statistiques</li>
            <li>Gestion des étudiants</li>
            <li>Création de contenu</li>
            <li>Notes & évaluations</li>
          </ul>
          <button
            onClick={() => navigate("/login", { state: { role: "admin" } })}
          >
            Accéder - Espace Admin →
          </button>
        </div>

        <div className="role-card student">
          <div className="role-icon">◈</div>
          <h2>Espace Étudiant</h2>
          <p>
            Accédez à vos cours, suivez votre progression et passez vos QCM.
          </p>
          <ul>
            <li>Mon parcours & progression</li>
            <li>Bibliothèque de leçons</li>
            <li>Examens & résultats</li>
            <li>Certifications</li>
          </ul>
          <button
            onClick={() => navigate("/login", { state: { role: "student" } })}
          >
            Accéder - Espace Étudiant →
          </button>
        </div>
      </div>

      <footer className="role-footer">
        <p>© 2026 Corelab - Atelier Numérique de la Mode · AW 2026</p>
        <p>Première connexion ? Contactez votre administrateur de cohorte.</p>
      </footer>
    </div>
  );
}

export default RoleSelection;
