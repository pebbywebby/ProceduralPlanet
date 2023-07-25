import seedrandom from 'seedrandom'

class GeneratorSettings {
    //I would've liked to have made this a constructor and simply make a new object each time but that runs into issues
    //with the controls
    set(seedString, genData) {
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
        this.isJewel = genData.isJewel;

        //height map settings
        this.heightMap = {
            res1: this.randRange(genData.heightMap.resMin, genData.heightMap.resMax),
            res2: this.randRange(genData.heightMap.resMin, genData.heightMap.resMax),
            resMix: this.randRange(genData.heightMap.resMin, genData.heightMap.resMax),
            mixScale: this.randRange(genData.heightMap.mixScaleMin, genData.heightMap.mixScaleMax),
            doesRidged: Math.floor(this.randRange(genData.heightMap.doesRidgedMin, genData.heightMap.doesRidgedMax))
        }

        //moisture map settings
        this.moistureMap = {
            res1: this.randRange(genData.moistureMap.resMin, genData.moistureMap.resMax),
            res2: this.randRange(genData.moistureMap.resMin, genData.moistureMap.resMax),
            resMix: this.randRange(genData.moistureMap.resMin, genData.moistureMap.resMax),
            mixScale: this.randRange(genData.moistureMap.mixScaleMin, genData.moistureMap.mixScaleMax),
            doesRidged: Math.floor(this.randRange(genData.moistureMap.doesRidgedMin, genData.moistureMap.doesRidgedMax))
        }

        this.cloudMap = {
            res1: this.randRange(0.1, 1.0),
            res2: this.randRange(0.1, 1.0),
            resMix: this.randRange(0.1, 1.0),
            mixScale: this.randRange(0.1, 1.0)
        }

        if (this.isJewel == true)
            this.moistureMap.resMix = 0;

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
        for (let i = 0; i < 5; i++) {
            this.baseGradientArr[i] = {
                x1: this.randRange(0, biomeWidth), y1: this.randRange(0, biomeHeight),
                x2: this.randRange(0, biomeWidth), y2: this.randRange(0, biomeHeight)
            }
        }

        this.circleSize = this.randRange(30, 250);
        this.circleNum = 100;
        this.circleArr = new Array();
        for (let i = 0; i < this.circleNum; i++) {
            this.circleArr[i] = {
                size: this.randRange(10, this.circleSize), color: this.randomColor(),
                x: this.randRange(0, biomeWidth), y: this.randRange(0, biomeHeight) - biomeHeight * this.waterLevel
            }
        }

        this.inlandSize = 100;
        this.landDetail = Math.round(this.randRange(0, 5));
        this.landDetailArr = new Array();
        for (let i = 0; i < this.landDetail; i++) {
            let x1 = this.randRange(0, biomeWidth);
            let y1 = this.randRange(0, biomeHeight);
            let x2 = this.randRange(0, biomeWidth);
            let y2 = this.randRange(0, biomeHeight);
            this.landDetailArr[i] = {
                x: x1, y: y1, width: x2 - x1, height: y2 - y1,
                gradx1: this.randRange(0, biomeWidth), grady1: this.randRange(0, biomeHeight),
                gradx2: this.randRange(0, biomeWidth), grady2: this.randRange(0, biomeHeight),
                offset1: this.randRange(0, 0.5), offset2: this.randRange(0.5, 1.0),
                color: this.randomColor()
            }
        }
    }

    randRange(low, high) {
        let range = high - low;
        let n = this.rng() * range;
        return low + n;
    }

    randomColor() {
        this.paletteNum += 1;
        let palette = this.colorPalette[this.paletteNum % this.colorPalette.length];

        let h = this.randRange(palette.hMin, palette.hMax);
        let s = this.randRange(palette.sMin, palette.sMax);
        let l = this.randRange(palette.lMin, palette.lMax);

        return new THREE.Color().setHSL(h, s, l);
    }

