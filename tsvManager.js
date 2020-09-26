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
  try {
    logActivity("importTSV", "Starting process...");
    // === Descargar el archivo ===

    logActivity(`Downloading from ${TARGET_URL}...`);
    const file = fs.createWriteStream(TEMP_FILE);
    https.get(TARGET_URL, function (response) {
      // Escribir response al file system
      response.pipe(file);
      response.on("end", () => {
        // === Descomprimir  el archivo ===
        logActivity(`Decompressing file...`);
        gunzip(TEMP_FILE, TEMP_FILE_TSV, async () => {
          // Importing
          await importTSV(TEMP_FILE_TSV);
        });
      });
    });
  } catch (err) {
    logActivity(`Error while processing: ${err}`);
  }
}

async function importTSV(fileName) {
  logActivity(`Emptying collection...`);
  // Vaciar coleccion
  await db.emptyFilmBasic();
  logActivity(`Importing tsv file...`);
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
    let isMovie = true;
    // solo peliculas...
    if (type != "movie") isMovie = false;
    // ...que tengan definido el año...
    if (!Number.isInteger(year)) isMovie = false;
    // ...y que tengan al menos una hora de duracion...
    if (!Number.isInteger(duration) || duration < 60) isMovie = false;

    // Si no es una pelicula, pero es la ultima, notificar fin de la actividad
    if (!isMovie) {
      if (last) {
        logActivity("Ready");
      }
      return;
    }
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
      return;
    }
  });
}

// Registrar actividad en log y via socket
function logActivity(content) {
  ssocket.sendStatus(QUEUE_IMPORT, content);
}

module.exports = { processTSV };
