const express = require("express");
const bodyParser = require("body-parser");
const IMDBParser = require("./parser/IMDBParser");
const app = express();

// create application/json parser
const jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

async function fetchSites(url) {
  let imdb = new IMDBParser(url);
  await imdb.load();
  console.log(imdb.publicScore);
}

// ============ Pruebas invocacion desde terminal =========
// const url = process.argv[2];
// console.log(`Crawling ${url}...`);
// fetchSites(url);

// Escuchar
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));

// Inicio
app.get("/search", (req, res) => {
  res.sendFile(`${__dirname}/site/search.html`);
});

// Resultados
app.post("/search", urlencodedParser, (req, res) => {
  res.send(`${req.body.title} (${req.body.year})`);
});

// Ejemplo json === POST /api/users gets JSON bodies ===
// app.post('/api/users', jsonParser, function (req, res) {
//     // create user in req.body
//   })