    addControls(planet) {
        this.generationControls = window.gui.addFolder('Generation Controls');

        //water controls
        this.waterControls = this.generationControls.addFolder('Water Controls');
        this.waterLevelControl = this.waterControls.add(this, "waterLevel", 0.0, 1.0);
        this.waterLevelControl.onChange(value => {
            if (planet.genSettingsChanged != true) {
                planet.renderNormalMap(this); planet.renderRoughnessMap(this);
                planet.renderBiomeTexture(this); planet.renderTextureMap(this);
                planet.genSettingsChanged = true;
            }
        });

        this.waterColorHControl = this.waterControls.add(this, "waterColorH", 0.0, 1.0);
        this.waterColorHControl.onChange(value => {
            if (planet.genSettingsChanged != true) {
                this.waterColor = new THREE.Color().setHSL(this.waterColorH, this.waterColorS, this.waterColorL);
                planet.renderBiomeTexture(this); planet.renderTextureMap(this);
                planet.genSettingsChanged = true;
            }
        });
        this.waterColorSControl = this.waterControls.add(this, "waterColorS", 0.0, 1.0);
        this.waterColorSControl.onChange(value => {
            if (planet.genSettingsChanged != true) {
                this.waterColor = new THREE.Color().setHSL(this.waterColorH, this.waterColorS, this.waterColorL);
                planet.renderBiomeTexture(this); planet.renderTextureMap(this);
                planet.genSettingsChanged = true;
            }
        });
        this.waterColorLControl = this.waterControls.add(this, "waterColorL", 0.0, 1.0);
        this.waterColorLControl.onChange(value => {
            if (planet.genSettingsChanged != true) {
                this.waterColor = new THREE.Color().setHSL(this.waterColorH, this.waterColorS, this.waterColorL);
                planet.renderBiomeTexture(this); planet.renderTextureMap(this);
                planet.genSettingsChanged = true;
            }
        });

        //ice controls
        this.iceControls = this.generationControls.addFolder('Ice Controls');
        this.pole1FactorControl = this.iceControls.add(this, "pole1Factor", 0.0, 5.0);
        this.pole1FactorControl.onChange(value => {
            if (planet.genSettingsChanged != true) {
                planet.renderTemperatureMap(this); planet.renderTextureMap(this); planet.renderNormalMap(this);
                planet.genSettingsChanged = true;
            }
        });
        this.pole2FactorControl = this.iceControls.add(this, "pole2Factor", 0.0, 5.0);
        this.pole2FactorControl.onChange(value => {
            if (planet.genSettingsChanged != true) {
                planet.renderTemperatureMap(this); planet.renderTextureMap(this); planet.renderNormalMap(this);
                planet.genSettingsChanged = true;
            }
        });
        this.heightFactorControl = this.iceControls.add(this, "heightFactor", 0.0, 10.0);
        this.heightFactorControl.onChange(value => {
            if (planet.genSettingsChanged != true) {
                planet.renderTemperatureMap(this); planet.renderTextureMap(this); planet.renderNormalMap(this);
                planet.genSettingsChanged = true;
            }
        });
        this.icinessControl = this.iceControls.add(this, "iciness", -1.0, 1.0);
        this.icinessControl.onChange(value => {
            if (planet.genSettingsChanged != true) {
                planet.renderTemperatureMap(this); planet.renderTextureMap(this); planet.renderNormalMap(this);
                planet.genSettingsChanged = true;
            }
        });
        //this.iceCutoffControl = this.generationControls.add(this, "iceCutoff", 0.05, 0.3);
        //this.iceCutoffControl.onChange(value => { planet.renderTextureMap(this);});

        //heightmap controls
        this.hmapControls = this.generationControls.addFolder('Height Map Controls');
        this.hmapRes1 = this.hmapControls.add(this.heightMap, "res1", 0.0, 5.0);
        this.hmapRes1.onChange(value => {
            if (planet.genSettingsChanged != true) {
                this.heightMap.res2 = value; this.heightMap.resMix = value;
                planet.renderHeightMap(this); planet.renderTemperatureMap(this); planet.renderTextureMap(this); planet.renderNormalMap(this);
                planet.genSettingsChanged = true;
                console.error("error");
            }
        });
        this.hmapMixScale = this.hmapControls.add(this.heightMap, "mixScale", 0.0, 1.0);
        this.hmapMixScale.onChange(value => {
            if (planet.genSettingsChanged != true) {
                planet.renderHeightMap(this); planet.renderTemperatureMap(this); planet.renderTextureMap(this); planet.renderNormalMap(this);
                planet.genSettingsChanged = true;
            }
        });
        this.hmapDoesRidged = this.hmapControls.add(this.heightMap, "doesRidged", 0, 5, 1);
        this.hmapDoesRidged.onChange(value => {
            if (planet.genSettingsChanged != true) {
                planet.renderHeightMap(this); planet.renderTemperatureMap(this); planet.renderTextureMap(this); planet.renderNormalMap(this);
                planet.genSettingsChanged = true;
            }
        });

        //moisturemap controls
        this.mmapControls = this.generationControls.addFolder('Moisture Map Controls');
        this.mmapRes1 = this.mmapControls.add(this.moistureMap, "res1", 0.0, 30.0);
        this.mmapRes1.onChange(value => {
            if (planet.genSettingsChanged != true) {
                this.moistureMap.res2 = value; this.moistureMap.resMix = value;
                if (this.isJewel != true) { this.moistureMap.resMix = 0; }
                planet.renderMoistureMap(this); planet.renderTextureMap(this); planet.renderNormalMap(this);
                planet.genSettingsChanged = true;
            }
        });
        this.mmapMixScale = this.mmapControls.add(this.moistureMap, "mixScale", 0.0, 1.0);
        this.mmapMixScale.onChange(value => {
            if (planet.genSettingsChanged != true) {
                planet.renderMoistureMap(this); planet.renderTextureMap(this); planet.renderNormalMap(this);
                planet.genSettingsChanged = true;
            }
        });
        this.mmapDoesRidged = this.mmapControls.add(this.moistureMap, "doesRidged", 0, 5, 1);
        this.mmapDoesRidged.onChange(value => {
            if (planet.genSettingsChanged != true) {
                planet.renderMoistureMap(this); planet.renderTextureMap(this); planet.renderNormalMap(this);
                planet.genSettingsChanged = true;
            }
        });
    }
}

export default GeneratorSettings;