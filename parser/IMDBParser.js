const fetch = require("node-fetch");
const jsdom = require("jsdom");
const WebParser = require("./WebParser");

class IMDBParser extends WebParser {
  constructor(url) {
    super();
    this.url = url;
  }

  async load() {
    try {
      const result = await fetch(this.url);
      const text = await result.text();
      const dom = new jsdom.JSDOM(text);

      // Puntaje
      const element = dom.window.document.querySelector(
        "[itemprop='ratingValue']"
      );
      this.publicScore = element.textContent;
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = IMDBParser;
