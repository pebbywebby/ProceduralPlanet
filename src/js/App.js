import MainScene from './MainScene'
import RenderQueue from 'views/RenderQueue'
import ControlPanel from './ControlPanel'
import UrlHandler from './UrlHandler'
import GeneratorSettings from './GeneratorSettings'
import UqmGenerationTable from './UqmGenerationTable'
import UqmPlanetTable from './UqmPlanetTable'
import Stats from 'stats-js'
import dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import randomLorem from 'random-lorem'

class App {
    constructor() {
        window.App = this;

        this.seedString = "Scarlett";

        this.statsPanelEnabled = false;

        this.urlHandler = new UrlHandler();

        this.gui = new dat.GUI({ autoPlace: false });

        // @todo: Make non-global
        window.gui = this.gui;

        this.renderUi();

        // @todo: Make non-global
        window.renderQueue = new RenderQueue();

        this.generatorSettings = new GeneratorSettings();

        this.uqmGenerationTable = new UqmGenerationTable();
        this.uqmGenerationType = "unknown";
        this.uqmGenerationTypes = this.uqmGenerationTable.getAllTypeNames();

        this.uqmPlanetTable = new UqmPlanetTable();
        this.uqmPlanetTypes = this.uqmPlanetTable.getAllTypeNames();

        this.NON_UQM_PLANET = "NONE";
        let nonechoice = [ this.NON_UQM_PLANET ];
        let choicelist = nonechoice.concat(this.uqmPlanetTypes);
        this.uqmPlanetTypeChoices = choicelist;
        this.uqmPlanetType = this.NON_UQM_PLANET;
        this.uqmPlanetSeedChoices = [];
        this.uqmPlanetSeedChoice = "NONE";

        this.loadSeedFromUrl();

        this._controlPanel = new ControlPanel(this.gui);
        this._mainScene = new MainScene();

        this._controlPanel.createLightingControls(this.mainScene.directionalLight, this.mainScene.ambientLight);
        this._controlPanel.createCameraControls(this.mainScene.camera);
        this._controlPanel.createRandomizeControl(this, "randomize");

        let uqmGenerationTypeControl = this._controlPanel.createUqmGenerationTypeControl(this, "uqmGenerationType", this.uqmGenerationTypes);
        uqmGenerationTypeControl.onFinishChange(value => {
            this.regenerate();
        });

        let seedControl = this._controlPanel.createSeedControl(this, "seedString");
        seedControl.listen();
        seedControl.onFinishChange(value => {
            this.loadSeedFromTextfield();
        });

        this._mainScene.scene.add(this._mainScene.view);

        this.updatePlanetName();

        // Stats
        if (this.statsPanelEnabled) {
            this.stats = new Stats();
            this.stats.setMode(0);
            document.body.appendChild(this.stats.domElement);
            this.stats.domElement.style.position = 'absolute';
            this.stats.domElement.style.left = '10px';
            this.stats.domElement.style.top = '0px';
        }

        // Allow panning using the mouse
        this.createOrbitControls(this.mainScene.camera, this.mainScene.renderer.domElement);

        this.configureGlobalKeyListeners();

        window.onpopstate = (event) => {
            this.loadSeedFromURL();
        };

        this.renderScene();

        this.animate();
    }

    get mainScene() {
        return this._mainScene;
    }

    get controlPanel() {
        return this._controlPanel;
    }

    createBrandTag() {
        let a = document.createElement("a");
        a.href = "https://github.com/pistolshrimpgames/ProceduralPlanet";
        a.innerHTML = "<div id='brandTag'><img id='brandTagImage' src='assets/textures/pistolshrimp_logoonly.png'>UQM Planet Generator</div>";
        document.body.appendChild(a);
    }

