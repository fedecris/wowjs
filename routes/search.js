const express = require("express");
const { filmSchema, validate } = require("../validator.js");
const {
  getRenderArguments,
  getParserFromName,
  getParsersList,
  getSitesSearch,
} = require("../common");
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const db = require("../db");

const router = express.Router();

// Display pagina de inicio
router.get("/", async (req, res) => {
  let title = req.query.title;
  let year = req.query.year;
  if (title == null || year == null) {
    // Default movie
    title = encodeURIComponent("The Matrix");
    year = 1999;
    res.redirect(`/search?title=${title}&year=${year}`);
    return;
  }
  res.render("search", getRenderArguments(req.user));
});

// Films buscados desde iniciado el server
let data = [];
// Numero de request
let searchID = 0;
// === Busqueda utilizando todos los parsers ===
router.get("/all", validate(filmSchema), async (req, res) => {
  const title = req.query.title;
  const year = req.query.year;
  const force = req.query.force;
  // Info cargada?
  if (!title || !year) {
    res.json({ error: "Title and year required" });
    return;
  }
  // Nueba busqueda
  const thisID = searchID++;
  await db.insertRequest(title, year, req.user ? req.user[0].name : null);

  // Si es force, eliminar de la cache la posible busqueda existente
  if (force && force == 1) {
    db.deleteFilm(title, year);
  }

  // Verificar en la cache
  const film = await db.retrieveFilm(title, year);
  if (film && film.length > 0) {
    data[thisID] = film[0].data;
    // Notificar request ID
    res.json({ id: thisID, cached: film[0].fetched });
    return;
  }

  // Iterar por cada parser
  let parsedData = [];
  getParsersList().names.forEach(async (parserName) => {
    // Determinar enlace
    const parser = getParserFromName(parserName);
    const url = await getSitesSearch().resolveFor(title, year, parser);
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
    let aData = {
      parser: parser.getName(),
      url: url,
      publicScore: parser.publicScore,
      publicCount: parser.publicCount,
      criticsScore: parser.criticsScore,
      criticsCount: parser.criticsCount,
      budget: parser.budget,
      boxOffice: parser.boxOffice,
    };
    parsedData.push(aData);
    data[thisID] = parsedData;
    // Si se completó la busqueda de información, cachear para próximas consultas
    if (data[thisID].length == getParsersList().names.length) {
      db.insertFilm(title, year, data[thisID]);
    }
  });
  // Notificar inicio de busqueda mediante un request ID
  res.json({ id: thisID });
});

// Consultar por estdo de search
router.get("/status/:id", urlencodedParser, async (req, res) => {
  if (!req.params.id) {
    return res.json({ error: "RequestID required" });
  }
  const id = req.params.id;
  res.json(data[id]);
});

// Resultado de un parser en particular
router.get("/:name", urlencodedParser, async (req, res) => {
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

module.exports = router;
