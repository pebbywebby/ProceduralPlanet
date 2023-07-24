import * as THREE from 'three'
import Biome from 'views/Biome'
import Atmosphere from 'views/Atmosphere.js'
import NoiseMap from 'views/NoiseMap.js'
import TextureMap from 'views/TextureMap.js'
import NormalMap from 'views/NormalMap.js'
import RoughnessMap from 'views/RoughnessMap.js'
import TemperatureMap from 'views/TemperatureMap.js'
import Clouds from 'views/Clouds.js'
import Stars from 'views/Stars.js'
import Nebula from 'views/Nebula.js'
import Sun from 'views/Sun.js'
import Glow from 'views/Glow.js'
import NebulaeGradient from 'views/NebulaeGradient.js'
import seedrandom from 'seedrandom'
import randomString from 'crypto-random-string'
import AtmosphereRing from 'views/AtmosphereRing.js'
import randomLorem from 'random-lorem'
import UqmPlanetTable from '../UqmPlanetTable.js'
import UqmGenerationTable from '../UqmGenerationTable.js'

//for sanity checking
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

class GeneratorSettings {
  constructor(seedString, genData) {
    this.seedString = seedString;
    this.rng = seedrandom(this.seedString);
    this.seed = this.randRange(0, 1) * 1000.0;

    this.waterLevel = this.randRange(genData.waterLevel.min, genData.waterLevel.max);

    //temperature map settings
    this.pole1Factor = this.randRange(genData.pole1Factor.min, genData.pole1Factor.max);
    this.pole2Factor = this.randRange(genData.pole2Factor.min, genData.pole2Factor.max);
    this.heightFactor = this.randRange(genData.heightFactor.min, genData.heightFactor.max);
    this.iciness = this.randRange(genData.iciness.min, genData.iciness.max);
    this.iceCutoff = this.randRange(genData.iceCutoff.min, genData.iceCutoff.max);

    //height map settings
    this.heightMap = {res1: this.randRange(genData.heightMap.resMin, genData.heightMap.resMax),
                      res2: this.randRange(genData.heightMap.resMin, genData.heightMap.resMax),
                      resMix: this.randRange(genData.heightMap.resMin, genData.heightMap.resMax),
                      mixScale: this.randRange(genData.heightMap.mixScaleMin, genData.heightMap.mixScaleMax),
                      doesRidged: Math.floor(this.randRange(genData.heightMap.doesRidgedMin, genData.heightMap.doesRidgedMax))}

    //moisture map settings
    this.moistureMap = {res1: this.randRange(genData.moistureMap.resMin, genData.moistureMap.resMax),
                        res2: this.randRange(genData.moistureMap.resMin, genData.moistureMap.resMax),
                        resMix: this.randRange(genData.moistureMap.resMin, genData.moistureMap.resMax),
                        mixScale: this.randRange(genData.moistureMap.mixScaleMin, genData.moistureMap.mixScaleMax),
                        doesRidge: Math.floor(this.randRange(genData.moistureMap.doesRidgedMin, genData.moistureMap.doesRidgedMax))}

    //biome map settings
    this.paletteNum = 0;
    this.colorPalette = genData.colorPalette;
    this.baseColor = this.randomColor();
    this.baseColor2 = this.randomColor();
    this.inlandColor = this.randomColor();
    this.beachColor = this.randomColor();

    this.waterColorH = this.randRange(genData.waterColor.hMin, genData.waterColor.hMax);
    this.waterColorS = this.randRange(genData.waterColor.sMin, genData.waterColor.sMax);
    this.waterColorL = this.randRange(genData.waterColor.lMin, genData.waterColor.lMax);
    this.waterColor = new THREE.Color().setHSL(this.waterColorH, this.waterColorS, this.waterColorL);

    let biomeWidth = 512, biomeHeight = 512;
    this.baseGradientArr = new Array();
    for(let i = 0; i < 5; i++) {
      this.baseGradientArr[i] = { x1: this.randRange(0, biomeWidth), y1: this.randRange(0, biomeHeight),
                                  x2: this.randRange(0, biomeWidth), y2: this.randRange(0, biomeHeight)}
    }

    this.circleSize = this.randRange(30, 250);
    this.circleNum = 100;
    this.circleArr = new Array();
    for(let i = 0; i < this.circleNum; i++) {
      this.circleArr[i] = {size: this.randRange(10, this.circleSize), color: this.randomColor(),
        x: this.randRange(0, biomeWidth), y: this.randRange(0, biomeHeight) - biomeHeight * this.waterLevel}
    }

    this.inlandSize = 100;
    this.landDetail = Math.round(this.randRange(0, 5));
    this.landDetailArr = new Array();
    for(let i = 0; i < this.landDetail; i++) {
      let x1 = this.randRange(0, biomeWidth);
      let y1 = this.randRange(0, biomeHeight);
      let x2 = this.randRange(0, biomeWidth);
      let y2 = this.randRange(0, biomeHeight);
      this.landDetailArr[i] = { x: x1, y: y1, width: x2-x1, height: y2-y1,
                                gradx1: this.randRange(0, biomeWidth), grady1: this.randRange(0, biomeHeight),
                                gradx2: this.randRange(0, biomeWidth), grady2: this.randRange(0, biomeHeight),
                                offset1: this.randRange(0, 0.5), offset2: this.randRange(0.5, 1.0),
                                color: this.randomColor()}
    }
    
  }

