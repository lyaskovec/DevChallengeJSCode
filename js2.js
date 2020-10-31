let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let padding = 20;
let width = 500;
let height = 500;
let gY = -250 + Math.random() * 500
let gX = -250 + Math.random() * 500
gX = 0
gY = 100
Object.assign(canvas, {width: width + 2* padding, height: height + 2 * padding, style: `width: ${width + 2 * padding}px; height: ${height + 2 * padding}px`});

document.body.addEventListener('click', ()=> {
  gY = -gY
})

let stop = false

// document.body.onclick = ()=> stop = true

let logs = {};
let log = new Proxy({}, {
  set(obj, key, value) {
    if (obj[key] === value || key === 'extend') return false;
    obj[key] = value;
    if (!logs[key]) {
      let el = crEl('div', {innerHTML: `<b>${key}: <span></span></b>`})
      let span = el.querySelector('span');
      logs[key] = span
      ge('logs').append(el)
    }
    logs[key].innerHTML = value

    return true
  },
  get() {
  }
});

function crEl(type, params = {}) {
  let element = document.createElement(type);
  Object.assign(element, params);
  return element
}

function ge(id) {return document.getElementById(id)}

logg = (params = {}) => {
  Object.keys(params).forEach(key => log[key] = params[key])
};

function len(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2), Math.pow(a.y - b.y, 2))
}

class V {
  constructor(x, y, vx = 0, vy = 0) {
    this.p = {x, y};
    this.v = {x: vx, y: vy};
    this.update();
  }
  update() {
    this.l = Math.sqrt(Math.pow(this.v.x, 2) + Math.pow(this.v.y, 2));
    this.n = {x: this.v.x / this.l, y: this.v.y / this.l};
    return this;
  }
  getAngle(vector2){
    let vector1 = this.n;
    return (Math.atan2(vector2.y, vector2.x) - Math.atan2(vector1.y, vector1.x))* 180 / Math.PI;
  }
  draw(color = 'blue'){
    let {p, v, n, l} = this;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.arc(p.x - 1, p.y - 1, 2, 0, 2 * Math.PI);
    ctx.fill()
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + n.x * l, p.y + n.y * l);
    ctx.stroke();
    return this;
  }
  rotate(ang) {
    ang = ang * (Math.PI / 180);
    let {v} = this;
    let cos = Math.cos(ang);
    let sin = Math.sin(ang);
    this.v = {x: Math.round(10000 * (v.x * cos - v.y * sin)) / 10000, y: Math.round(10000 * (v.x * sin + v.y * cos)) / 10000};
    return this.update()
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
    this.v = {x: n.x * length, y: n.y * length};
    this.update();
    return this;
  }

}



V.line = function (p1, p2) {
  return new V(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y)
};

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


class Grid {
  constructor() {

  }
  draw(){
    ctx.save();
    ctx.translate(-ctx.xx, -ctx.yy);
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.rect( 5, 5, 1, 500); // left
    ctx.rect( 5, 505, 500, 1); // bottom
    ctx.stroke();
    for (let i = 0; i < 10; i++) {
      ctx.rect(0, i * 50 + 10, 5, 1);
      ctx.rect(0, i * 50 + 10, 5, 1);
      ctx.fill()
    }
    ctx.restore();
  }
}


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
  getLength() {

  },
  draw(){
    ctx.beginPath();
    ctx.strokeStyle = this.isCollision ? 'red' : 'black';
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.stroke();
  },
  checkLine(){},
  upd(){
    this.draw()
  }
};

let point = new Point(200, 200, 200, 200);
ctx.beginPath();
ctx.strokeStyle = 'red';
ctx.fillStyle = 'red';
ctx.arc(200 - 2, 200 - 2, 4, 0, 2 * Math.PI);
ctx.fill()

let items = [point];
for(let i = 0; i < 3; i++) {
  // items.push(new Line(Math.random() * 100, Math.random() * 100, Math.random() * 500, Math.random() * 500))
}

// items.push(new Line(500, 50, 0, 50));
// items.push(new Line(0, 500, 50, 0)); // left
// items.push(new Line(500, 500, 0, 450)); // bottom
// items.push(new Line(500, 0, 500, 500)); // right
items.push(new Grid())

let time = Date.now();

let points = items.filter(item => item instanceof Point);
let lines = items.filter(item => item instanceof Line);


points.forEach(point => point.lines = lines);

let zoom = {
  scale: 1,
  x: 0,
  y: 0,
  gridW: 360,
  gridH: 360
};

function draw() {
  let current = Date.now();
  let delta = current - time;
  time = current;
  ctx.save();
  ctx.clearRect(0, 0, 600, 600);
  items.forEach(item => item.upd && item.upd(delta / 2550));
  ctx.scale(zoom.scale, zoom.scale);
  let {x, y} = point.p;
  let xx = 0;
  let yy = 0;
  if (x > 400) xx = -x + 200;
  if (y > 400) yy = -y + 200;
  ctx.xx = xx;
  ctx.yy = yy;
  canvas.style.backgroundPosition = `${parseInt(xx) % zoom.gridW}px ${parseInt(yy) % zoom.gridH}px `
  logg({xx, yy})
  ctx.translate(xx, yy);
  items.forEach(item => item.draw && item.draw());
  ctx.restore();

  stop  || requestAnimationFrame(draw);
}

requestAnimationFrame(draw);


function checkCollision(x1, y1, x2, y2, x3, y3, x4, y4){
  //нахождение координат векторов
  let xv12 = x2 - x1;
  let xv13 = x3 - x1;
  let xv14 = x4 - x1;
  let yv12 = y2 - y1;
  let yv13 = y3 - y1;
  let yv14 = y4 - y1;

  let xv31 = x1 - x3;
  let xv32 = x2 - x3;
  let xv34 = x4 - x3;
  let yv31 = y1 - y3;
  let yv32 = y2 - y3;
  let yv34 = y4 - y3;

  // векторные произведения

  let v1 = xv34 * yv31 - yv34 * xv31;
  let v2 = xv34 * yv32 - yv34 * xv32;
  let v3 = xv12 * yv13 - yv12 * xv13;
  let v4 = xv12 * yv14 - yv12 * xv14;

  if((v1 * v2) < 0 && (v3 * v4) < 0){
    let A1 = y2 - y1;
    let A2 = y4 - y3;
    let B1 = x1 - x2;
    let B2 = x3 - x4;
    let C1 = (x1 * (y1 - y2) + y1 * (x2 - x1)) * (-1);
    let C2 = (x3 * (y3 - y4) + y3 * (x4 - x3)) * (-1);


    let  D = ((A1 * B2) - (B1 * A2));
    let  Dx = ((C1 * B2) - (B1 * C2));
    let  Dy = ((A1 * C2) - (C1 * A2));

    if(D !== 0){
      let x = parseInt(Dx / D);
      let y = parseInt(Dy / D);
      return {x, y, len: len({x: x1, y: y1}, {x, y})};
    }
  }
  else false
}

let grid = document.getElementById('grid');
let ccc = crEl('canvas', {style: 'position: absolute; left: -100000; top: -10000px'});
document.body.appendChild(ccc);

grid.oninput = () => {
  let size = grid.value;
  Object.assign(ccc, {width: size, height: size, style: `width: ${size}px; height: ${size}px`});
  let ctx = ccc.getContext('2d');
  // ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = 'red';
  ctx.strokeStyle = 'red';
  ctx.rect(0, 0, size, 1);
  ctx.rect(0, 0, 1, size);
  ctx.fill()
  let img = ccc.toDataURL();
  console.log(img)
  canvas.style.backgroundImage = `url(${img})`;

};
