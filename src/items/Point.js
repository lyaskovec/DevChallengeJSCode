class Point extends V {
  constructor(...args) {
    super(...args);
    this.lines = [];
    this.next = {x: 0, y: 0};
  }
  draw(){
    ctx.beginPath();
    ctx.arc(this.p.x, this.p.y, 4, 0, 2 * Math.PI);
    ctx.fill();
  }

  upd(time) {
    this.v.y += gY * time;
    this.v.x += gX * time;
    this.draw2(time)
  }

  draw2(time) {



    let start = Date.now();

    this.next.x = this.p.x + this.v.x * time;
    this.next.y = this.p.y + this.v.y * time;
    this.v.y += gY * time;
    this.v.x += gX * time;
    this.update();

    if (this.collisions(time)) return;

    logg({'Time delay': Date.now() - start});

    this.p.x = this.next.x;
    this.p.y = this.next.y;
    let {x, y} = this.p;
    logg({x: this.p.x, y: this.p.y, v: this.l});
    ctx.fillStyle = this.isCollision ? 'red' : 'blue';
    ctx.strokeStyle = 'blue'
    ctx.beginPath();
    ctx.arc(this.p.x, this.p.y, 1, 0, 2 * Math.PI);
    ctx.stroke();
    this.draw()
  }

  collisions(time) {
    let {p, v, next} = this;
    let collisions = this.lines.map(line => ({
      res: checkCollision(p.x, p.y, next.x, next.y, line.p1.x, line.p1.y, line.p2.x, line.p2.y),
      line
    })).filter(item => item.res);

    collisions.sort((a, b)=> a.res.len - b.res.len);
    this.isCollision = !!collisions.length

    if (collisions.length) {
      let p = collisions[0].res;
      let res = collisions[0].res
      //let len = collisions[0].res.len;
      let l = collisions[0].line;
      l.isCollision = true

      console.timeEnd('collision')
      pause();


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
      this.len(this.l * 0.6);
      if (Number.isNaN(ang)) {
        debugger
      }
    }
    this.isCollision = !!collisions.length;
    return collisions.length
  }
}
