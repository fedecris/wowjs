const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const IMDBParser = require("./parser/IMDBParser");
const WikiParser = require("./parser/WikiParser");
const RTParser = require("./parser/RTParser");
const SitesSearch = require("./SitesSearch");
const db = require("./db");

const app = express();

// create application/json parser
const jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const imdbParser = new IMDBParser();
const wikiParser = new WikiParser();
const rtParser = new RTParser();
const sitesSearch = new SitesSearch();
const parsers = {
  names: [imdbParser.getName(), rtParser.getName(), wikiParser.getName()],
};

function getParserFromName(name) {
  if (name == imdbParser.getName()) return imdbParser;
  if (name == wikiParser.getName()) return wikiParser;
  if (name == rtParser.getName()) return rtParser;
}

// Escuchar
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));

// Retorna los parsers disponibles
app.get("/parsers", (req, res) => {
  res.json(parsers);
});

// Display pagina de inicio
app.get("/search", (req, res) => {
  res.sendFile(`${__dirname}/public/search.html`);
});

// Resultado de un parser en particular
app.get("/search/:name", urlencodedParser, async (req, res) => {
  const title = req.query.title;
  const year = req.query.year;
  const parser = getParserFromName(req.params.name);
  // Determinar enlace
  const url = await sitesSearch.resolveFor(title, year, parser);
  if (url == null) {
    res.json({ parser: parser.getName(), error: "No matches" });
    return;
  }
  // Parse documento destino
  await parser.parse(url);
  if (parser.error) {
    res.json({ parser: parser.getName(), error: parser.error });
    return;
  }
  // Retornar info recuperada
  res.json({
    parser: parser.getName(),
    publicScore: parser.publicScore,
    publicCount: parser.publicCount,
    criticsScore: parser.criticsScore,
    criticsCount: parser.criticsCount,
    budget: parser.budget,
    boxOffice: parser.boxOffice,
  });
});

// Redireccionar por defecto a busquedas
app.get("/", async (req, res) => {
  res.redirect("/search");
});

// Pagina de historial de consultas
app.get("/history", async (req, res) => {
  res.sendFile(`${__dirname}/public/history.html`);
});

// Almacenar pedido de consulta
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
  const argFields = { _id: 0, film: 1, year: 1, created: 1 };
  res.json(await db.retrieveRequests(count, argFields));
});

// Ejemplo json === POST /api/users gets JSON bodies ===
// app.post('/api/users', jsonParser, function (req, res) {
//     // create user in req.body
//   })

// ============ Pruebas invocacion desde terminal =========
// const url = process.argv[2];
// console.log(`Crawling ${url}...`);
// fetchSites(url);
