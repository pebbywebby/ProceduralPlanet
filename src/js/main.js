import * as THREE from 'three'
import AbstractApplication from 'views/AbstractApplication'
import shaderVert from 'shaders/custom.vert'
import shaderFrag from 'shaders/custom.frag'
import Planet from 'views/Planet'
import RenderQueue from 'views/RenderQueue'


class Main extends AbstractApplication {

    constructor(){
        super();

        // texture loading example
        // var texture = new THREE.TextureLoader().load( 'assets/textures/crate.gif' );

        this.createBrandTag();

        window.renderQueue = new RenderQueue();

        this.planet = new Planet();
        this.scene.add(this.planet.view);

        this.animate();
    }

    createBrandTag() {
      let a = document.createElement("a");
      a.href = "https://github.com/pistolshrimpgames/ProceduralPlanet";
      a.innerHTML = "<div id='brandTag'><img id='brandTagImage' src='assets/textures/pistolshrimp_logoonly.png'>UQM Planet Generator</div>";
      document.body.appendChild(a);
    }

    animate() {
      super.animate();

      window.renderQueue.update();
      this.planet.update();
    }

}

export default Main;
