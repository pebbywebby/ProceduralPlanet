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
      //this.maps.push(new THREE.Texture());
    }
  }

  render(props) {
    let res = props.resolution;

    this.camera.left = -res/2;
    this.camera.right = res/2;
    this.camera.top = res/2;
    this.camera.bottom = -res/2;
    this.camera.updateProjectionMatrix();


    window.renderQueue.addAction(() => {

      let geo = new THREE.PlaneGeometry(res, res);
      let plane = new THREE.Mesh(geo);
      plane.position.z = -10;

      let scene = new THREE.Scene();
      scene.add(plane);

      //window.renderer.compile(scene, this.textureCamera);
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
