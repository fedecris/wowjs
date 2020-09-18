const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const db = require("./db");
require("dotenv").config();
const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { info } = require("console");
const passport = require("passport");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const app = express();
const ejs = require("ejs");
const path = require("path");
const { getRenderArguments, getParsersList } = require("./common");

// Use flash
app.use(cookieParser("keyboard cat"));
app.use(
  expressSession({
    cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 },
    secret: "my secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// set the view engine to ejs
// Require static assets from public folder
app.use(express.static(path.join(__dirname, "public")));

// Set 'views' directory for any views being rendered res.render()
app.set("views", path.join(__dirname, "views"));

// Set view engine as EJS
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");

// Passport Middleware
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

// create application/json parser
const jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// Escuchar
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));

// Users route
const users = require("./routes/users");
const search = require("./routes/search");
app.use("/users", users);
app.use("/search", search);

// Retorna los parsers disponibles
app.get("/parsers", (req, res) => {
  res.json(getParsersList());
});

// Redireccionar por defecto a busquedas
app.get("/", async (req, res) => {
  res.redirect("/search");
});

// Pagina de historial de consultas
app.get("/history", async (req, res) => {
  res.render("history", getRenderArguments(req.user));
});

// Almacenar un pedido de consulta
app.get("/log", async (req, res) => {
  // Registrar request
  if (req.query.title && req.query.year) {
    await db.insertRequest(req.query.title, req.query.year);
    res.json({ status: "ok" });
  } else {
    res.json({ status: "title & year required" });
  }
});

// Informacion de consultas
app.get("/logged", async (req, res) => {
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

// Pagina de films
app.get("/films", async (req, res) => {
  res.render("films", getRenderArguments(req.user));
});

// Retorna el listado peliculas recuperadas
app.get("/fetched", async (req, res) => {
  res.json(await db.retrieveAllFilms());
});

// Retorna el listado peliculas recuperadas
app.get("/filmBasic", async (req, res) => {
  if (req.query.criteria) {
    res.json(await db.findFilmBasic(req.query.criteria));
  } else {
    res.json({});
  }
});
