import * as THREE from 'three'
import vertShader from 'shaders/texture.vert'
import fragShader from 'shaders/roughnessMap.frag'
import Map from 'views/Map.js'

class RoughnessMap extends Map {

  constructor() {
    super();
    this.setup();
    super.setup();
  }

  setup() {
    this.mats = [];

    for (let i = 0; i < 6; i++) {
      this.mats[i] = new THREE.ShaderMaterial({
        uniforms: {
          resolution: { type: "f", value: 0 },
          heightMap: {type: "t", value: new THREE.Texture()},
          waterLevel: { type: "f", value: 0 },
          landRoughness: { type: "f", value: 0.75 },
          waterRoughness: { type: "f", value: 0.9 }
        },
        vertexShader: vertShader,
        fragmentShader: fragShader,
        transparent: true,
        depthWrite: false
      });
    }
  }

  render(props) {
    // props.resolution
    // props.heightMaps[]
    // props.waterLevel

    for (let i = 0; i < 6; i++) {
      this.mats[i].uniforms.resolution.value = props.resolution;
      this.mats[i].uniforms.heightMap.value = props.heightMaps[i];
      this.mats[i].uniforms.waterLevel.value = props.waterLevel;
      this.mats[i].uniforms.landRoughness.value = props.landRoughness;
      this.mats[i].uniforms.waterRoughness.value = props.waterRoughness;
      this.mats[i].needsUpdate = true;
    }

    super.render(props);
  }

}

export default RoughnessMap;
