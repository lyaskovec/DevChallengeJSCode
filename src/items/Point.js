class Point extends V {
  constructor(...args) {
    super(...args);
    this.lines = [];
    this.paused = true;
    this.next = {x: 0, y: 0};
  }
  draw(){
    let {p, n} = this;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 25 * n.x, p.y + 25 * n.y);
    ctx.stroke();
    ctx.fill();
  }

  upd(time) {
    if (!this.paused) {
      let {gravity} = params;
      this.v.y += gravity * time;
      this.draw2(time)
    }
  }

  draw2(time) {

    this.next.x = this.p.x + this.v.x * time;
    this.next.y = this.p.y + this.v.y * time;

    if (this.collisions(time)) return;

    this.update({p: {x: this.next.x, y: this.next.y}});

    let {x, y} = this.p;
    logg({x: this.p.x, y: this.p.y, v: this.l});
    this.draw()
  }

  collisions(time) {
    let {p, v, next} = this;
    let collisions = this.lines.map(line => ({
      res: checkCollision(p.x, p.y, next.x, next.y, line.p1.x, line.p1.y, line.p2.x, line.p2.y),
      line
    })).filter(item => item.res);

    collisions.sort((a, b)=> a.res.len - b.res.len);
    this.isCollision = !!collisions.length;

    if (collisions.length) {
      let p = collisions[0].res;
      let res = collisions[0].res;
      //let len = collisions[0].res.len;
      let l = collisions[0].line;
      l.isCollision = true;

      // console.timeEnd('collision')
      // pause();


      let h = V.line(p, this.p);
      let perpend = V.line(p, l.p2);

      perpend.rotate(90.1)
      perpend.draw();

      h.draw('red');

      let ang = h.getAngle(perpend.n);

      this.draw('black')

      let newV = h.clone().rotate(2 * ang).len(len(p, this.next)).draw('red');
      let newVV = newV.clone().len(this.l).move(0, 5).draw('blue')


      this.next.x = newV.p.x + newV.v.x;
      this.next.y = newV.p.y + newV.v.y;
      this.v.x = newVV.v.x;
      this.v.y = newVV.v.y;
      this.update();
      this.len(this.l * (1 - params.attenuation));
      if (Number.isNaN(ang)) {
        debugger
      }
    }
    this.isCollision = !!collisions.length;
    return collisions.length
  }
}
