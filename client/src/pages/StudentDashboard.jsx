import "./StudentDashboard.css";

const mockModules = [
  { name: "Histoire de la Mode", progress: 85, lessons: "6/7" },
  { name: "Stylisme & Création", progress: 60, lessons: "3/5" },
  { name: "Textile & Matières", progress: 40, lessons: "2/5" },
  { name: "Couture & Patronage", progress: 75, lessons: "3/4" },
  { name: "Mode Digitale", progress: 20, lessons: "1/5" },
  { name: "Mode Mondiale", progress: 50, lessons: "2/4" },
];

const mockActivity = [
  {
    type: "success",
    text: "QCM Histoire — Module 1 validé",
    detail: "Score : 18/20",
    time: "Il y a 2j",
  },
  {
    type: "lesson",
    text: "Leçon : Fibres naturelles et synthétiques",
    detail: "Vue à 80%",
    time: "Il y a 3j",
  },
  {
    type: "cert",
    text: "Certificat Stylisme & Création obtenu",
    detail: "Félicitations !",
    time: "Il y a 5j",
  },
  {
    type: "fail",
    text: "QCM Couture — Module 2 à repasser",
    detail: "Score insuffisant : 8/20",
    time: "Il y a 7j",
  },
];

function StudentDashboard() {
  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Mon Parcours</h1>
          <p>Bienvenue, Amara</p>
        </div>
        <span className="season-badge">AW 2026</span>
      </div>

      <div className="dashboard-body">
        {/* Colonne gauche */}
        <div className="dashboard-left">
          {/* Carte bienvenue */}
          <div className="welcome-card">
            <h2>Bonne reprise, Amara ✦</h2>
            <p>Stylisme 2024 · Paris — Milan · Semestre 3 en cours · AW 2026</p>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <small>Cours suivis</small>
              <strong>8 / 12</strong>
              <span>67% complété</span>
            </div>
            <div className="stat-card">
              <small>Moyenne générale</small>
              <strong>17,6</strong>
              <span>sur 20 · Excellent</span>
            </div>
            <div className="stat-card">
              <small>Prochain examen</small>
              <strong>15 Sep</strong>
              <span>Histoire — QCM 03</span>
            </div>
            <div className="stat-card">
              <small>Certificats</small>
              <strong>2</strong>
              <span>obtenus cette année</span>
            </div>
          </div>

          {/* Progression */}
          <div className="progress-section">
            <h3>Progression par Module</h3>
            {mockModules.map((module) => (
              <div key={module.name} className="progress-row">
                <div className="progress-info">
                  <span>{module.name}</span>
                  <span>
                    {module.lessons} leçons · {module.progress}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${module.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panneau droit */}
        <div className="dashboard-right">
          <div className="next-lesson-card">
            <small>Prochaine Leçon</small>
            <h3>L'évolution du costume occidental — XVIIe au XXe</h3>
            <div className="lesson-meta">
              <div>
                <small>Module</small>
                <span>Histoire de la Mode</span>
              </div>
              <div>
                <small>Durée</small>
                <span>45 min</span>
              </div>
              <div>
                <small>Semestre</small>
                <span>3 — AW 2026</span>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "75%" }} />
            </div>
            <button className="resume-btn">▶ Reprendre la leçon</button>
          </div>

          <div className="activity-section">
            <h3>Activité Récente</h3>
            {mockActivity.map((item, i) => (
              <div key={i} className={`activity-item ${item.type}`}>
                <div>
                  <p>{item.text}</p>
                  <small>{item.detail}</small>
                </div>
                <span>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
