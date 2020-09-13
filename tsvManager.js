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
    let year = Number.parseInt(parts[5]);
    let duration = Number.parseInt(parts[7]);
    // == Algunos criterios para reducir el movieSet ==
    // solo peliculas...
    if (type != "movie") return;
    // ...que tengan definido el año...
    if (!Number.isInteger(year)) return;
    // ...y que tengan al menos una hora de duracion...
    if (!Number.isInteger(duration) || duration < 60) return;
    filmCount++;

    // log para ver evolucion
    if (filmCount % 1000 == 0)
      console.log(`${filmCount}: ${title} (${year}) ${duration} min`);
    // procesar
    db.insertFilmBasic(title, year);
  });
}

// Ejecutar proceso
doIt();
