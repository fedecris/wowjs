const fetch = require("node-fetch");
const jsdom = require("jsdom");

class WikiParser {
  static name = "Wikipedia";
  static site = "en.wikipedia.org";
  static match = "en.wikipedia.org/wiki/";

  constructor() {
    this.budget = -1;
    this.boxOffice = -1;
  }

  getName() {
    return WikiParser.name;
  }

  getSite() {
    return WikiParser.site;
  }

  getMatch() {
    return WikiParser.match;
  }

  async parse(url) {
    try {
      const result = await fetch(url);
      const text = await result.text();
      const dom = new jsdom.JSDOM(text);

      const elements = dom.window.document.querySelectorAll("th");
      for (let i = 0; i < elements.length; i++) {
        let e = elements[i];
        if (e.textContent.trim().toLowerCase() == "budget") {
          this.budget = e.nextSibling.textContent;
        }
        if (e.textContent.trim().toLowerCase() == "box office") {
          this.boxOffice = e.nextSibling.textContent;
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = WikiParser;
