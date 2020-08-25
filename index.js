const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const IMDBParser = require("./parser/IMDBParser");
const WikiParser = require("./parser/WikiParser");
const SitesSearch = require("./SitesSearch");

const app = express();

// create application/json parser
const jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const imdbParser = new IMDBParser();
const wikiParser = new WikiParser();
const sitesSearch = new SitesSearch();
const parsers = {
  names: [imdbParser.getName(), wikiParser.getName()],
};

function getParserFromName(name) {
  if (name == imdbParser.getName()) return imdbParser;
  if (name == wikiParser.getName()) return wikiParser;
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
  const url = await sitesSearch.resolveFor(title, year, parser);
  await parser.parse(url);
  res.json({
    parser: parser.getName(),
    publicScore: parser.publicScore,
    publicCount: parser.publicCount,
    budget: parser.budget,
    boxOffice: parser.boxOffice,
  });
});

// Ejemplo json === POST /api/users gets JSON bodies ===
// app.post('/api/users', jsonParser, function (req, res) {
//     // create user in req.body
//   })

// ============ Pruebas invocacion desde terminal =========
// const url = process.argv[2];
// console.log(`Crawling ${url}...`);
// fetchSites(url);
