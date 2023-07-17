export default class UqmPlanetTable {

  constructor() {
    this.planetTable = require("./uqmPlanetData.json");
  }

  getAllTypeNames() {
    return this.planetTable.map(item => item.type);
  }

  getRandomPlanetType() {
    return this.planetTable[Math.floor(Math.random() * this.planetTable.length)];
  }

  findPlanetTypeByName(typeName) {
    return this.planetTable.find(m => m.type == typeName);
  }
}
