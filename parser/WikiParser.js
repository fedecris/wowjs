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
      this.budget = 30;
      this.boxOffice = 100;
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = WikiParser;
