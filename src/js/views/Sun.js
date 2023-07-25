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
    // this.textureSun = loader.load( 'assets/textures/lenseFlare.jpg' );

    this.sunTexture = new SunTexture();

  }

  createLenseFlare(genSetting) {

    let h = genSetting.randRange(0,1);
    let s = 1.0;
    let l = 1.0;
    var sunColor = new THREE.Color().setHSL(h, s, l);
    var sunColor2 = new THREE.Color().setHSL(genSetting.randRange(0,1), s, 0.5);
    let sunSize = genSetting.randRange(1000, 2000);
    sunSize = 1500;
    this.lensFlare = new Lensflare();
    this.lensFlare.addElement(new LensflareElement(this.sunTexture.texture, sunSize*2, 0.1, sunColor));


    let numFlares = 15;
    for (let i=0; i<numFlares; i++) {
      let size = genSetting.randRange(5, 200);
      // size = Math.pow(size, 2) * 200;
      let offset = genSetting.randRange(0.05, 0.4);
      let color = this.randomColor(genSetting);
      let alpha = genSetting.randRange(0.1, 0.3);
      this.lensFlare.addElement(new LensflareElement(this.textureBlur, size, offset, color));
    }

    numFlares = 5;
    for (let i=0; i<numFlares; i++) {
      let size = genSetting.randRange(5, 200);
      // size = Math.pow(size, 2) * 200;
      let offset = genSetting.randRange(-0.05, -0.2);
      let color = this.randomColor(genSetting);
      let alpha = genSetting.randRange(0.1, 0.3);
      this.lensFlare.addElement(new LensflareElement(this.textureBlur, size, offset, color));
    }


    let numRings = 3;
    for (let i=0; i<numRings; i++) {
      let size = genSetting.randRange(200, 400);
      // size = Math.pow(size, 2) * 200;
      let offset = genSetting.randRange(-0.1, 0.2);
      let color = genSetting.randomColor();
      let alpha = genSetting.randRange(0, 0.1);
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

    // this.sunTexture.generateTexture();
    //
    // this.view.remove(this.lenseFlare);
    //
    // var flareColor = new THREE.Color( 0xffffff );
    // this.lensFlare = new THREE.LensFlare( this.sunTexture.texture, 700, 0.0, THREE.AdditiveBlending, flareColor );
    // this.lensFlare.position.set(-20000, 20000, 20000);
    // this.view.add( this.lensFlare );

    // this.lensFlare.texture = this.sunTexture.texture;
    // this.lenseFlare.texture.needsUpdate = true;
    // this.sunTexture.texture.needsUpdate = true;

    // this.view.remove(this.lenseFlare);

    // var textureFlare = new THREE.TextureLoader().load( 'assets/textures/lenseFlare.jpg' );

  }

}