  randRange(low, high) {
    let range = high - low;
    let n = this.rng() * range;
    return clamp(low + n, low, high);
  }

  randomColor() {
    this.paletteNum += 1;
    let palette = this.colorPalette[this.paletteNum % this.colorPalette.length];

    let h = clamp(this.randRange(palette.hMin, palette.hMax), 0.0, 1.0);
    let s = clamp(this.randRange(palette.sMin, palette.sMax), 0.0, 1.0);
    let l = clamp(this.randRange(palette.lMin, palette.lMax), 0.0, 1.0);

    return new THREE.Color().setHSL(h, s, l);
  }

  addControls(planet)
  {
    this.gencon = window.gui.addFolder('Generation Controls');

    this.waterLevelControl = this.gencon.add(this, "waterLevel", 0.0, 1.0);
    this.waterLevelControl.onChange(value => { this.waterLevel = clamp(value, 0.0, 1.0);
      planet.renderNormalMap(this); planet.renderRoughnessMap(this);
      planet.renderBiomeTexture(this); planet.renderTextureMap(this); });

    this.waterColorHControl = this.gencon.add(this, "waterColorH", 0.0, 1.0);
    this.waterColorHControl.onChange(value => { this.waterColorH = clamp(value, 0.0, 1.0);
      this.waterColor = new THREE.Color().setHSL(this.waterColorH, this.waterColorS, this.waterColorL);
      planet.renderBiomeTexture(this); planet.renderTextureMap(this); });
    this.waterColorSControl = this.gencon.add(this, "waterColorS", 0.0, 1.0);
    this.waterColorSControl.onChange(value => { this.waterColorS = clamp(value, 0.0, 1.0);
      this.waterColor = new THREE.Color().setHSL(this.waterColorH, this.waterColorS, this.waterColorL);
      planet.renderBiomeTexture(this); planet.renderTextureMap(this); });
    this.waterColorLControl = this.gencon.add(this, "waterColorL", 0.0, 1.0);
    this.waterColorLControl.onChange(value => { this.waterColorL = clamp(value, 0.0, 1.0);
      this.waterColor = new THREE.Color().setHSL(this.waterColorH, this.waterColorS, this.waterColorL);
      planet.renderBiomeTexture(this); planet.renderTextureMap(this); });
  
    this.pole1FactorControl = this.gencon.add(this, "pole1Factor", 0.0, 5.0);
    this.pole1FactorControl.onChange(value => { planet.renderTemperatureMap(this); planet.renderTextureMap(this); });
  
    this.pole2FactorControl = this.gencon.add(this, "pole2Factor", 0.0, 5.0);
    this.pole2FactorControl.onChange(value => { planet.renderTemperatureMap(this); planet.renderTextureMap(this);});
  
    this.heightFactorControl = this.gencon.add(this, "heightFactor", 0.0, 10.0);
    this.heightFactorControl.onChange(value => { planet.renderTemperatureMap(this); planet.renderTextureMap(this);});
  
    this.icinessControl = this.gencon.add(this, "iciness", 0.0, 1.0);
    this.icinessControl.onChange(value => { planet.renderTemperatureMap(this); planet.renderTextureMap(this);});

    //this.iceCutoffControl = this.gencon.add(this, "iceCutoff", 0.05, 0.3);
    //this.iceCutoffControl.onChange(value => { planet.renderTextureMap(this);});
  }
}

