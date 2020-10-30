let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let padding = 20;
let width = 500;
let heigth = 500;
let gY = 250
let gX = -10
Object.assign(canvas, {width: width + 2* padding, height: heigth + 2 * padding, style: `width: ${width + 2 * padding}px; height: ${heigth + 2 * padding}px`});

document.addEventListener('click', ()=> {
  gY = -gY
})

let stop = false

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

function getAngle(v1, v2) {
  let dot = v1.x * v2.x + v1.y * v2.y;
  let cross = v1.x * v2.y - v1.y * v2.x;
  return Math.atan2(cross, dot);
}


function crEl(type, params = {}) {
  let element = document.createElement(type);
  Object.assign(element, params);
  return element
}

function ge(id) {return document.getElementById(id)}

logg = (params = {}) => {
  Object.keys(params).forEach(key => log[key] = params[key])
};

function Point(x, y) {
  this.isCollision = false;
  this.p = {x, y};
  this.v = {x: 200 + Math.random() * 100, y: Math.random() * 100 + 200};
  this.lines = []
}

function len(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2), Math.pow(a.y - b.y, 2))
}

function V(x, y, vx = 0, vy = 0) {
  this.p = {x, y};
  this.v = {x: vx, y: vy};
  this.update();
}

V.prototype = {
  update() {
    let {v} = this;
    this.l = Math.sqrt(Math.pow(v.x, 2), Math.pow(v.y, 2));
    this.n = {x: v.x / this.l, y: v.y / this.l};
  },
  getAngle(vector){
    let dot = this.v.x * vector.v.x + this.v.y * vector.v.y;
    let cross = this.v.x + vector.v.y - this.v.y * vector.v.x
    return Math.atan2(cross, dot);
  },
  draw(color = 'blue'){
    let {p, v, n, l} = this;
    console.log({p, v, n})
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + n.x * l, p.y + n.y * l);
    ctx.stroke();
  },
  rotate(ang) {
    ang = ang * (Math.PI / 180);
    let {v} = this;
    let cos = Math.cos(ang);
    let sin = Math.sin(ang);
    console.log('V: ', v.x, v.y)
    let [x, y] = new Array(Math.round(10000 * (v.x * cos - v.y * sin)) / 10000, Math.round(10000 * (v.x * sin + v.y * cos)) / 10000);
    console.log('VV: ', x, y)
    this.v = {x: Math.round(10000 * (v.x * cos - v.y * sin)) / 10000, y: Math.round(10000 * (v.x * sin + v.y * cos)) / 10000};
    this.update()
  },
  clone(){
    let {p, v} = this;
    let copy = new V(p.x, p.y, v.x, v.y);
    copy.update();
    return copy;
  },
  move(x = 0, y = 0){
    this.p.x += x;
    this.p.y += y;
  }
};


function rotateVector(vec, ang) {
  ang = -ang * (Math.PI / 180);
  let cos = Math.cos(ang);
  let sin = Math.sin(ang);
  return new Array(Math.round(10000 * (vec[0] * cos - vec[1] * sin)) / 10000, Math.round(10000 * (vec[0] * sin + vec[1] * cos)) / 10000);
};



{
  let v = new V(50, 50, 100, 100)
  let v2 = new V(50, 10, 205, 105)
  v.draw('green');
  v2.draw();
  // v.move(0, 50)
  for(let i = 0; i < 4; i++) {
    v.rotate(-20);
    v.draw('red');
  }
}


