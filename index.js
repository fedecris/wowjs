const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
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

      let data = await fs.readFile(`${__dirname}/public/results.html`, "utf8"); // Yes, I know I shouldn't
      console.log(data);
      data = data.replace("var_title", req.body.title);
      data = data.replace("var_year", req.body.year);
      data = data.replace("var_parser", IMDBParser.name);
      data = data.replace("var_score", imdb.publicScore);

      // res.send(`${req.body.title} (${req.body.year}): ${imdb.publicScore}`);
      res.send(data);
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