class Planet {

  constructor() {

    this.NON_UQM_PLANET = "NONE";

    this.seedString = "Scarlett";

    this.view = new THREE.Object3D();

    this.materials = [];
    this.roughness = 0.8;
    this.metalness = 0.5;
    this.normalScale = 1.0;
    this.resolution = 1024;
    this.size = 1000;

    this.uqmPlanetTable = new UqmPlanetTable();
    this.uqmPlanetTypes = this.uqmPlanetTable.getAllTypeNames();
    let nonechoice = [ this.NON_UQM_PLANET ];
    let choicelist = nonechoice.concat(this.uqmPlanetTypes);
    this.uqmPlanetTypeChoices = choicelist;
    this.uqmPlanetType = this.NON_UQM_PLANET;
    this.uqmPlanetSeedChoices = [];
    this.uqmPlanetSeedChoice = "NONE";

    this.uqmGenerationTable = new UqmGenerationTable();
    this.uqmGenerationType = "unknown";
    this.uqmGenerationTypes = this.uqmGenerationTable.getAllTypeNames();

    //this.generatorSettings = new GeneratorSettings();

    this.heightMaps = [];
    this.moistureMaps = [];
    this.textureMaps = [];
    this.normalMaps = [];
    this.roughnessMaps = [];
    this.temperatureMaps = [];

    let matFolder = gui.addFolder('Material');

    this.roughnessControl = matFolder.add(this, "roughness", 0.0, 1.0);
    this.roughnessControl.onChange(value => { this.updateMaterial(); });

    this.metalnessControl = matFolder.add(this, "metalness", 0.0, 1.0);
    this.metalnessControl.onChange(value => { this.updateMaterial(); });

    this.normalScaleControl = matFolder.add(this, "normalScale", -3.0, 6.0).listen();
    this.normalScaleControl.onChange(value => { this.updateMaterial(); });

    // debug options
    this.displayMap = "textureMap";
    let debugFolder = gui.addFolder('Debug');
    this.displayMapControl = debugFolder.add(this, "displayMap", ["textureMap", "heightMap", "moistureMap", "normalMap", "roughnessMap", "temperatureMap"]);
    this.displayMapControl.onChange(value => { this.updateMaterial(); });

    this.showBiomeMap = false;
    this.showBiomeMapControl = debugFolder.add(this, "showBiomeMap");
    this.showBiomeMapControl.onChange(value => {
      if (this.biome) {
        this.biome.toggleCanvasDisplay(value);
      }
     });

     this.showNebulaMap = false;
     this.showNebulaMapControl = debugFolder.add(this, "showNebulaMap");
     this.showNebulaMapControl.onChange(value => {
       if (this.nebulaeGradient) {
         this.nebulaeGradient.toggleCanvasDisplay(value);
       }
      });




    this.biome = new Biome();
    this.nebulaeGradient = new NebulaeGradient();

    this.createScene();
    this.createStars();
    this.createNebula();
    this.createSun();
    // this.createClouds();
    // this.createGlow();

    // this.atmosphereRing = new AtmosphereRing();
    // this.view.add(this.atmosphereRing.view);

    this.createAtmosphere();
    this.loadSeedFromURL();


    ////////////////// environment gui
    let enviromentFolder = gui.addFolder('Environment');
    enviromentFolder.add(this.atmosphere, "atmosphere", 0.0, 1.0).step(0.01);
    enviromentFolder.add(this.nebula, "nebula", 0.0, 1.0).step(0.01).onChange(value => {
      this.nebula.updateMaterial();
    });


    this.rotate = true;
    this.autoGenerate = false;
    this.autoGenCountCurrent = 0;
    this.autoGenTime = 3*60;
    this.autoGenCountMax = this.autoGenTime * 60;

    window.gui.add(this, "rotate");

    this.resolutionControl = window.gui.add(this, "resolution", [256, 512, 1024, 2048, 4096]);
    this.resolutionControl.onChange(value => { this.regenerate(); });

    debugFolder.add(this, "autoGenerate");
    this.autoGenTimeControl = debugFolder.add(this, "autoGenTime", 30, 300).step(1);
    this.autoGenTimeControl.onChange(value => { this.autoGenCountMax = this.autoGenTime * 60 });

    this.seedStringControl = window.gui.add(this, "seedString").listen();
    this.seedStringControl.onFinishChange(value => { this.loadSeedFromTextfield(); });
    window.gui.add(this, "randomize");

    //this.uqmPlanetTypeControl = window.gui.add(this, "uqmPlanetType", this.uqmPlanetTypeChoices, );
    //this.uqmPlanetTypeControl.onFinishChange(value => { this.pickPlanetType(); });

    this.uqmGenerationTypeControl = window.gui.add(this, "uqmGenerationType", this.uqmGenerationTypes, );
    this.uqmGenerationTypeControl.onFinishChange(value => { this.regenerate(); });

    document.addEventListener('keydown', (event) => {
      if (event.target.nodeName != 'BODY') {
        return;
      }

      if (event.keyCode == 32) {
        this.randomize();
      }
    });

    window.onpopstate = (event) => {
      this.loadSeedFromURL();
    };

    this.renderUI();

  }

