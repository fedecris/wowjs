const fetch = require("node-fetch");
const jsdom = require("jsdom");

class IMDBParser {
  static name = "IMDb";
  static site = "imdb.com";
  static match = "imdb.com/title/";

  constructor() {
    this.publicScore = -1;
    this.publicCount = -1;
  }

  getName() {
    return IMDBParser.name;
  }

  getSite() {
    return IMDBParser.site;
  }

  getMatch() {
    return IMDBParser.match;
  }

  async parse(url) {
    try {
      const result = await fetch(url);
      const text = await result.text();
      const dom = new jsdom.JSDOM(text);

      // Puntaje
      let element = dom.window.document.querySelector(
        "[itemprop='ratingValue']"
      );
      this.publicScore = element.textContent;

      // Votos
      element = dom.window.document.querySelector("[itemprop='ratingCount']");
      this.publicCount = element.textContent;
    } catch (err) {
      this.error = "Parsing error";
      console.error(err);
    }
  }
}

module.exports = IMDBParser;
