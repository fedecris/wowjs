const fetch = require("node-fetch");
const jsdom = require("jsdom");
const IMDBParser = require("./parser/IMDBParser");

class SitesManager {
  // URL Base de busqueda
  static baseURL = "http://www.google.com/search?q=";

  constructor(title, year) {
    this.title = title;
    this.year = year;
  }

  async resolveFor(parser) {
    // Armar el enlace de busqueda en Google
    const url =
      SitesManager.baseURL +
      encodeURIComponent(`${this.title} ${this.year} site:${parser.getSite()}`);
    console.log(url);
    // Intentando resolver enlaces
    const result = await fetch(url);
    const text = await result.text();
    const dom = new jsdom.JSDOM(text);
    const element = dom.window.document.querySelector(
      `a[href*='${parser.getMatch()}']`
    );
    // Los enlaces inician con /url?q=
    let resval = element.href.replace("/url?q=", "");
    // Y finalizan con &
    resval = resval.substring(0, resval.indexOf("&"));
    console.log(`  Link for ${parser.getName()}: ${resval} `);
    return resval;
  }

  async fetchInfo() {
    const imdb = new IMDBParser();
    const imdbURL = await this.resolveFor(imdb);
    const imdbInfo = await imdb.load(imdbURL);
    return { publicScore: imdb.publicScore, publicCount: imdb.publicCount };
  }
}

module.exports = SitesManager;
