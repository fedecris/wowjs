const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const db = require("./db");
require("dotenv").config();
const fetch = require("node-fetch");
const jsdom = require("jsdom");
const { info } = require("console");
const passport = require("passport");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const app = express();
const ejs = require("ejs");
const path = require("path");
const { getRenderArguments, getParsersList } = require("./common");

// Use flash
app.use(cookieParser("keyboard cat"));
app.use(
  expressSession({
    cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 },
    secret: "my secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// set the view engine to ejs
// Require static assets from public folder
app.use(express.static(path.join(__dirname, "public")));

// Set 'views' directory for any views being rendered res.render()
app.set("views", path.join(__dirname, "views"));

// Set view engine as EJS
app.engine("html", require("ejs").renderFile);
app.set("view engine", "ejs");

// Passport Middleware
require("./config/passport")(passport);
app.use(passport.initialize());
app.use(passport.session());

// create application/json parser
const jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// Escuchar
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));

// Users & search route
const users = require("./routes/users");
const search = require("./routes/search");
const films = require("./routes/films");
app.use("/users", users);
app.use("/search", search);
app.use("/films", films);

// Retorna los parsers disponibles
app.get("/parsers", (req, res) => {
  res.json(getParsersList());
});

// Redireccionar por defecto a busquedas
app.get("/", async (req, res) => {
  res.redirect("/search");
});