  update() {
    if (this.rotate) {
      this.ground.rotation.y += 0.0005;
      this.stars.view.rotation.y += 0.0003;
      this.nebula.view.rotation.y += 0.0003;
      // this.clouds.view.rotation.y += 0.0007;
    }

    this.atmosphere.update();



    // this.glow.update();

    if (this.autoGenerate) {
      this.autoGenCountCurrent++;
      if (this.autoGenCountCurrent > this.autoGenCountMax) {
        this.randomize();
      }
    }

    this.stars.view.position.copy(window.camera.position);
    this.nebula.view.position.copy(window.camera.position);

    // this.atmosphereRing.update();

  }

  renderUI(){
    let infoBoxHolder = document.createElement("div");
    infoBoxHolder.setAttribute("id", "infoBoxHolder");
    document.body.appendChild(infoBoxHolder);

    let infoBox = document.createElement("div");
    infoBox.setAttribute("id", "infoBox");
    infoBox.innerHTML = "Planet<br><div id='planetName'></div><br><div id='instructions'>H - Show/Hide UI<br>SPACEBAR - New Planet</div>";
    infoBoxHolder.appendChild(infoBox);

    let line = document.createElement("div");
    line.setAttribute("id", "line");
    infoBoxHolder.appendChild(line);
    infoBoxHolder.appendChild(window.gui.domElement);

    let creditsBox = document.createElement("div");
    creditsBox.setAttribute("id", "creditsBox");
    creditsBox.innerHTML = `
      Forked from <a href="https://github.com/colordodge/ProceduralPlanet">ProceduralPlanet</a> by <a href="https://github.com/colordodge">colordodge</a>.<br>
      Fonts from <a href="https://github.com/JHGuitarFreak/UQM-MegaMod">UQM MegaMod</a> by <a href="https://github.com/JHGuitarFreak">JHGuitarFreak</a>.
      `;
    document.body.appendChild(creditsBox);

    // mobile info box
    let mobileInfoBox = document.createElement("div");
    mobileInfoBox.setAttribute("id", "infoBoxHolderMobile");
    mobileInfoBox.innerHTML = "<div id='infoBoxMobile'>Planet<br><div id='planetNameMobile'></div></div>";
    document.body.appendChild(mobileInfoBox);

    this.updatePlanetName();

    // new planet button
    let newPlanetButtonHolder = document.createElement("div");
    newPlanetButtonHolder.setAttribute("id", "newPlanetButtonHolder");
    newPlanetButtonHolder.innerHTML = "<div id='newPlanetButton'>New Planet</div>";
    document.body.appendChild(newPlanetButtonHolder);

    let newPlanetButton = document.getElementById("newPlanetButton");
    newPlanetButton.addEventListener('click', (e) => {this.randomize()} );
  }

