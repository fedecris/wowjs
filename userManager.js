const db = require("./db");
const bcrypt = require("bcryptjs");

/** Permite la registracion de un usuario desde terminal */
if (process.argv.length < 5) {
  console.error("Debe especificar 1) nombre, 2) email y 3) password");
  process.exit(1);
}

async function registerUser() {
  let err,
    salt = await bcrypt.genSalt(10);
  err, (hash = await bcrypt.hash(process.argv[4], salt));
  // nombre, email y pass
  db.insertUser(process.argv[2], process.argv[3], hash);
}

registerUser();
