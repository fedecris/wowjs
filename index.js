const express = require("express");
const IMDBParser = require("./parser/IMDBParser");
const app = express();

async function fetchSites(url) {
  let imdb = new IMDBParser(url);
  await imdb.load();
  console.log(imdb.publicScore);
}

const url = process.argv[2];
console.log(`Crawling ${url}...`);
fetchSites(url);

// Escuchar
// const port = process.env.PORT || 3000;
//app.listen(port, () => console.log(`Listening on ${port}`));
