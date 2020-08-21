const fetch = require("node-fetch");
const jsdom = require("jsdom");
const IMDBParser = require("./parser/IMDBParser");

class SitesManager {
  static baseURL = "http://www.google.com/search?q=";
  constructor(title, year) {
    this.title = title;
    this.year = year;
  }

  async resolve(site) {
    // Armar el enlace de busqueda en Google
    const url =
      SitesManager.baseURL +
      encodeURIComponent(`${this.title} ${this.year} site:${site}`);
    console.log(url);
    const result = await fetch(url);
    const text = await result.text();
    const dom = new jsdom.JSDOM(text);
    const element = dom.window.document.querySelector(
      "a[href*='imdb.com/title/']"
    );
    let resval = element.href.replace("/url?q=", "");
    resval = resval.substring(0, resval.indexOf("&"));
    return resval;
  }
}

module.exports = SitesManager;
