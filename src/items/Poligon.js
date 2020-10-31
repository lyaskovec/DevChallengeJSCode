let lineDashOffset = 0;
setInterval(()=> {
  lineDashOffset+=2
  // if (lineDashOffset > 10) lineDashOffset = 0
}, 100)

class Poligon {
  constructor() {
    this.items = [];
  }
  draw() {
    if (!this.items.length) return;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,0,0,0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineDashOffset = lineDashOffset;
    ctx.moveTo(this.items.x, this.items.y);
    this.items.forEach(({x, y}, index) => ctx.lineTo(x, y));
    ctx.closePath();
    if (ctx.pos && ctx.isPointInPath(ctx.pos.left, ctx.pos.top)) {
      ctx.fillStyle = 'rgba(255,0,0,0.5)';
    }

    ctx.stroke();
    ctx.fill();
  }
  push(p) {
    this.items.push(p);
    return this.items.length - 1
  }
}