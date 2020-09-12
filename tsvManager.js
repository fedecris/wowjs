const lineReader = require("line-reader");
const db = require("./db");

async function doIt() {
  // Vaciar coleccion
  await db.emptyFilmBasic();

  let lineCount = 0;
  let filmCount = 0;
  lineReader.eachLine(process.argv[2], function (line) {
    // skip header
    if (lineCount++ == 0) return;

    // separar en partes
    let parts = line.split("\t");
    let type = parts[1];
    let title = parts[2];
    let year = parts[5];

    // solo peliculas
    if (type != "movie") return;
    filmCount++;

    // procesar
    console.log(`${filmCount}: ${title} (${year})`);
    db.insertFilmBasic(title, year);
  });
}

// Ejecutar proceso
doIt();