  updatePlanetName() {
    let planetName = document.getElementById("planetName");
    if (planetName != null) {
      planetName.innerHTML = this.seedString;
    }

    let planetNameMobile = document.getElementById("planetNameMobile");
    if (planetNameMobile != null) {
      planetNameMobile.innerHTML = this.seedString;
    }
  }

  initSeed() {
    window.rng = seedrandom(this.seedString);
  }

  loadSeedFromURL() {
    this.seedString = this.getParameterByName("seed");
    if (this.seedString) {
      console.log("seed string exists");
      this.regenerate();
    } else {
      console.log("no seed string");
      this.randomize(true);
    }

  }

  loadSeedFromTextfield() {
    let url = this.updateQueryString("seed", this.seedString);
    window.history.pushState({seed: this.seedString}, this.seedString, url);
    this.regenerate();
  }

  regenerate() {
    this.autoGenCountCurrent = 0;
    this.renderScene();
  }

  randomize(use_uqm_table = false) {
    // this.seedString = randomString(10);

    if (!use_uqm_table) {
      let n = Math.random();
      let wordCount = 0;
      if (n > 0.8) wordCount = 1;
      else if (n > 0.4) wordCount = 2;
      else wordCount = 3;
  
      this.seedString = "";
      for (let i=0; i<wordCount; i++) {
        this.seedString += this.capitalizeFirstLetter(randomLorem({ min: 2, max: 8 }));
        if (i < wordCount-1) this.seedString += " ";
      }

      this.clearPickPlanetSeedUI();
    } else {
      let type = this.uqmPlanetType == "NONE"
        ? this.uqmPlanetTable.getRandomPlanetType()
        : this.uqmPlanetTable.findPlanetTypeByName(this.uqmPlanetType);

      let seeds = type.seeds;
      this.seedString = seeds[Math.floor(Math.random() * seeds.length)];
    }

    // this.seedString = randomLorem({ min: 2, max: 8 });
    // this.seedString += " " + randomLorem({ min: 2, max: 8 });
    let url = this.updateQueryString("seed", this.seedString);
    window.history.pushState({seed: this.seedString}, this.seedString, url);
    this.autoGenCountCurrent = 0;
    this.renderScene();
  }

  randomizeUqm() {
    this.randomize(1);
    this.uqmPlanetSeedChoice = this.seedString;
    
    if (this.uqmPlanetSeedChoiceControl != null) {
      this.uqmPlanetSeedChoiceControl.updateDisplay();
    }
  }

