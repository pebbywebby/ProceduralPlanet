import 'three'
import Nebula from 'views/Nebula'
import NebulaeGradient from 'views/NebulaeGradient'
import Planet from 'views/Planet'
import Stars from 'views/Stars'
import Sun from 'views/Sun'

class MainScene {
    constructor(gui) {
        this.gui = gui;

        this.resolution = 1024;

        this._camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 100000 );
        this._camera.position.z = 2700;

        // @todo: Make non-global
        window.camera = this._camera;

        this._scene = new THREE.Scene();

        this._renderer = new THREE.WebGLRenderer({antialias: false, alpha: true});

        // For now, we need to override the default output color space to preserve the correct lighting following a
        // change in Three.js 0.152. We should fix this by going through the color assignments and material textures.
        // @see https://discourse.threejs.org/t/updates-to-color-management-in-three-js-r152/50791
        this._renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
        
        this._renderer.setPixelRatio( window.devicePixelRatio );
        this._renderer.sortObjects = false;
        this._renderer.setSize( window.innerWidth, window.innerHeight );

        // @todo: Make non-global
        window.renderer = this._renderer;

        document.body.appendChild( this._renderer.domElement );

        // lights
        this._ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
        this._scene.add(this.ambientLight);

        this._directionalLight = new THREE.DirectionalLight( 0xffffff, 1.6 );
        this._directionalLight.position.set( -1, 1.0, 1 );
        this._scene.add(this._directionalLight);

        // @todo: Make non-global
        window.light = this._directionalLight;

        window.addEventListener( 'resize', this.onWindowResize.bind(this), false );

        this.autoGenCountCurrent = 0;

        this.view = new THREE.Object3D();

        this.createStars();

        this.showNebulaMap = false;
        this.createNebula();

        this.createSun();

        this.planet = new Planet(this.view);
    }

    get renderer() {
        return this._renderer;
    }

    get camera() {
        return this._camera;
    }

    get scene() {
        return this._scene;
    }

    get ambientLight() {
        return this._ambientLight;
    }

    get directionalLight() {
        return this._directionalLight;
    }
  
    onWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();

        this._renderer.setSize( window.innerWidth, window.innerHeight );
    }

    update(timestamp) {
        this._renderer.render( this._scene, this._camera );

        if (this.planet.rotate) {
            this.stars.view.rotation.y += 0.0003;
            this.nebula.view.rotation.y += 0.0003;
        }

        this.planet.update();

        this.stars.view.position.copy(this._camera.position);
        this.nebula.view.position.copy(this._camera.position);
    }

    createNebula() {
        this.nebulaeGradient = new NebulaeGradient();

        this.showNebulaMap = false;
        this.showNebulaMapControl = window.App.controlPanel.addControlToFolder("Debug", this, "showNebulaMap");
        this.showNebulaMapControl.onChange(value => {
            if (this.nebulaeGradient) {
                this.nebulaeGradient.toggleCanvasDisplay(value);
            }
        });

        this.nebula = new Nebula();
        this.view.add(this.nebula.view);

        ///enviromentFolder.add(this.atmosphere, "atmosphere", 0.0, 1.0).step(0.01);
        window.App.controlPanel.addControlToFolder("Environment", this.nebula, "nebula", 0.0, 1.0).step(0.01).onChange(value => {
            this.nebula.updateMaterial();
        });
    }

    createStars() {
        this.stars = new Stars();
        this.view.add(this.stars.view);
    }

    createSun() {
        this.sun = new Sun();
        this.view.add(this.sun.view);
      }

    renderNebulaeGradient(genSetting) {
        this.nebulaeGradient.generateTexture(genSetting);
    }

    renderScene(generatorSettings) {
        this.updateNormalScaleForRes(this.resolution);
        this.renderNebulaeGradient(generatorSettings);
    
        this.stars.resolution = this.resolution;
        this.nebula.resolution = this.resolution;
       
        this.planet.renderScene(generatorSettings);
    
        this.stars.render({
            nebulaeMap: this.nebulaeGradient.texture
        }, generatorSettings);
    
        this.nebula.render({
            nebulaeMap: this.nebulaeGradient.texture
        }, generatorSettings);
    
        this.sun.render(generatorSettings);
    
        window.renderQueue.addCallback(() => {
            this.stars.updateMaterial();
            this.nebula.updateMaterial();
            this.planet.updateMaterial();
        });
    }

    updateNormalScaleForRes(value) {
        if (value == 64) {
            this.normalScale = 0.0625;
        } else if (value == 128) {
            this.normalScale = 0.125;
        } else if (value == 256) {
            this.normalScale = 0.25;
        } else if (value == 512) {
            this.normalScale = 0.5;
        } else if (value == 1024) {
            this.normalScale = 1.0;
        } else if (value == 2048) {
            this.normalScale = 1.5;
        } else if (value == 4096) {
            this.normalScale = 3.0;
        }
    }
}

export default MainScene;