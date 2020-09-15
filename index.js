const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const IMDBParser = require("./parser/IMDBParser");
const WikiParser = require("./parser/WikiParser");
const RTParser = require("./parser/RTParser");
const SitesSearch = require("./SitesSearch");
const db = require("./db");
require("dotenv").config();
const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { info } = require("console");
const { filmSchema, validate } = require("./validator.js");
const passport = require("passport");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const app = express();

// Use flash
app.use(cookieParser("keyboard cat"));
app.use(expressSession({ cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 } }));
app.use(flash());

// Passport Middleware
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

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
app.get("/search", async (req, res) => {
  let title = req.query.title;
  let year = req.query.year;
  if (title == null || year == null) {
    // Default movie
    title = encodeURIComponent("The Matrix");
    year = 1999;
    res.redirect(`/search?title=${title}&year=${year}`);
    return;
  }
  // Embbed menu
  response = await pageLayout(
    "/public/search.html",
    "/public/layout/menu.html",
    "<MENU_HERE>",
    req.user
  );
  res.send(response);
});

// Incorpora menuFile en bodyFile reemplazando el tagName
async function pageLayout(bodyFile, menuFile, tagName, user) {
  let body = fs.readFileSync(`${__dirname}${bodyFile}`, "utf-8");
  let menu = fs.readFileSync(`${__dirname}${menuFile}`, "utf-8");
  if (user) {
    menu = menu.replace("Login", `${user[0].name} (Logout)`);
    menu = menu.replace("/login", "/logout");
  }
  return body.replace(tagName, menu);
}

// Films buscados desde iniciado el server
let data = [];
// Numero de request
let searchID = 0;
// === Busqueda utilizando todos los parsers ===
app.get("/search/all", validate(filmSchema), async (req, res) => {
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
  await db.insertRequest(title, year);

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
  parsers.names.forEach(async (parserName) => {
    // Determinar enlace
    const parser = getParserFromName(parserName);
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
    if (data[thisID].length == parsers.names.length) {
      db.insertFilm(title, year, data[thisID]);
    }
  });
  // Notificar inicio de busqueda mediante un request ID
  res.json({ id: thisID });
});

// Consultar por estdo de search
app.get("/search/status/:id", urlencodedParser, async (req, res) => {
  if (!req.params.id) {
    return res.json({ error: "RequestID required" });
  }
  const id = req.params.id;
  res.json(data[id]);
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
  // Embbed menu
  response = await pageLayout(
    "/public/history.html",
    "/public/layout/menu.html",
    "<MENU_HERE>",
    req.user
  );
  res.send(response);
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
  const argFields = { _id: 0, film: 1, year: 1, created: 1 };
  res.json(await db.retrieveRequests(count, argFields));
});

// Pagina de films
app.get("/films", async (req, res) => {
  // Embbed menu
  response = await pageLayout(
    "/public/films.html",
    "/public/layout/menu.html",
    "<MENU_HERE>",
    req.user
  );
  res.send(response);
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

// Pagina de login
app.get("/login", async (req, res) => {
  // Embbed menu
  response = await pageLayout(
    "/public/login.html",
    "/public/layout/menu.html",
    "<MENU_HERE>",
    req.user
  );
  res.send(response);
});

// Accesso
app.post("/auth", urlencodedParser, function (req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login?err=1",
    failureFlash: false,
  })(req, res, next);
});

// Cierre
app.get("/logout", async (req, res) => {
  req.logout();
  res.redirect("/");
});

// // Pruebas
// const snooze = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// app.get("/test/", async (req, res) => {
//   res.json(tickets);
//   for (let i = 0; i < 1000; i++) {
//     tickets.current++;
//     await snooze(1000);
//   }
// });
// app.get("/teststat", async (req, res) => {
//   res.json(tickets);
// });

// Ejemplo json === POST /api/users gets JSON bodies ===
// app.post('/api/users', jsonParser, function (req, res) {
//     // create user in req.body
//   })

// ============ Pruebas invocacion desde terminal =========
// const url = process.argv[2];
// console.log(`Crawling ${url}...`);
// fetchSites(url);
