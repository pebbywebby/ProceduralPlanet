import * as THREE from 'three'
import NebulaMap from 'views/NebulaMap.js'

export default class Nebula {

  constructor() {
    this.view = new THREE.Object3D();

    this.materials = [];
    this.roughness = 0.8;
    this.metalness = 0.5;
    this.emissiveIntensity = 1.0;

    this.resolution = 1024;
    this.size = 45000;
    this.nebula = 1.0;

    this.skyMaps = [];

    this.setup();
  }

  setup() {

    this.skyMap = new NebulaMap();
    this.skyMaps = this.skyMap.maps;

    for (let i=0; i<6; i++) {
      let material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0xFFFFFF),
        side: THREE.BackSide,
        transparent: true,
        opacity: this.nebula
      });
      this.materials[i] = material;
    }

    let geo = new THREE.BoxGeometry(1, 1, 1, 32, 32, 32);
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

    this.seed = genSetting.randRange(0, 1000);

    let min = 1.0;
    let max = 3.0;

    this.skyMap.render({
      seed: this.seed,
      resolution: this.resolution,
      res1: genSetting.randRange(min, max),
      res2: genSetting.randRange(min, max),
      resMix: genSetting.randRange(min, max),
      mixScale: genSetting.randRange(min, max),
      color1: this.color1,
      color2: this.color2,
      color3: this.color3,
      nebulaeMap: props.nebulaeMap
    });

    this.updateMaterial();
  }

  updateMaterial() {
    for (let i=0; i<6; i++) {
      let material = this.materials[i];
      material.map = this.skyMaps[i];
      material.opacity = this.nebula;
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
