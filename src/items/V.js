class V {
  constructor(x, y, vx = 0, vy = 0) {
    this.p = {x, y};
    this.v = {x: vx, y: vy};
    this.update();
  }
  update(params) {
    Object.assign(this, params);
    this.l = Math.sqrt(Math.pow(this.v.x, 2) + Math.pow(this.v.y, 2));
    this.n = {x: this.v.x / this.l, y: this.v.y / this.l};
    return this;
  }
  getAngle(vector2){
    let vector1 = this.n;
    return (Math.atan2(vector2.y, vector2.x) - Math.atan2(vector1.y, vector1.x))* 180 / Math.PI;
  }
  draw(){

  }

  rotate(ang) {
    ang = ang * (Math.PI / 180);
    let {v} = this;
    let cos = Math.cos(ang);
    let sin = Math.sin(ang);
    return this.update({
      v: {
        x: Math.round(10000 * (v.x * cos - v.y * sin)) / 10000,
        y: Math.round(10000 * (v.x * sin + v.y * cos)) / 10000
      }
    })
  }
  clone(){
    let {p, v} = this;
    let copy = new V(p.x, p.y, v.x, v.y);
    copy.update();
    return copy;
  }
  go(x, y){
    this.p.x = x
    this.p.y = y
  }
  move(x = 0, y = 0){
    this.p.x += x;
    this.p.y += y;
    return this
  }
  len(length) {
    let {n} = this;
    this.update({v: {x: n.x * length, y: n.y * length}});
    return this;
  }

}

V.line = function (p1, p2) {
  return new V(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y)
};