  pickPlanetType() {
    let typeString = this.uqmPlanetType;
    let type = this.UQM_PLANETTABLE.find(m => m.type == this.uqmPlanetType);

    if (type != null) {
      this.uqmPlanetSeedChoices = type.seeds;
      this.uqmPlanetSeedChoice = type.seeds[0];
    } else {
      this.uqmPlanetSeedChoices = [];
      this.uqmPlanetSeedChoice = "NONE";
    }
//    console.log(this.uqmPlanetSeedChoices);
//    console.log(this.uqmPlanetSeedChoice);

    if (this.uqmPlanetSeedChoiceControl != null) {
      window.gui.remove(this.uqmPlanetSeedChoiceControl);
      this.uqmPlanetSeedChoiceControl = null;
    }
    if (this.randomizeUqmButton != null) {
      window.gui.remove(this.randomizeUqmButton);
      this.randomizeUqmButton = null;
    }
    
    if (typeString != this.NON_UQM_PLANET) {
      this.uqmPlanetSeedChoiceControl = window.gui.add(this, "uqmPlanetSeedChoice", this.uqmPlanetSeedChoices );
      this.uqmPlanetSeedChoiceControl.onFinishChange(value => { this.pickPlanetSeed(); });
      this.randomizeUqmButton = window.gui.add(this, "randomizeUqm");
    }

    if (this.uqmPlanetSeedChoice != "NONE") {
      this.pickPlanetSeed();
    } else {
      this.randomizeUqm();
    }
  }

  clearPickPlanetSeedUI() {
    this.uqmPlanetSeedChoices = [];
    this.uqmPlanetSeedChoice = "NONE";

    if (this.uqmPlanetSeedChoiceControl != null) {
      window.gui.remove(this.uqmPlanetSeedChoiceControl);
      this.uqmPlanetSeedChoiceControl = null;
   }
    if (this.randomizeUqmButton != null) {
      window.gui.remove(this.randomizeUqmButton);
      this.randomizeUqmButton = null;
    }

    if (this.uqmPlanetTypeControl != null) {
      this.uqmplanetType = this.NON_UQM_PLANET;
      this.uqmPlanetTypeControl.updateDisplay()
    }
  }

  pickPlanetSeed() {
    this.seedString = this.uqmPlanetSeedChoice;
    if (this.uqmPlanetSeedChoice = "") {
      this.randomizeUqm();
    } else {
      let url = this.updateQueryString("seed", this.seedString);
      window.history.pushState({seed: this.seedString}, this.seedString, url);
      this.autoGenCountCurrent = 0;
      this.renderScene();
    }
  }

  getUqmPlanetTypes() {
    let table = this.UQM_PLANETTABLE;
    let types = [];
    for (let i = 0; i < table.length; i++) {
      types.push(table[i].type);
    }
    return types;
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }


