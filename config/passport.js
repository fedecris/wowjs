const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const db = require("../db");
const passport = require("passport");

module.exports = function (passport) {
  // LocalStrategy
  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "pass" },
      async function (email, pass, done) {
        // Buscar usuario
        let user = await db.retrieveUser(email);
        if (!user || user.length == 0) {
          return done(null, false, { message: "No user found" });
        }
        // Verificar pass
        let err,
          isMatch = await bcrypt.compare(pass, user[0].pass);
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Wrong password" });
        }
      }
    )
  );
};

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
