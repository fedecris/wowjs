const lineReader = require("line-reader");
const db = require("./db");
const zlib = require("zlib");
const https = require("https");
const fs = require("fs");
const gunzip = require("gunzip-file");
const { getIO } = require("./index");
const ssocket = require("./ssocket");
const { resolve } = require("path");

// Queue Name
const QUEUE_IMPORT = "importTSV";

// URL destino
const TARGET_URL = "https://datasets.imdbws.com/title.basics.tsv.gz";
// Archivo temporal (gz)
const TEMP_FILE = "/tmp/basics.tsv.gz";
// Archivo temporal (tsv)
const TEMP_FILE_TSV = "/tmp/basics.tsv";

async function processTSV() {
  logActivity("importTSV", "Iniciandoooou");
  // === Descargar el archivo ===

  logActivity(`Downloading ${TARGET_URL}`);
  const file = fs.createWriteStream(TEMP_FILE);
  const request = https.get(TARGET_URL, function (response) {
    // Escribir response al file system
    logActivity(`Writing ${TEMP_FILE}`);
    response.pipe(file);
  });

  // === Descomprimir  el archivo ===
  logActivity(`Decompressing ${TEMP_FILE} into ${TEMP_FILE_TSV}`);
  gunzip(TEMP_FILE, TEMP_FILE_TSV, async () => {
    // Importing
    await importTSV(TEMP_FILE_TSV);
  });
}

async function importTSV(fileName) {
  logActivity(`Emptying collection...`);
  // Vaciar coleccion
  await db.emptyFilmBasic();
  logActivity(`Importing ${fileName}...`);
  let lineCount = 0;
  let filmCount = 0;
  lineReader.eachLine(fileName, function (line, last) {
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
    if (filmCount % 1000 == 0) {
      let content = `${filmCount}: ${title} (${year}) ${duration} min`;
      logActivity(content);
    }
    // procesar
    db.insertFilmBasic(title, year);

    // Ultima linea?
    if (last) {
      logActivity("Ready");
    }
  });
}

// Registrar actividad en log y via socket
function logActivity(content) {
  console.log(content);
  ssocket.sendStatus(QUEUE_IMPORT, content);
}

module.exports = { processTSV };
