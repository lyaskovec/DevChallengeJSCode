let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let padding = 20;
let width = 500;
let heigth = 500;
let gY = 50;
let gX = 0;
Object.assign(canvas, {width: width + 2* padding, height: heigth + 2 * padding, style: `width: ${width + 2 * padding}px; height: ${heigth + 2 * padding}px`});

document.addEventListener('click', ()=> {
  gY = -gY
})



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

function Point(x, y) {
  this.isCollision = false;
  this.p = {x, y};
  this.v = {x: 50, y: 50};
  this.lines = []
}

Point.prototype = {
  setSpeed(dx, dy) {
  },
  stop() {
    this.v = {x: 50, y: 50};
  },
  draw(time) {

    this.v.y += gY * time;
    this.v.x += gX * time;

    let start = Date.now()
    this.collisions(time);
    logg({time: Date.now() - start})

    let {x, y} = this.p;
    this.p.y += this.v.y * time;
    this.p.x += this.v.x * time;
    logg({x: this.p.x, y: this.p.y});
    ctx.fillStyle = this.isCollision ? 'red' : 'black';
    ctx.fillRect(this.p.x - 5, this.p.y - 5, 10, 10);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(this.p.x + 10, this.p.y + 10);
    ctx.stroke()
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
    this.isCollision = this.lines.map(line => {
      let res = checkCollision(Math.round(this.p.x), Math.round(this.p.y), Math.round(this.p.x + this.v.x * time), Math.round(this.p.y + this.v.y * time), line.p1.x, line.p1.y, line.p2.x, line.p2.y)
      // line.isCollision = !!res
      if (res) {
        line.isCollision = true
        console.log(res, this.p, this.v, line.p1, line.p2)

      }
      return res;
    }).filter(item => item).length
    // console.log('lines: ', this.isCollision)
  }
};

function Line(x, y, x2, y2) {
  this.p1 = {x: Math.round(x), y: Math.round(y)};
  this.p2 = {x: Math.round(x2), y: Math.round(y2)};
  this.isCollision = false
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


let point = new Point(0, 0);

let items = [point, new Line(100, 0, 50, 200), new Line(150, 100, 100, 400), new Line(0, 200, 400, 200), new Line(10, 500, 500, 500)];
for(let i = 0; i < 10; i++) {
  items.push(new Line(Math.random() * 100, Math.random() * 100, Math.random() * 500, Math.random() * 500))
}


let time = Date.now();

let points = items.filter(item => item instanceof Point);
let lines = items.filter(item => item instanceof Line);

points.forEach(point => point.lines = lines);

function draw() {
  let current = Date.now();
  let delta = current - time
  time = current;
  ctx.clearRect(0, 0, 600, 600);


  items.forEach(item => item.draw(delta / 250));
  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);


function checkCollision(x1, y1, x2, y2, x3, y3, x4, y4){
  //нахождение координат векторов
  var xv12 = x2 - x1;
  var xv13 = x3 - x1;
  var xv14 = x4 - x1;
  var yv12 = y2 - y1;
  var yv13 = y3 - y1;
  var yv14 = y4 - y1;

  var xv31 = x1 - x3;
  var xv32 = x2 - x3;
  var xv34 = x4 - x3;
  var yv31 = y1 - y3;
  var yv32 = y2 - y3;
  var yv34 = y4 - y3;

  // векторные произведения

  var v1 = xv34 * yv31 - yv34 * xv31;
  var v2 = xv34 * yv32 - yv34 * xv32;
  var v3 = xv12 * yv13 - yv12 * xv13;
  var v4 = xv12 * yv14 - yv12 * xv14;

  if((v1 * v2) < 0 && (v3 * v4) < 0){
    var A1 = y2 - y1;
    var A2 = y4 - y3;
    var B1 = x1 - x2;
    var B2 = x3 - x4;
    var C1 = (x1 * (y1 - y2) + y1 * (x2 - x1)) * (-1);
    var C2 = (x3 * (y3 - y4) + y3 * (x4 - x3)) * (-1);


    var  D = ((A1 * B2) - (B1 * A2));
    var  Dx = ((C1 * B2) - (B1 * C2));
    var  Dy = ((A1 * C2) - (C1 * A2));

    if(D !== 0){
      var x = parseInt(Dx / D);
      var y = parseInt(Dy / D);
      return {x, y};
    }
  }
  else false
}

console.log(checkCollision(37, 235,63,22,184,120,34,87))