    createOrbitControls(camera, rendererElement) {
        this.orbitControls = new OrbitControls(camera, rendererElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.1;
        this.orbitControls.rotateSpeed = 0.1;
        this.orbitControls.autoRotate = false;
        this.orbitControls.autoRotateSpeed = 0.01;
        this.orbitControls.zoomSpeed = 0.1;
    }

    animate() {
        window.requestAnimationFrame( this.animate.bind(this) );

        if (this.statsPanelEnabled) {
            this.stats.begin();
        }

        if (this.orbitControls) {
            this.orbitControls.update();
        }

        this._mainScene.update();

        window.renderQueue.update();

        if (this.statsPanelEnabled) {
            this.stats.end();
        }
    }

    loadSeedFromTextfield() {
        this.urlHandler.updateQueryString("seed", this.seedString);
        
        this.regenerate();
    }

    loadSeedFromUrl() {
        this.seedString = this.urlHandler.getParameterByName("seed");

        if (this.seedString) {
            this.regenerate();
        } else {
            this.randomize(true);
        }
    }

    randomize(use_uqm_table = false) {
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

            this.clearPickPlanetSeedUi();
        } else {
            let type = this.uqmPlanetType == "NONE"
                ? this.uqmPlanetTable.getRandomPlanetType()
                : this.uqmPlanetTable.findPlanetTypeByName(this.uqmPlanetType);

            let seeds = type.seeds;
            this.seedString = seeds[Math.floor(Math.random() * seeds.length)];
        }

        this.urlHandler.updateQueryString("seed", this.seedString);

        this.autoGenCountCurrent = 0;
        this.renderScene();
    }

    regenerate() {
        this.autoGenCountCurrent = 0;
        this.renderScene();
    }

    renderScene() {
        this.generatorSettings.set(this.seedString, this.uqmGenerationTable.findPlanetTypeByName(this.uqmGenerationType));

        if (this.hasGenerationControls == null || this.hasGenerationControls == false) {
            this.generatorSettings.addControls(this);
            this.hasGenerationControls = true;
        }

        this.updatePlanetName();
        
        if (this._mainScene) {
            this._mainScene.renderScene(this.generatorSettings);
        }
    }

    clearPickPlanetSeedUi() {
        this.uqmPlanetSeedChoices = [];
        this.uqmPlanetSeedChoice = "NONE";
    
        if (this.uqmPlanetSeedChoiceControl != null) {
            this.gui.remove(this.uqmPlanetSeedChoiceControl);
            this.uqmPlanetSeedChoiceControl = null;
        }
        
        if (this.randomizeUqmButton != null) {
            this.gui.remove(this.randomizeUqmButton);
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
            this.urlHandler.updateQueryString("seed", this.seedString);
      
            this.autoGenCountCurrent = 0;
            this.renderScene();
        }
    }
  
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
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

    configureGlobalKeyListeners() {
        document.addEventListener("keydown", (event) => {
            if (event.target.nodeName != "BODY") {
                return;
            }

            // SPACE
            if (event.keyCode == 32) {
                this.randomize();
            }
        });

        window.addEventListener("keydown", (event) => {
            if (event.target.nodeName != 'BODY') {
                return;
            }
      
            if (event.keyCode == '72') {
                var brandTag = document.getElementById("brandTag");
                var infoBoxHolder = document.getElementById("infoBoxHolder");
    
                if (brandTag.style.visibility == "hidden") {
                    brandTag.style.visibility = "visible";
                    infoBoxHolder.style.visibility = "visible";
                } else {
                    brandTag.style.visibility = "hidden";
                    infoBoxHolder.style.visibility = "hidden";
                }
            }
        }, false);
    }

    renderUi() {
        this.createBrandTag();

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
        infoBoxHolder.appendChild(this.gui.domElement);
    
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
    
        // new planet button
        let newPlanetButtonHolder = document.createElement("div");
        newPlanetButtonHolder.setAttribute("id", "newPlanetButtonHolder");
        newPlanetButtonHolder.innerHTML = "<div id='newPlanetButton'>New Planet</div>";
        document.body.appendChild(newPlanetButtonHolder);
    
        let newPlanetButton = document.getElementById("newPlanetButton");
        newPlanetButton.addEventListener('click', (event) => {
            this.randomize();
        });
    }
}

export default App;
