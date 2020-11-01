class Point extends V {
  constructor(...args) {
    super(...args);
    this.lines = [];
    this.paused = true;
    this.next = {x: 0, y: 0};
    this.way = 0;
    this.xWay = 0
    this.yWay = 0
  }
  draw(){
    let {p, n} = this;
    let {paused} = app;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
    if (!paused) {
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + 25 * n.x, p.y + 25 * n.y);
    }
    ctx.stroke();
    ctx.fill();
  }

  upd(time) {
    let {paused, gravity} = app;
    if (!paused) {
      this.v.y += gravity * time;
      this.draw2(time)
    }
  }

  draw2(time) {

    this.next.x = this.p.x + this.v.x * time;
    this.next.y = this.p.y + this.v.y * time;
    this.way += len(this.p, this.next)
    this.xWay += len(this.p, this.next) * Math.abs(this.n.x);
    this.yWay += len(this.p, this.next) * Math.abs(this.n.y);

    if (!this.collisions(time)) {
      this.update({p: {x: this.next.x, y: this.next.y}});
    }

    let {x, y} = this.p;
    app.paused || logg({
      x: this.p.x,
      y: this.p.y,
      'Current speed': this.l,
      'Total way': this.way,
      'Total way on X': this.xWay,
      'Total way on Y': this.yWay
    });
    this.draw()
  }

  collisions() {
    let {p, v, next} = this;
    this.lines = items.filter(item => item instanceof Line);
    let collisions = this.lines.map(line => ({
      res: checkCollision(p.x, p.y, next.x, next.y, line.p1.x, line.p1.y, line.p2.x, line.p2.y),
      line
    })).filter(item => item.res);

    collisions.sort((a, b)=> a.res.len - b.res.len);
    this.isCollision = !!collisions.length;

    if (collisions.length) {
      let p = collisions[0].res;
      let l = collisions[0].line;
      l.isCollision = true;

      let h = V.line(p, this.p);
      let perpend = V.line(p, l.p2);

      perpend.rotate(90);
      perpend.draw();

      h.draw('red');

      let ang = h.getAngle(perpend.n);
      if (isNaN(ang)) {
        ang = 90;

      }

      logg({'Current speed': this.l})

      if (this.l < 1) {
        point.update({v: {x: 250, y: -250}})
        app.stop('finish');
        return true;
      }

      let newV = h.clone().rotate(2 * ang + 0.1).len(len(p, this.next));
      let newVV = newV.clone().len(this.l);

      this.next.x = newV.p.x + newV.v.x;
      this.next.y = newV.p.y + newV.v.y;

      this.update({v: newVV.v});
      this.len(this.l * (1 - app.attenuation));
      this.collisions();
      return true
    }
    return collisions.length
  }
}
