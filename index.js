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
const parsers = {
  score: [imdbParser.getName()],
  money: [wikiParser.getName()],
};

// ============ Pruebas invocacion desde terminal =========
// const url = process.argv[2];
// console.log(`Crawling ${url}...`);
// fetchSites(url);

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
  if (req.params.name == "IMDb") {
    const title = req.query.title;
    const year = req.query.year;
    const ss = new SitesSearch(title, year);
    const imdbURL = await ss.resolveFor(imdbParser);
    await imdbParser.parse(imdbURL);
    res.json({
      parser: "IMDb",
      publicScore: imdbParser.publicScore,
      publicCount: imdbParser.publicCount,
    });
  } else if (req.params.name == "Wikipedia") {
    const title = req.query.title;
    const year = req.query.year;
    const ss = new SitesSearch(title, year);
    const wikiURL = await ss.resolveFor(wikiParser);
    await wikiParser.parse(wikiURL);
    res.json({
      parser: "Wikipedia",
      budget: wikiParser.budget,
      boxOffice: wikiParser.boxOffice,
    });
  }
});

// Resultados generales
app.post("/search", urlencodedParser, (req, res) => {
  async function doIt() {
    try {
      const ss = new SitesSearch(req.body.title, req.body.year);
      const info = await ss.fetchInfo();

      let data = await fs.readFileSync(
        `${__dirname}/public/results.html`,
        "utf8"
      ); // Yes, I know I shouldn't
      data = data.replace("var_title", req.body.title);
      data = data.replace("var_year", req.body.year);
      data = data.replace("var_parser", "IMDb");
      data = data.replace("var_publicScore", info.publicScore);
      data = data.replace("var_publicCount", info.publicCount);
      data = data.replace("var_budget", info.budget);
      data = data.replace("var_boxOffice", info.boxOffice);
      res.send(data);
    } catch (err) {
      console.error(err);
    }
  }
  doIt();
});

// TODO: Mover
async function fetchInfo() {
  // IMDb info
  const imdbURL = await this.resolveFor(this.imdb);
  await imdb.parse(imdbURL);

  // Wikipedia info
  const wikiURL = await this.resolveFor(this.wiki);
  await wiki.parse(wikiURL);

  return {
    publicScore: imdb.publicScore,
    publicCount: imdb.publicCount,
    budget: wiki.budget,
    boxOffice: wiki.boxOffice,
  };
}

// Ejemplo json === POST /api/users gets JSON bodies ===
// app.post('/api/users', jsonParser, function (req, res) {
//     // create user in req.body
//   })
