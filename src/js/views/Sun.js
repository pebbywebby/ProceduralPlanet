import * as THREE from 'three'
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare'
import SunTexture from 'views/SunTexture.js'

export default class Sun {

  constructor() {
    this.view = new THREE.Object3D();
    this.setup();
  }

  setup() {
    let loader = new THREE.TextureLoader();
    this.textureFlare = loader.load( 'assets/textures/lenseFlareSun.jpg' );
    this.textureRing = loader.load( 'assets/textures/lenseFlareRing.jpg' );
    this.textureBlur = loader.load( 'assets/textures/lenseFlareBlur.jpg' );

    this.sunTexture = new SunTexture();

  }

  createLenseFlare(genSetting) {

    let h = genSetting.randRange(0,1);
    let s = 1.0;
    let l = 1.0;
    var sunColor = new THREE.Color().setHSL(h, s, l);
    let sunSize = genSetting.randRange(1000, 2000);
    sunSize = 1500;
    this.lensFlare = new Lensflare();
    this.lensFlare.addElement(new LensflareElement(this.sunTexture.texture, sunSize*2, 0.1, sunColor));

    let numFlares = 15;
    for (let i=0; i<numFlares; i++) {
      let size = genSetting.randRange(5, 200);
      let offset = genSetting.randRange(0.05, 0.4);
      let color = this.randomColor(genSetting);
      this.lensFlare.addElement(new LensflareElement(this.textureBlur, size, offset, color));
    }

    numFlares = 5;
    for (let i=0; i<numFlares; i++) {
      let size = genSetting.randRange(5, 200);
      let offset = genSetting.randRange(-0.05, -0.2);
      let color = this.randomColor(genSetting);
      this.lensFlare.addElement(new LensflareElement(this.textureBlur, size, offset, color));
    }

    let numRings = 3;
    for (let i=0; i<numRings; i++) {
      let size = genSetting.randRange(200, 400);
      let offset = genSetting.randRange(-0.1, 0.2);
      let color = genSetting.randomColor();
      this.lensFlare.addElement(new LensflareElement(this.textureRing, size, offset, color));
    }

    this.lensFlare.position.set(-20000, 20000, 20000);
    this.view.add( this.lensFlare );
  }

  randomColor(genSetting) {
    let h = genSetting.randRange(0, 1);
    let s = genSetting.randRange(0, 0.9);
    let l = 0.5;
    let color = new THREE.Color().setHSL(h, s, l);
    return color;
  }

  render(genSetting) {

    this.sunTexture.generateTexture(genSetting);
    this.view.remove(this.lensFlare);
    this.createLenseFlare(genSetting);
  }

}
