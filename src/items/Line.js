
function Line(x, y, x2, y2) {
  this.p1 = {x: (x), y: (y)};
  this.p2 = {x: (x2), y:(y2)};
  this.isCollision = false;
  this.vec = {};
  this.vnorm = {};
  this.vec.x = this.p2.x - this.p1.x;
  this.vec.y = this.p2.y - this.p1.y;
  this.len = Math.sqrt(this.vec.x * this.vec.x + this.vec.y * this.vec.y);
  this.vnorm.x = this.vec.x / this.len;
  this.vnorm.y = this.vec.y / this.len;
}

Line.prototype = {
  draw(){
    ctx.beginPath();
    ctx.strokeStyle = this.isCollision ? 'red' : 'black';
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.stroke();
  }
};
