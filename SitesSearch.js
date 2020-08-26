const fetch = require("node-fetch");
const jsdom = require("jsdom");
const IMDBParser = require("./parser/IMDBParser");
const WikiParser = require("./parser/WikiParser");

class SitesSearch {
  // URL Base de busqueda
  static baseURL = "http://www.google.com/search?q=";

  async resolveFor(title, year, parser) {
    try {
      this.error = null;
      // Armar el enlace de busqueda en Google
      const url =
        SitesSearch.baseURL +
        encodeURIComponent(`${title} ${year} site:${parser.getSite()}`);
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
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}

module.exports = SitesSearch;
