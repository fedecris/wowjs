const express = require("express");
const db = require("../db");
const { getRenderArguments } = require("../common");
const router = express.Router();
const { processTSV } = require("../tsvManager");

// Pagina de historial de consultas
router.get("/", async (req, res, next) => {
  if (!req.user) {
    res.render("login", getRenderArguments(req.user));
  } else {
    res.render("admin", getRenderArguments(req.user));
  }
});

// Gestionar el maestro de films (FilmBasic)
router.get("/importFilms", async (req, res) => {
  processTSV();
});

module.exports = router;
