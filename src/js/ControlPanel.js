class ControlPanel {
    constructor(gui) {
        this.gui = gui;

        this.folders = [];
    }

    getFolder(name) {
        if (this.folders[name]) {
            return this.folders[name];
        }

        this.folders[name] = this.gui.addFolder(name);

        return this.folders[name];
    }

    addControlToFolder(folderName, obj, propertyName, min, max, step) {
        let folder = this.getFolder(folderName);

        return folder.add(obj, propertyName, min, max, step);
    }

    createLightingControls(directionalLight, ambientLight) {
        let lightFolder = this.gui.addFolder('Lighting');

        this.sunColor = {r:255, g:255, b:255};
        this.dirLightControl = lightFolder.addColor(this, "sunColor").onChange(value => {
          directionalLight.color.r = this.sunColor.r / 255;
          directionalLight.color.g = this.sunColor.g / 255;
          directionalLight.color.b = this.sunColor.b / 255;
        });

        lightFolder.add(directionalLight, "intensity", 0.0, 3.0);

        this.ambientColor = {r:255, g:255, b:255};
        this.ambientControl = lightFolder.addColor(this, "ambientColor").onChange(value => {
          ambientLight.color.r = this.ambientColor.r / 255;
          ambientLight.color.g = this.ambientColor.g / 255;
          ambientLight.color.b = this.ambientColor.b / 255;
        });

        lightFolder.add(ambientLight, "intensity", 0.0, 2.0);
    }

    createCameraControls(camera) {
        let cameraFolder = this.gui.addFolder('Camera');

        this.fovControl = cameraFolder.add(camera, "fov", 20, 120);
        this.fovControl.onChange(value => {
            camera.updateProjectionMatrix();
        });
    }

    createRandomizeControl(obj, propertyName) {
        this.gui.add(obj, propertyName);
    }

    createUqmGenerationTypeControl(obj, propertyName, options) {
        return this.gui.add(obj, propertyName, options);
    }

    createSeedControl(obj, propertyName) {
        return this.gui.add(obj, propertyName);
    }
}

export default ControlPanel;
