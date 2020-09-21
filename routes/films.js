const express = require("express");
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const passport = require("passport");
const { getRenderArguments } = require("../common");
const db = require("../db");
const router = express.Router();

// Pagina de historial de consultas
router.get("/history", async (req, res) => {
  res.render("history", getRenderArguments(req.user));
});

// Informacion de consultas realizadas
router.get("/logged", async (req, res) => {
  // Cantidad a devolver
  let count = 100;
  if (req.query.count) {
    count = parseInt(req.query.count);
    if (count > 100) count = 100;
  }
  // Campos a mostrar
  const argFields = { _id: 0, film: 1, year: 1, created: 1, user: 1 };
  res.json(await db.retrieveRequests(count, argFields));
});

// Pagina de films consultados
router.get("/", async (req, res) => {
  res.render("films", getRenderArguments(req.user));
});

// Retorna el listado peliculas recuperadas
router.get("/fetched", async (req, res) => {
  res.json(await db.retrieveAllFilms());
});

// Retorna el maestro de peliculas
router.get("/filmBasic", async (req, res) => {
  if (req.query.criteria) {
    res.json(await db.findFilmBasic(req.query.criteria));
  } else {
    res.json({});
  }
});

module.exports = router;
