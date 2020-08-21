const express = require("express");
const bodyParser = require("body-parser");
const IMDBParser = require("./parser/IMDBParser");
const SitesManager = require("./SitesManager");

const app = express();

// create application/json parser
const jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// ============ Pruebas invocacion desde terminal =========
// const url = process.argv[2];
// console.log(`Crawling ${url}...`);
// fetchSites(url);

// Escuchar
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));

// Inicio
app.get("/search", (req, res) => {
  res.sendFile(`${__dirname}/public/search.html`);
});

// Resultados
app.post("/search", urlencodedParser, (req, res) => {
  async function doIt() {
    try {
      const resolver = new SitesManager(req.body.title, req.body.year);
      const targetURL = await resolver.resolve(IMDBParser.site);
      const imdb = new IMDBParser(targetURL);
      await imdb.load();
      res.send(`${req.body.title} (${req.body.year}): ${imdb.publicScore}`);
    } catch (err) {
      console.error(err);
    }
  }
  doIt();
});

// Ejemplo json === POST /api/users gets JSON bodies ===
// app.post('/api/users', jsonParser, function (req, res) {
//     // create user in req.body
//   })
