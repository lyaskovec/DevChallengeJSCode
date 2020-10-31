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

function len(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2), Math.pow(a.y - b.y, 2))
}




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
