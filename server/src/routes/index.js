const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// routes à venir : /health, /api/auth, /api/admin, /api/notifications, /api

// error handler à venir

// MongoDB + listen à venir

module.exports = app;