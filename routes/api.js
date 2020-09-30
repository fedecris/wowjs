const express = require("express");
const { getParsersList } = require("../common");
const router = express.Router();

// Retorna los parser names disponibles
router.get("/parsers", (req, res) => {
  res.json(getParsersList());
});

// Realiza una busqueda en particular, ejemplo: localhost:3000/api/IMDb/cars/2006
router.get("/:parser/:movie/:year", (req, res) => {
  // ejemplo de redireccion: localhost:3000/search/IMDb?title=cars&year=2006
  res.redirect(
    `/search/${req.params.parser}?title=${req.params.movie}&year=${req.params.year}`
  );
});

module.exports = router;
