const express = require("express");
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const passport = require("passport");
const { getRenderArguments } = require("../common");
const router = express.Router();

// Pagina de login
router.get("/login", async (req, res) => {
  res.render("login", getRenderArguments(req.user));
});

// Accesso
router.post("/auth", urlencodedParser, function (req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login?err=1",
    failureFlash: false,
  })(req, res, next);
});

// Cierre
router.get("/logout", async (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
