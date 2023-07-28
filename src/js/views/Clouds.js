import * as THREE from 'three'
import CloudMap from 'views/CloudMap.js'
import tinycolor from 'tinycolor2'

class Clouds {

  constructor() {
    this.view = new THREE.Object3D();

    this.materials = [];
    this.roughness = 0.9;
    this.metalness = 0.5;
    this.normalScale = 5.0;
    this.clouds = 1.0;


    this.resolution = 1024;
    this.size = 1001;


    this.color = new THREE.Color(0xffffffff);

    this.cloudColor = [this.color.r*255, this.color.g*255, this.color.b*255];

    this.cloudMaps = [];

    this.setup();


    let cloudControl = window.gui.add(this, "clouds", 0.0, 1.0);
    cloudControl.onChange(value => { this.updateMaterial(); });

    let colorControl = window.gui.addColor(this, "cloudColor");
    colorControl.onChange(value => {
      this.color.r = value[0] / 255;
      this.color.g = value[1] / 255;
      this.color.b = value[2] / 255;
      this.updateMaterial();
    });

  }

  setup() {

    this.cloudMap = new CloudMap();
    this.cloudMaps = this.cloudMap.maps;

    for (let i=0; i<6; i++) {
      let material = new THREE.MeshStandardMaterial({
        color: this.color,
        transparent: true,
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
    this.sphere = new THREE.Mesh(geo, this.materials);
    this.view.add(this.sphere);
  }

  render(props, genSetting) {
    this.cloudMap.render({
      seed: genSetting.seed,
      resolution: this.resolution,
      res1: genSetting.cloudMap.res1,
      res2: genSetting.cloudMap.res2,
      resMix: genSetting.cloudMap.resMix,
      mixScale: genSetting.cloudMap.mixScale
    });

    this.updateMaterial();
  }

  updateMaterial() {
    for (let i=0; i<6; i++) {
      let material = this.materials[i];
      material.roughness = this.roughness;
      material.metalness = this.metalness;
      material.opacity = this.clouds;
      material.map = this.cloudMaps[i];
      material.color = this.color;
    }
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

}

export default Clouds;
