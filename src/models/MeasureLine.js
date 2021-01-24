export default class MeasureLine {
    #sketcher

    constructor(sketcher, width, location) {
      this.#sketcher = sketcher;
      this.width = width;
      this.location = location;
    }

    show() {
      this.#sketcher.stroke(255);
      this.#sketcher.line(0, -this.location, this.width, -this.location);
      this.#sketcher.noStroke();
    }
}
