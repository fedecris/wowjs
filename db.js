const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
require("dotenv").config();

// Connection URL
const url = `mongodb://${process.env.DB_SERVER}:${process.env.DB_PORT}`;

// Database Name
const dbName = "wow";

// DB Connection
let err = null;
let client = null;
let db = null;

// Use connect method to connect to the server
async function connect() {
  if (db && db.serverConfig.isConnected()) return;
  console.log("Connecting...");
  err,
    (client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }));

  assert.equal(null, err);
  console.log("Connected!");
  db = client.db(dbName);
}

async function insertRequest(film, year) {
  await connect();
  // Get the requests collection
  const requests = db.collection("requests");
  err,
    (result = await requests.insertOne({
      film: film,
      year: year,
      created: Date(),
    }));
  assert.equal(err, null);
  assert.equal(1, result.result.n);
  assert.equal(1, result.ops.length);
}

async function retrieveRequests(count, fields) {
  await connect();
  // Get the requests collection
  const requests = db.collection("requests");
  err,
    (result = await requests
      .find({}, { projection: fields })
      .sort({ _id: -1 })
      .limit(count));
  if (err) throw err;
  err, (resp = await result.toArray());
  if (err) throw err;
  return resp;
}

async function insertFilm(title, year, data) {
  await connect();
  const films = db.collection("films");
  err,
    (result = await films.insertOne({
      title: title,
      year: year,
      fetched: Date(),
      data: data,
    }));
}

async function retrieveFilm(title, year) {
  await connect();
  const films = db.collection("films");
  err,
    (result = await films
      .find(
        { title: title, year: year },
        { projection: { data: 1, fetched: 1 } }
      )
      .limit(1));
  if (err) throw err;
  if (result) {
    resp = await result.toArray();
    if (err) throw err;
    return resp;
  }
}

async function retrieveAllFilms() {
  await connect();
  const films = db.collection("films");
  err,
    (result = await films
      .find({}, { projection: { _id: 0, title: 1, year: 1, fetched: 1 } })
      .sort({ title: 1 }));
  if (err) throw err;
  if (result) {
    resp = await result.toArray();
    if (err) throw err;
    return resp;
  }
}

async function deleteFilm(title, year) {
  await connect();
  const target = { title: title, year: year };
  const films = db.collection("films");
  err, (result = await films.deleteOne(target));
  if (err) throw err;
}

function closeConnection() {
  console.log("Closing connection...");
  client.close();
  console.log("Closed!");
}

module.exports = {
  insertRequest,
  retrieveRequests,
  insertFilm,
  retrieveFilm,
  retrieveAllFilms,
  deleteFilm,
};
