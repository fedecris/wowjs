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
      const manager = new SitesManager(req.body.title, req.body.year);
      const info = await manager.fetchInfo();

      let data = await fs.readFileSync(
        `${__dirname}/public/results.html`,
        "utf8"
      ); // Yes, I know I shouldn't
      data = data.replace("var_title", req.body.title);
      data = data.replace("var_year", req.body.year);
      data = data.replace("var_parser", "IMDb");
      data = data.replace("var_score", info.publicScore);
      data = data.replace("var_votes", info.publicCount);

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
