import * as THREE from 'three'
import Biome from 'views/Biome'
import Atmosphere from 'views/Atmosphere.js'
import NoiseMap from 'views/NoiseMap.js'
import TextureMap from 'views/TextureMap.js'
import NormalMap from 'views/NormalMap.js'
import RoughnessMap from 'views/RoughnessMap.js'
import TemperatureMap from 'views/TemperatureMap.js'
import Clouds from 'views/Clouds.js'
import Glow from 'views/Glow.js'

class Planet {

  constructor(view) {
    this.view = view;

    this.materials = [];
    this.roughness = 0.8;
    this.metalness = 0.5;
    this.normalScale = 1.0;
    this.resolution = 1024;
    this.size = 1000;

    this.genSettingsChanged = false;  //ensures only one rerender can happen per frame

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
    this.displayMapControl = window.App.controlPanel.addControlToFolder("Debug", this, "displayMap", ["textureMap", "heightMap", "moistureMap", "normalMap", "roughnessMap", "temperatureMap"]);
    this.displayMapControl.onChange(value => { this.updateMaterial(); });

    this.showBiomeMap = false;
    this.showBiomeMapControl = window.App.controlPanel.addControlToFolder("Debug", this, "showBiomeMap");
    this.showBiomeMapControl.onChange(value => {
      if (this.biome) {
        this.biome.toggleCanvasDisplay(value);
      }
    });

    this.biome = new Biome();

    this.createPlanet();

    this.createClouds();
    // this.createGlow();

    // this.atmosphereRing = new AtmosphereRing();
    // this.view.add(this.atmosphereRing.view);

    this.createAtmosphere();

    this.rotate = true;
    this.autoGenerate = false;
    this.autoGenCountCurrent = 0;
    this.autoGenTime = 3*60;
    this.autoGenCountMax = this.autoGenTime * 60;

    window.gui.add(this, "rotate");

    this.resolutionControl = window.gui.add(this, "resolution", [64, 128, 256, 512, 1024, 2048, 4096]);
    this.resolutionControl.onChange(value => { this.regenerate(); });

    window.App.controlPanel.addControlToFolder("Debug", this, "autoGenerate");
    this.autoGenTimeControl = window.App.controlPanel.addControlToFolder("Debug", this, "autoGenTime", 30, 300).step(1);
    this.autoGenTimeControl.onChange(value => { this.autoGenCountMax = this.autoGenTime * 60 });
  }

  update() {
    this.genSettingsChanged = false;

    if (this.rotate) {
      this.ground.rotation.y += 0.0005;
      this.clouds.view.rotation.y += 0.0007;
    }

    this.atmosphere.update();

    // this.glow.update();

    if (this.autoGenerate) {
      this.autoGenCountCurrent++;
      if (this.autoGenCountCurrent > this.autoGenCountMax) {
        this.randomize();
      }
    }

    // this.atmosphereRing.update();
  }

  randomizeUqm() {
    this.randomize(1);
    this.uqmPlanetSeedChoice = window.App.seedString;
    
    if (this.uqmPlanetSeedChoiceControl != null) {
        this.uqmPlanetSeedChoiceControl.updateDisplay();
    }
  }

  pickPlanetType() {
      let typeString = this.uqmPlanetType;
      let type = UqmGenerationTable.findPlanetTypeByName(this.uqmPlanetType);

      if (type != null) {
          this.uqmPlanetSeedChoices = type.seeds;
          this.uqmPlanetSeedChoice = type.seeds[0];
      } else {
          this.uqmPlanetSeedChoices = [];
          this.uqmPlanetSeedChoice = "NONE";
      }

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

  createPlanet() {
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
    const position = geo.getAttribute("position");
    const vertex = new THREE.Vector3();
    for (let i = 0; i < position.count; ++i) {
  		vertex.fromBufferAttribute(position, i);
  		vertex.normalize().multiplyScalar(radius);
      position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  	}
    this.computeGeometry(geo);
    this.ground = new THREE.Mesh(geo, this.materials);
    this.view.add(this.ground);
  }

  renderScene(generatorSettings) {
      this.atmosphere.randomizeColor(generatorSettings);
      this.clouds.resolution = this.resolution;
      this.clouds.color = this.atmosphere.color;

      this.renderHeightMap(generatorSettings);
      this.renderMoistureMap(generatorSettings);
      this.renderTemperatureMap(generatorSettings);
      this.renderBiomeTexture(generatorSettings);
      this.renderTextureMap(generatorSettings);
      this.renderNormalMap(generatorSettings);
      this.renderRoughnessMap(generatorSettings);
      
      this.clouds.render({
          waterLevel: generatorSettings.waterLevel
      }, generatorSettings);
  }

  renderBiomeTexture(genSetting) {
    this.biome.generateTexture(genSetting);
  }

  renderHeightMap(genSetting) {
    this.heightMap.render({
      seed: genSetting.seed,
      resolution: this.resolution,
      res1: genSetting.heightMap.res1,
      res2: genSetting.heightMap.res2,
      resMix: genSetting.heightMap.resMix,
      mixScale: genSetting.heightMap.mixScale,
      doesRidged: genSetting.heightMap.doesRidged,
      isJewel: genSetting.isJewel
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
      doesRidged: genSetting.moistureMap.doesRidged,
      isJewel: false
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
      landRoughness: 0.9,
      waterRoughness: 0.75
    });
  }

  createAtmosphere() {
    this.atmosphere = new Atmosphere({
      uqmPlanetType: this.uqmPlanetType
    });
    this.view.add(this.atmosphere.view);
  }

  createGlow() {
    this.glow = new Glow();
    this.view.add(this.glow.view);
  }

  createClouds() {
    this.clouds = new Clouds();
    this.view.add(this.clouds.view);
  }

  computeGeometry(geometry) {
  	geometry.computeVertexNormals()
  	geometry.computeBoundingSphere();
  	geometry.computeBoundingBox();

  	geometry.verticesNeedUpdate = true;
  	geometry.elementsNeedUpdate = true;
  	geometry.uvsNeedUpdate = true;
  	geometry.normalsNeedUpdate = true;
  	geometry.colorsNeedUpdate = true;
  	geometry.lineDistancesNeedUpdate = true;
  	geometry.groupsNeedUpdate = true;
  }

  updateMaterial() {
      for (let i = 0; i < 6; i++) {
          let material = this.materials[i];
          material.roughness = this.roughness;
          material.metalness = this.metalness;
      
          if (this.displayMap == "textureMap") {
              material.map = this.textureMaps[i];
              material.normalMap = this.normalMaps[i];
              material.normalScale = new THREE.Vector2(this.normalScale, this.normalScale);
              material.roughnessMap = this.roughnessMaps[i];
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
}

export default Planet;