import * as THREE from 'three'


class Biome {

  constructor() {

    this.canvas = document.createElement("canvas");
    this.canvas.id = "biomeCanvas";
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
    this.drawBase(genSetting);
    this.drawDetail(genSetting);
    this.drawInland(genSetting);
    this.drawBeach(genSetting);
    this.drawWater(genSetting);

    this.texture = new THREE.CanvasTexture(this.canvas);
  }

  toggleCanvasDisplay(value) {
    if (value) {
      this.canvas.style.display = "block";
    } else {
      this.canvas.style.display = "none";
    }
  }

  fillBaseColor(color) {
    this.ctx.fillStyle = this.toCanvasColor(color);
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
  drawBase(genSetting) {
    this.fillBaseColor(genSetting.baseColor);

    for (let i = 0; i < 5; i++) {
      let args = genSetting.baseGradientArr[i];
      this.randomGradientRect(genSetting.baseColor2, 0, 0, this.width, this.height, args.x1, args.y1, args.x2, args.y2);
    }
  }

  drawDetail(genSetting) {
    for (let i=0; i < genSetting.circleNum; i++) {
      let args = genSetting.circleArr[i];
      this.randomGradientCircle(args.color, args.size, args.x, args.y);
    }
    for (let i = 0; i < genSetting.landDetail; i++) {
      let args = genSetting.landDetailArr[i];
      this.randomGradientStrip(args.color, args.x, args.y, args.width, args.height,
        args.gradx1, args.grady1, args.gradx2, args.grady2, args.offset1, args.offset2);
    }
  }

  //unused
  drawRivers(genSetting) {
    // rivers
    let c = genSetting.riverColor;
    this.ctx.strokeStyle = "rgba("+c.r*255+", "+c.g*255+", "+c.b*255+", 0.5)";

    let x = genSetting.randRange(0, this.width);
    let y = genSetting.randRange(0, this.height);
    let prevX = x;
    let prevY = y;

    for (let i=0; i<5; i++) {
      x = genSetting.randRange(0, this.width);
      y = genSetting.randRange(0, this.height);

      this.ctx.moveTo(prevX, prevY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();

      prevX = x;
      prevY = y;
    }
  }

  drawWater(genSetting) {
    let x1 = 0;
    let y1 = this.height - (this.height * genSetting.waterLevel);
    let x2 = 0;
    let y2 = this.height;

    let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    let c = genSetting.waterColor;

    let falloff = 1.3*255;
    let falloff2 = 1.0*255;
    let falloff3 = 0.7*255;
    let opacity = 0.9;
    // gradient.addColorStop(0.0, "rgba("+cr+", "+cg+", "+cb+", "+0+")");
    gradient.addColorStop(0.0, "rgba("+Math.round(c.r*falloff)+", "+Math.round(c.g*falloff)+", "+Math.round(c.b*falloff)+", "+opacity+")");
    gradient.addColorStop(0.2, "rgba("+Math.round(c.r*falloff2)+", "+Math.round(c.g*falloff2)+", "+Math.round(c.b*falloff2)+", "+opacity+")");
    gradient.addColorStop(0.8, "rgba("+Math.round(c.r*falloff3)+", "+Math.round(c.g*falloff3)+", "+Math.round(c.b*falloff3)+", "+opacity+")");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x1, y1, this.width, this.height);
  }

  drawBeach(genSetting) {
    this.beachSize = 7;

    let x1 = 0;
    let y1 = this.height - (this.height * genSetting.waterLevel) - this.beachSize;
    let x2 = 0;
    let y2 = this.height - (this.height * genSetting.waterLevel);

    let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    let c = genSetting.beachColor;
    let falloff = 1.0*255;
    let falloff2 = 1.0*255;
    // gradient.addColorStop(0.0, "rgba("+cr+", "+cg+", "+cb+", "+0+")");
    gradient.addColorStop(0.0, "rgba("+Math.round(c.r*falloff)+", "+Math.round(c.g*falloff)+", "+Math.round(c.b*falloff)+", "+0.0+")");
    gradient.addColorStop(1.0, "rgba("+Math.round(c.r*falloff2)+", "+Math.round(c.g*falloff2)+", "+Math.round(c.b*falloff2)+", "+0.3+")");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x1, y1, this.width, this.beachSize);
  }

  drawInland(genSetting) {
    let x1 = 0;
    let y1 = this.height - (this.height * genSetting.waterLevel) - genSetting.inlandSize;
    let x2 = 0;
    let y2 = this.height - (this.height * genSetting.waterLevel);

    let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    let c = genSetting.inlandColor;
    let falloff = 1.0*255;
    let falloff2 = 1.0*255;
    // gradient.addColorStop(0.0, "rgba("+cr+", "+cg+", "+cb+", "+0+")");
    gradient.addColorStop(0.0, "rgba("+Math.round(c.r*falloff)+", "+Math.round(c.g*falloff)+", "+Math.round(c.b*falloff)+", "+0.0+")");
    gradient.addColorStop(1.0, "rgba("+Math.round(c.r*falloff2)+", "+Math.round(c.g*falloff2)+", "+Math.round(c.b*falloff2)+", "+0.5+")");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x1, y1, this.width, genSetting.inlandSize);
  }

  randomGradientStrip(c, x, y, width, height, gradx1, grady1, gradx2, grady2, offset1, offset2) {
    let gradient = this.ctx.createLinearGradient(gradx1, grady1, gradx2, grady2);
    gradient.addColorStop(offset1, "rgba("+c.r*255+", "+c.g*255+", "+c.b*255+", 0.0)");
    gradient.addColorStop(0.5, "rgba("+c.r*255+", "+c.g*255+", "+c.b*255+", 0.8)");
    gradient.addColorStop(offset2, "rgba("+c.r*255+", "+c.g*255+", "+c.b*255+", 0.0)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, width, height);
  }

  randomGradientRect(c, x, y, width, height, x1, y1, x2, y2) {
    let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);

    gradient.addColorStop(0, "rgba("+c.r*255+", "+c.g*255+", "+c.b*255+", 0.0)");
    gradient.addColorStop(1, "rgba("+c.r*255+", "+c.g*255+", "+c.b*255+", 1.0)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, width, height);
  }

  randomGradientCircle(color, size, x, y) {
    let x1 = x;
    let y1 = y;
    let x2 = x1;
    let y2 = y1;
    let r1 = 0;
    let r2 = size;

    let gradient = this.ctx.createRadialGradient(x1,y1,r1,x2,y2,r2);

    let c = color;
    gradient.addColorStop(0, "rgba("+c.r*255+", "+c.g*255+", "+c.b*255+", 1.0)");
    gradient.addColorStop(1, "rgba("+c.r*255+", "+c.g*255+", "+c.b*255+", 0.0)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  //these two are unused
  randomCircle(x, y, rad, c) {
    this.ctx.fillStyle = "rgba("+c.r*255+", "+c.g*255+", "+c.b*255+", 0.5)";
    // this.ctx.lineWidth = 1;

    this.ctx.beginPath();
    this.ctx.arc(x, y, rad, 0, 2*Math.PI);
    this.ctx.fill();
  }

  blackWhiteGradient() {
    let x1 = 0;
    let y1 = 0;
    let x2 = this.width;
    let y2 = this.height;

    let gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);


    gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 1.0)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  toCanvasColor(c) {
    return "rgba("+Math.round(c.r*255)+", "+Math.round(c.g*255)+", "+Math.round(c.b*255)+", 1.0)";
  }

  mix(v1, v2, amount) {
    let dist = v2 - v1;
    return v1 + (dist * amount);
  }

}

export default Biome;
