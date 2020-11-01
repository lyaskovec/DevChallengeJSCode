class Poligon {
  constructor() {
    this.obstacle = true
    this.items = [];
  }

  draw() {
    if (!this.items.length) return;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,0,0,0.3)';
    ctx.moveTo(this.items.x, this.items.y);
    this.items.forEach(({x, y}, index) => ctx.lineTo(x, y));
    ctx.closePath();
    ctx.fill();
  }

  createLines() {
    let list = Array.from(this.items);
    let first = list[0];
    list.push(first);
    list.forEach(item => {
      let line = new Line(first.x, first.y, item.x, item.y);
      line.obstacle = true;
      items.push(line);
      first = item
    })
  }

  push(p) {
    this.items.push(p);
    return this.items.length - 1
  }
}

Poligon.fromArray = (array) => {
  let instance = new Poligon();
  array.forEach(([x, y]) => instance.push({x, y}));
  instance.createLines();
  items.push(instance);
  return instance;
};