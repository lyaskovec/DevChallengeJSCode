let canvas = ge('canvas');
let ctx = canvas.getContext('2d');

let padding = 0;
let width = 500;
let height = 500;
let gY = -250 + Math.random() * 500;
let gX = -250 + Math.random() * 500;
gX = 0;
gY = 9.8 * 100;
Object.assign(canvas, {width: width + 2* padding, height: height + 2 * padding});


let stop = true;

function len(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2), Math.pow(a.y - b.y, 2))
}

console.time('collision')


let point = new Point(300, 100, 0, 250);
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
// Підлога
items.push(new Line(-100000, 470, 500000, 480));

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
  ctx.clearRect(0, 0, width, 500);
  items.forEach(item => item.upd && item.upd(delta / 1000));
  ctx.scale(zoom.scale, zoom.scale);
  let {x, y} = point.p;
  let xx = 0;
  let yy = 0;
  // if (x > 400) xx = -x + 200;
  // if (y > 400) yy = -y + 200;
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



//
// let grid = ge('grid');
// let ccc = crEl('canvas', {style: 'position: absolute; left: -100000; top: -10000px'});
// document.body.appendChild(ccc);
//
// grid.oninput = () => {
//   let size = grid.value;
//   let img = createGridImage(size, 'silver');
//   canvas.style.backgroundImage = `url(${img})`;
// };


function pause() {
  stop = !stop;
  if (!stop) {
    time = Date.now();
    draw();
  }
}

document.body.addEventListener('keydown', ({keyCode}) => {
  keyCode === 32 && pause();
});

{

  let drop = document.querySelector('.drop');
  let line = drop.parentElement;
  let point = line.parentElement;
  let start = false;

  let hVector = new V(200, 200, 100, 0);
  let mVector = new V(200, 200, 0, 0);

  drop.addEventListener('mousedown', (evt) => {
    let {pageX, pageY} = evt;
    start = {pageX, pageY, x: mVector.v.x, y: mVector.v.y};
    evt.preventDefault()
  });

  document.addEventListener('mousemove', ({pageX, pageY}) => {
    if (start) {
      let dy = pageY - start.pageY;
      let dx = pageX - start.pageX;
      mVector.v = {x: start.x + dx, y: start.y + dy};
      mVector.update();

      let angle = mVector.getAngle(hVector.n);
      if (angle < 0) {
        angle = 360 + angle
      }

      params.angle = angle;
      params.speed = Math.min(mVector.l, 300);

      console.log(params.angle)


    }
  });

  document.addEventListener('mouseup', ({pageY}) => {
    if (start) {
      start = false
    }
  });
}

document.addEventListener('click', (evt) => {
  let {target} = evt;
  if (target.classList.contains('ui-group__title')) {
    target.classList.toggle('hide')
  }
});

const updateSize = window.onresize = ()=> {
  width = canvas.width = canvas.clientWidth
};

updateSize();

let poligon = new Poligon();
items.push(poligon);

{
  let start = false;
  let fun = false;

  function result({pageX, pageY, type}){
    fun && fun({dy: pageY - start.pageY, dx: pageX - start.pageX, type})
  }

  document.addEventListener('mousemove', (evt) => {
    if (start) {
      result(evt)
    }
  });

  document.addEventListener('mouseup', (evt) => {
    if (start) {
      result(evt);
      start = false;
    }
  });

  function startDrag(evt, callback){
    let {pageX, pageY} = evt;
    start = {pageX, pageY};
    fun = callback;
    evt.preventDefault()
  }
  window.startDrag = startDrag;
}

let polygons = ge('polygons');
polygons.addEventListener('mousedown', evt => {
  let {target} = evt;
  if (target.tagName === 'SPAN') {
    let {index} = target;
    let start = {...poligon.items[index]};
    startDrag(evt, ({dx, dy})=> {
      let x = poligon.items[index].x = start.x + dx;
      let y = poligon.items[index].y = start.y + dy;
      target.style = `top: ${y}px; left: ${x}px`
    })
  }
});

canvas.addEventListener('click', (evt) => {
  let pos = getMousePosOnElement(evt);
  let k = {x: pos.left, y: pos.top};
  let index = poligon.push(k);
  let point = crEl('span', {style: `top: ${pos.top}px; left: ${pos.left}px`, index});
  ge('polygons').appendChild(point);
});

document.addEventListener('keyup', ({keyCode}) => {
  //  Enter
  if (keyCode === 13) {}
  // Escape
  if (keyCode === 27) {}
  // Delete
  if (keyCode === 46) {}
});

canvas.addEventListener('mousemove', evt => {
  let {target} = evt;
  if (target === canvas) {
    ctx.pos = getMousePosOnElement(evt)
  } else {
    ctx.pos = false
  }
});

{
  let drop = document.querySelector('.drop');
  let line = drop.parentElement;
  let point = line.parentElement;
  app.on('set.speed', (length) => line.style.height = length + 'px');
  app.on('set.angle', (angle) => point.style.transform = `rotate(${180 - angle - 90}deg)`);
}