Point.prototype = {
  draw(time) {

    this.v.y += gY * time;
    this.v.x += gX * time;

    let start = Date.now()
    this.collisions(time);
    logg({ttt: Date.now() - start})

    let {x, y} = this.p;
    this.p.y += this.v.y * time;
    this.p.x += this.v.x * time;
    logg({x: this.p.x, y: this.p.y});
    ctx.fillStyle = this.isCollision ? 'red' : 'blue';
    ctx.strokeStyle = 'blue'
    // ctx.fillRect(this.p.x - 5, this.p.y - 5, 10, 10);
    ctx.beginPath();
    ctx.arc(this.p.x, this.p.y, 1, 0, 2 * Math.PI);
    ctx.stroke();
    // ctx.moveTo(x, y);
    // ctx.lineTo(this.p.x + 10, this.p.y + 10);
    // ctx.stroke()
    logg({
      speed: Math.sqrt(Math.pow(this.v.x, 2) + Math.pow(this.v.y, 2)),
      x: this.p.x,
      y: this.p.y,
      vx: this.v.x,
      vy: this.v.y,
      time: time
    })
  },
  collisions(time) {
    let collisions = this
      .lines
      .map(line => {
        let res = checkCollision(this.p.x, this.p.y, this.p.x + this.v.x * time, this.p.y + this.v.y * time, line.p1.x, line.p1.y, line.p2.x, line.p2.y)
        if (res) {
          line.isCollision = true
          stop = true
        }
        return {res, line}
      }).filter(item => item.res);

    collisions.sort((a, b)=> a.res.len - b.res.len);
    if (collisions.length) {

      let p = collisions[0].res;
      let len = collisions[0].res.len;
      let l = collisions[0].line;
      let {vnorm} = l;

      let p1 = new V(p.x, p.y, vnorm.y * 100, -vnorm.x * 100);
      let p2 = new V(p.x, p.y, this.p.x, this.p.y);
      let angle = getAngle(p2.n, p1.n) * 180 / Math.PI
      if (angle < 0) {
        angle += 180
      } else {
        angle -= 180
      }



      let newV = rotateVector([this.v.x, this.v.y], 90);
      let nnn = new V(p.x, p.y, newV[0], newV[1]);

      dv({x: p.x, y: p.y}, {x: newV[0], y: newV[1]})


      console.log('newV => ', newV)


      console.log('Angle: ', angle)

      // dv(p, {x: (p1.normalize.x + p2.normalize.x)/ 2 + 100 / 2, y: (p1.normalize.y + p2.normalize.y) / 2 +100 }, 'green');

      // var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
      var angleDeg = Math.atan2(p2.n.y - p1.n.y, p2.n.x - p1.n.x) * 180 / Math.PI;
      logg({aaaa: angle})

      dline(this.p, p)
      // dline({...p, y: p.y - 50}, {x: p.x + vnorm.x * 100, y: p.y + vnorm.y * 100}, 'blue')
      dv({...p}, {x: vnorm.y * 100, y: -vnorm.x * 100}, 'blue')
      dv({...p}, {x: -vnorm.y * 100, y: vnorm.x * 100}, 'red')
    }
    this.isCollision = !!collisions.length
  }
};

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
    ctx.strokeStyle = this.isCollision ? 'red' : 'black'
    ctx.moveTo(this.p1.x, this.p1.y);
    ctx.lineTo(this.p2.x, this.p2.y);
    ctx.stroke();
  },
  checkLine(){}
};

function dline(p1, p2, color = 'black'){

  ctx.beginPath();
  ctx.strokeStyle = color
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke()
}

function dv(p1, p2, color = 'black'){

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p1.x + p2.x, p1.y + p2.y);
  ctx.stroke()
}


let point = new Point(0, 0);

let items = [point];
for(let i = 0; i < 2000; i++) {
  // items.push(new Line(Math.random() * 100, Math.random() * 100, Math.random() * 500, Math.random() * 500))
}

items.push(new Line(0, 0, 500, 0));
items.push(new Line(0, 0, 0, 500));
items.push(new Line(0, Math.random() * 500, 500, Math.random() * 500));
items.push(new Line(500, 0, 500, 500));


let time = Date.now();

let points = items.filter(item => item instanceof Point);
let lines = items.filter(item => item instanceof Line);

points.forEach(point => point.lines = lines);

function draw() {
  let current = Date.now();
  let delta = current - time;
  time = current;
  // ctx.clearRect(0, 0, 600, 600);


  items.forEach(item => item.draw(delta / 100));

  // ctx.beginPath();
  // ctx.strokeStyle = 'blue';
  //
  // ctx.stroke();

  stop || requestAnimationFrame(draw);
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

console.log(checkCollision(37, 235,63,22,184,120,34,87))