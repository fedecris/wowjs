const IMDBParser = require("./parser/IMDBParser");
const WikiParser = require("./parser/WikiParser");
const RTParser = require("./parser/RTParser");
const SitesSearch = require("./SitesSearch");

const imdbParser = new IMDBParser();
const wikiParser = new WikiParser();
const rtParser = new RTParser();
const sitesSearch = new SitesSearch();
const parsers = {
  names: [imdbParser.getName(), rtParser.getName(), wikiParser.getName()],
};

function getParsersList() {
  return parsers;
}

function getSitesSearch() {
  return sitesSearch;
}

function getParserFromName(name) {
  if (name == imdbParser.getName()) return imdbParser;
  if (name == wikiParser.getName()) return wikiParser;
  if (name == rtParser.getName()) return rtParser;
}

function getRenderArguments(user) {
  let username = null;
  if (user) username = user[0].name;
  return {
    username: username,
  };
}

module.exports = {
  getRenderArguments,
  getParserFromName,
  getParsersList,
  getSitesSearch,
};
