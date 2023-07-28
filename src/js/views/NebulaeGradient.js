import * as THREE from 'three'


class NebulaeGradient {

  constructor() {

    this.canvas = document.createElement("canvas");
    this.canvas.id = "nebulaeCanvas";
    this.canvas.width = 512;
    this.canvas.height = 512;
    this.canvas.style.width = "200px";
    this.canvas.style.height = "200px";
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.ctx = this.canvas.getContext("2d");

    document.body.appendChild(this.canvas);
    this.toggleCanvasDisplay(false);
  }

  generateTexture(genSetting) {

    let h = genSetting.randRange(0.0, 1.0);
    let s = genSetting.randRange(0.2, 0.8);
    let l = genSetting.randRange(0.2, 0.6);
    this.baseColor = new THREE.Color().setHSL(h, s, l);
    this.colorAngle = genSetting.randRange(0.0, 0.5);

    this.fillBaseColor();
    this.drawShapes(genSetting);

    this.texture = new THREE.CanvasTexture(this.canvas);

  }

  toggleCanvasDisplay(value) {
    if (value) {
      this.canvas.style.display = "block";
    } else {
      this.canvas.style.display = "none";
    }
  }

  fillBaseColor() {
    this.ctx.fillStyle = this.toCanvasColor(this.baseColor);
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawShapes(genSetting) {
    let numCircles = Math.round(genSetting.randRange(20, 50));
    for (let i=0; i<numCircles; i++) {
      this.randomGradientCircle(genSetting);
    }
  }

  randomGradientCircle(genSetting) {
    let x1 = genSetting.randRange(0, this.width);
    let y1 = genSetting.randRange(0, this.height);
    let size = genSetting.randRange(100, 200);
    let x2 = x1;
    let y2 = y1;
    let r1 = 0;
    let r2 = size;

    let gradient = this.ctx.createRadialGradient(x1,y1,r1,x2,y2,r2);

    let c = this.randomColor(genSetting);

    gradient.addColorStop(0, "rgba("+c.r+", "+c.g+", "+c.b+", 1.0)");
    gradient.addColorStop(1, "rgba("+c.r+", "+c.g+", "+c.b+", 0.0)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }


  randomColor(genSetting) {

    let newColor = this.baseColor.clone();

    let hOffset = 0.0;
    let range = 0.1;
    let n = genSetting.randRange(0,1);
    if (n < 0.33) {
      hOffset = 0.0 + genSetting.randRange(-range, range);
    } else if (n < 0.66) {
      hOffset = this.colorAngle + genSetting.randRange(-range, range);
    } else {
      hOffset = -this.colorAngle + genSetting.randRange(-range, range);
    }

    let sOffset = genSetting.randRange(-0.4, 0.2);
    let lOffset = genSetting.randRange(-0.4, 0.2);

    newColor.offsetHSL(hOffset, sOffset, lOffset);

    return {r: Math.round(newColor.r*255),
            g: Math.round(newColor.g*255),
            b: Math.round(newColor.b*255)};

  }

  toCanvasColor(c) {
    return "rgba("+Math.round(c.r*255)+", "+Math.round(c.g*255)+", "+Math.round(c.b*255)+", 1.0)";
  }

}

export default NebulaeGradient;
