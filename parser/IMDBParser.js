const fetch = require("node-fetch");
const jsdom = require("jsdom");

class IMDBParser {
  static name = "IMDb";
  static site = "imdb.com";
  static match = "imdb.com/title/";

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
      this.publicScore = -1;
      this.publicCount = -1;
      this.error = null;
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
