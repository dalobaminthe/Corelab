# Corelab — LMS E-learning

> Plateforme de gestion de formations (Learning Management System) développée avec la stack MERN.

---

## Stack Technique

| Catégorie | Technologies |
|---|---|
| **Frontend** | ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) |
| **Backend** | ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) |
| **Base de données** | ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) |
| **Auth** | ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white) ![bcrypt](https://img.shields.io/badge/bcrypt-003A70?style=for-the-badge&logo=letsencrypt&logoColor=white) |
| **Tests** | ![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white) ![Supertest](https://img.shields.io/badge/Supertest-000000?style=for-the-badge&logo=node.js&logoColor=white) |
| **Infra** | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) |

---

## Prérequis

- Node.js v20+
- npm
- Docker & Docker Compose (optionnel, recommandé)

---

## Lancement avec Docker (recommandé)

Copie le fichier d'environnement et renseigne les valeurs :

```bash
cp .env.example .env
```

Lance l'application complète (backend, frontend, MongoDB) :

```bash
docker compose up --build
```

- Frontend : http://localhost:3000
- Backend : http://localhost:4242
- Health check : http://localhost:4242/health

---

## Lancement sans Docker

### Variables d'environnement (voir env exemple)

**`server/.env`** (copier depuis `server/.env.example`) :

```
PORT=4242
MONGODB_URI=mongodb://localhost:27017/corelab
MONGODB_URI_TEST=mongodb://localhost:27017/corelab_test
JWT_SECRET=ton_secret_ici
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

**`client/.env`** (copier depuis `client/.env.example`) :

```
VITE_API_URL=http://localhost:4242
```

### Installation

```bash
# Backend
cd server && npm install

# Frontend
cd client && npm install
```

### Démarrage

```bash
# Backend (port 4242)
cd server && npm start

# Frontend (port 3000)
cd client && npm run dev
```

---

## Données de test

Un script de seed est disponible pour initialiser la base avec des données de test :

```bash
cd server && node scripts/seed.js
```

Comptes créés :

| Email | Mot de passe | Rôle |
|---|---|---|
| admin@corelab.dev | Admin1234! | Administrateur |
| bob@corelab.dev | Student1234! | Étudiant |
| clara@corelab.dev | Student1234! | Étudiant (première connexion) |

---

## Tests

```bash
cd server && npm test
```

---

## Structure du projet

```
corelab/
├── client/          # Application React
│   ├── src/
│   └── .env.example
├── server/          # API Express
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   ├── tests/
│   ├── scripts/
│   └── .env.example
├── docker-compose.yml
└── .env.example     # Variables pour Docker
```

---

## Équipe

- **Noémie** — Backend
- **Daloba** — Fullstack
- **Arnold** — Frontend