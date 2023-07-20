import * as THREE from 'three'
import vertShader from 'shaders/texture.vert'
import fragShader from 'shaders/temperatureMap.frag'
import Map from 'views/Map.js'

//provides a map of relative temperature
class TemperatureMap extends Map {

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
                    heightMap: { type: "t", value: new THREE.Texture() },
                    pole1Factor: { type: "f", value: 1.0 },
                    pole1Coord: { value: new THREE.Vector3() },
                    pole2Factor: { type: "f", value: 1.0 },
                    pole2Coord: { value: new THREE.Vector3() },
                    heightFactor: { type: "f", value: 3.0 },
                    iciness: { type: "f", value: 1.0 },
                    index: { type: "i", value: 1 }
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

            this.mats[i].uniforms.pole1Coord.value.y = 1.0;
            this.mats[i].uniforms.pole2Coord.value.y = -1.0;

            this.mats[i].uniforms.pole1Factor.value = props.pole1Factor;
            this.mats[i].uniforms.pole2Factor.value = props.pole2Factor;
            this.mats[i].uniforms.heightFactor.value = props.heightFactor;
            this.mats[i].uniforms.iciness.value = props.iciness;
            this.mats[i].uniforms.index.value = i;
            this.mats[i].needsUpdate = true;
        }

        super.render(props);
    }

}

export default TemperatureMap;
