const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

// Connection URL
const url = "mongodb://172.17.0.2:27017";

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
  // Get the documents collection
  const requests = db.collection("requests");
  // Insert some documents
  err,
    (result = await requests.insertOne({
      film: film,
      year: year,
      created: Date(),
    }));
  assert.equal(err, null);
  assert.equal(1, result.result.n);
  assert.equal(1, result.ops.length);
  console.log("Insert OK!");
}

async function retrieveRequests(count, fields) {
  await connect();
  // Get the documents collection
  const requests = db.collection("requests");
  // Insert some documents

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

function closeConnection() {
  console.log("Closing connection...");
  client.close();
  console.log("Closed!");
}

//insertRequest("dracula", 1993);

module.exports = { insertRequest, retrieveRequests };
