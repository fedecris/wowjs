const express = require("express");
require("dotenv").config();
const passport = require("passport");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const app = express();
const path = require("path");
const { getParsersList } = require("./common");
const ssocket = require("./ssocket");

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

// Escuchar
const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Listening on ${port}`));
ssocket.createServerSocket(server);

// No permitir actividad sin un login
// app.get("*", (req, res, next) => {
//   if (!req.user) {
//     res.render("login", getRenderArguments(req.user));
//   } else {
//     next();
//   }
// });

// Routes
const users = require("./routes/users");
const search = require("./routes/search");
const films = require("./routes/films");
const admin = require("./routes/admin");
app.use("/users", users);
app.use("/search", search);
app.use("/films", films);
app.use("/admin", admin);

// Retorna los parsers disponibles
app.get("/parsers", (req, res) => {
  res.json(getParsersList());
});

// Redireccionar por defecto a busquedas
app.get("/", async (req, res) => {
  res.redirect("/search");
});
