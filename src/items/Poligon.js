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
  items.push(instance);
  instance.createLines();
  return instance;
};

function createStartItems(cX, cY, n = 5, r = 100) {
  let items = [[cX + r, cY]]
  //star draw
  for (let i = 1; i <= n * 2; i++) {
    let x, y, theta;
    if (i % 2 === 0) {
      theta = i * (Math.PI * 2) / (n * 2);
      x = cX + (r * Math.cos(theta));
      y = cY + (r * Math.sin(theta));
    } else {
      theta = i * (Math.PI * 2) / (n * 2);
      x = cX + ((r / 2) * Math.cos(theta));
      y = cY + ((r / 2) * Math.sin(theta));
    }
    items.push([x, y]);
  }
  return items;
}