  createScene() {
    this.heightMap = new NoiseMap();
    this.heightMaps = this.heightMap.maps;

    this.moistureMap = new NoiseMap();
    this.moistureMaps = this.moistureMap.maps;

    this.temperatureMap = new TemperatureMap();
    this.temperatureMaps = this.temperatureMap.maps;

    this.textureMap = new TextureMap();
    this.textureMaps = this.textureMap.maps;

    this.normalMap = new NormalMap();
    this.normalMaps = this.normalMap.maps;

    this.roughnessMap = new RoughnessMap();
    this.roughnessMaps = this.roughnessMap.maps;

    for (let i=0; i<6; i++) {
      let material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xFFFFFF)
      });
      this.materials[i] = material;
    }

    let geo = new THREE.BoxGeometry(1, 1, 1, 64, 64, 64);
    let radius = this.size;
    for (var i in geo.vertices) {
  		var vertex = geo.vertices[i];
  		vertex.normalize().multiplyScalar(radius);
  	}
    this.computeGeometry(geo);
    this.ground = new THREE.Mesh(geo, this.materials);
    this.view.add(this.ground);
  }


  renderScene() {

    this.generatorSettings = new GeneratorSettings(this.seedString, this.uqmGenerationTable.findPlanetTypeByName(this.uqmGenerationType));
    this.updatePlanetName();
    // this.clouds.resolution = this.resolution;

    if(this.hasGenerationControls == null || this.hasGenerationControls == false) {
      this.generatorSettings.addControls(this);
      this.hasGenerationControls = true;
    }

    this.updateNormalScaleForRes(this.resolution);
    this.renderNebulaeGradient(this.generatorSettings);

    this.stars.resolution = this.resolution;
    this.nebula.resolution = this.resolution;
    this.atmosphere.randomizeColor(this.generatorSettings);
    // this.clouds.randomizeColor();
    // this.clouds.color = this.atmosphere.color;

    window.renderQueue.start();

    this.renderHeightMap(this.generatorSettings);
    this.renderMoistureMap(this.generatorSettings);
    this.renderNormalMap(this.generatorSettings);
    this.renderRoughnessMap(this.generatorSettings);
    this.renderTemperatureMap(this.generatorSettings);
    this.renderBiomeTexture(this.generatorSettings);
    this.renderTextureMap(this.generatorSettings);
    
    // this.clouds.render({
    //   waterLevel: this.waterLevel
    // });

    this.stars.render({
      nebulaeMap: this.nebulaeGradient.texture
    }, this.generatorSettings);

    this.nebula.render({
      nebulaeMap: this.nebulaeGradient.texture
    }, this.generatorSettings);

    this.sun.render(this.generatorSettings);


    window.renderQueue.addCallback(() => {
      this.updateMaterial();
    });
  }

  updateMaterial() {
    for (let i=0; i<6; i++) {
      let material = this.materials[i];
      material.roughness = this.roughness;
      material.metalness = this.metalness;

      if (this.displayMap == "textureMap") {
        material.map = this.textureMaps[i];
        material.normalMap = this.normalMaps[i];
        material.normalScale = new THREE.Vector2(this.normalScale, this.normalScale);
        material.roughnessMap = this.roughnessMaps[i];
        // material.metalnessMap = this.roughnessMaps[i];
      }
      else if (this.displayMap == "heightMap") {
        material.map = this.heightMaps[i];
        material.normalMap = null;
        material.roughnessMap = null;
      }
      else if (this.displayMap == "moistureMap") {
        material.map = this.moistureMaps[i];
        material.normalMap = null;
        material.roughnessMap = null;
      }
      else if (this.displayMap == "normalMap") {
        material.map = this.normalMaps[i];
        material.normalMap = null;
        material.roughnessMap = null;
      }
      else if (this.displayMap == "roughnessMap") {
        material.map = this.roughnessMaps[i];
        material.normalMap = null;
        material.roughnessMap = null;
      }
      else if (this.displayMap == "temperatureMap") {
        material.map = this.temperatureMaps[i];
        material.normalMap = null;
        material.roughnessMap = null;
      }

      material.needsUpdate = true;
    }
  }

  renderBiomeTexture(genSetting) {
    this.biome.generateTexture(genSetting);
  }

  renderNebulaeGradient(genSetting) {
    this.nebulaeGradient.generateTexture(genSetting);
  }

  renderHeightMap(genSetting) {
    this.heightMap.render({
      seed: genSetting.seed,
      resolution: this.resolution,
      res1: genSetting.heightMap.res1,
      res2: genSetting.heightMap.res2,
      resMix: genSetting.heightMap.resMix,
      mixScale: genSetting.heightMap.mixScale,
      doesRidged: genSetting.heightMap.doesRidged
      // doesRidged: 1
    });
  }

  renderMoistureMap(genSetting) {
    this.moistureMap.render({
      seed: genSetting.seed + 392.253,
      resolution: this.resolution,
      res1: genSetting.moistureMap.res1,
      res2: genSetting.moistureMap.res2,
      resMix: genSetting.moistureMap.resMix,
      mixScale: genSetting.moistureMap.mixScale,
      doesRidged: genSetting.moistureMap.doesRidged
      // doesRidged: 0
    });
  }

  renderNormalMap(genSetting) {
    this.normalMap.render({
      resolution: this.resolution,
      waterLevel: genSetting.waterLevel,
      heightMaps: this.heightMaps,
      textureMaps: this.textureMaps
    });
  }

  renderRoughnessMap(genSetting) {
    this.roughnessMap.render({
      resolution: this.resolution,
      heightMaps: this.heightMaps,
      waterLevel: genSetting.waterLevel,
      landRoughness: 0.75,
      waterRoughness: 0.9
    });
  }

  renderTemperatureMap(genSetting) {
    this.temperatureMap.render({
      resolution: this.resolution,
      heightMaps: this.heightMaps,
      pole1Factor: genSetting.pole1Factor,
      pole2Factor: genSetting.pole2Factor,
      heightFactor: genSetting.heightFactor,
      iciness: genSetting.iciness
    })
  }

  renderTextureMap(genSetting) {
    this.textureMap.render({
      resolution: this.resolution,
      heightMaps: this.heightMaps,
      moistureMaps: this.moistureMaps,
      biomeMap: this.biome.texture,
      temperatureMaps: this.temperatureMaps,
      iceCutoff: genSetting.iceCutoff
    });
  }

  createAtmosphere() {
    this.atmosphere = new Atmosphere();
    // this.atmosphere.color = this.glow.color;
    this.view.add(this.atmosphere.view);
  }

  createGlow() {
    this.glow = new Glow();
    // this.glow.color = this.atmosphere.color;
    this.view.add(this.glow.view);
  }

  createClouds() {
    this.clouds = new Clouds();
    this.view.add(this.clouds.view);
  }

  createStars() {
    this.stars = new Stars();
    this.view.add(this.stars.view);
  }

  createNebula() {
    this.nebula = new Nebula();
    this.view.add(this.nebula.view);
  }

  createSun() {
    this.sun = new Sun();
    this.view.add(this.sun.view);
  }

  updateNormalScaleForRes(value) {
    if (value == 256) this.normalScale = 0.25;
    if (value == 512) this.normalScale = 0.5;
    if (value == 1024) this.normalScale = 1.0;
    if (value == 2048) this.normalScale = 1.5;
    if (value == 4096) this.normalScale = 3.0;
  }

  computeGeometry(geometry) {
  	// geometry.makeGroups();
  	geometry.computeVertexNormals()
  	geometry.computeFaceNormals();
  	geometry.computeMorphNormals();
  	geometry.computeBoundingSphere();
  	geometry.computeBoundingBox();
  	// geometry.computeLineDistances();

  	geometry.verticesNeedUpdate = true;
  	geometry.elementsNeedUpdate = true;
  	geometry.uvsNeedUpdate = true;
  	geometry.normalsNeedUpdate = true;
  	// geometry.tangentsNeedUpdate = true;
  	geometry.colorsNeedUpdate = true;
  	geometry.lineDistancesNeedUpdate = true;
  	// geometry.buffersNeedUpdate = true;
  	geometry.groupsNeedUpdate = true;
  }

  updateQueryString(key, value, url) {
    if (!url) url = window.location.href;
    var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
        hash;

    if (re.test(url)) {
        if (typeof value !== 'undefined' && value !== null)
            return url.replace(re, '$1' + key + "=" + value + '$2$3');
        else {
            hash = url.split('#');
            url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
            if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                url += '#' + hash[1];
            return url;
        }
    }
    else {
        if (typeof value !== 'undefined' && value !== null) {
            var separator = url.indexOf('?') !== -1 ? '&' : '?';
            hash = url.split('#');
            url = hash[0] + separator + key + '=' + value;
            if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                url += '#' + hash[1];
            return url;
        }
        else
            return url;
    }
  }

  getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

}

const RGBToHSL = (r, g, b) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const l = Math.max(r, g, b);
  const s = l - Math.min(r, g, b);
  const h = s
    ? l === r
      ? (g - b) / s
      : l === g
      ? 2 + (b - r) / s
      : 4 + (r - g) / s
    : 0;
  return [
    60 * h < 0 ? 60 * h + 360 : 60 * h,
    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    (100 * (2 * l - s)) / 2,
  ];
};

export default Planet;
