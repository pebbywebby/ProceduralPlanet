import * as THREE from 'three'

class Map {

  constructor() {
    //
  }

  setup() {
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);
    this.camera.position.z = 10;

    this.maps = [];
    this.renderTargets = [];

    for (let i = 0; i < 6; i++) {
      this.renderTargets[i] = new THREE.WebGLRenderTarget(1, 1, {minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat});
      this.maps[i] = this.renderTargets[i].texture;
    }
  }

  render(props) {
    let res = props.resolution;

    window.renderQueue.addAction(() => {

      let geo = new THREE.PlaneGeometry(2, 2);
      let plane = new THREE.Mesh(geo);
      plane.position.z = -10;

      let scene = new THREE.Scene();
      scene.add(plane);

      for (let i = 0; i < 6; i++) {
        this.renderTargets[i].setSize(res, res);
        plane.material = this.mats[i];
        window.renderer.setRenderTarget(this.renderTargets[i]);
        window.renderer.render(scene, this.camera);
      }

      window.renderer.setRenderTarget(null);
      geo.dispose();

    });

  }

}

export default Map;
