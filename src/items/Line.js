function Line(x, y, x2, y2) {
  this.p1 = {x: (x), y: (y)};
  this.p2 = {x: (x2), y: (y2)};
  this.update();
}

Line.prototype = {
  update(params) {
    Object.assign(this, params);
    let {p1, p2} = this;
    let v = this.v = {x: p2.x - p1.x, y: p2.y - p1.y};
    this.l = Math.sqrt(v.x * v.x + v.y * v.y);
    this.n = {x: v.x / this.l, y: v.y / this.l}
  },
  draw() {
    ctx.beginPath();
    ctx.strokeStyle = this.isCollision ? 'red' : 'black';
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.stroke();
  }
};
