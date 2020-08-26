const fetch = require("node-fetch");
const jsdom = require("jsdom");

class RTParser {
  static name = "RT";
  static site = "rottentomatoes.com";
  static match = "rottentomatoes.com/m/";

  getName() {
    return RTParser.name;
  }

  getSite() {
    return RTParser.site;
  }

  getMatch() {
    return RTParser.match;
  }

  async parse(url) {
    try {
      this.criticsScore = -1;
      this.criticsCount = -1;
      this.error = null;
      const result = await fetch(url);
      const text = await result.text();
      const dom = new jsdom.JSDOM(text);

      // Critics (reviews y cantidad)
      let elements = dom.window.document.getElementsByClassName(
        "mop-ratings-wrap__percentage"
      );
      this.criticsScore = elements[0].textContent.trim();
      elements = dom.window.document.getElementsByClassName(
        "mop-ratings-wrap__text--small"
      );
      this.criticsCount = elements[1].textContent.trim();
    } catch (err) {
      this.error = "Parsing error";
      console.error(err);
    }
  }
}

module.exports = RTParser;
