console.time('init');

CanvasRenderingContext2D.prototype.rotatePoint = function (angle = 0, x = 0, y = 0) {
  this.translate(x, y);
  this.rotate(angle);
  this.translate(-x, -y);
};

function radians_to_degrees(radians){
  return radians * (180/Math.PI);
}

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

logg = (params = {}) => {
  Object.keys(params).forEach(key => log[key] = params[key])
}

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let padding = 20;
let width = 500;
let heigth = 500;
Object.assign(canvas, {width: width + 2* padding, height: heigth + 2 * padding, style: `width: ${width + 2 * padding}px; height: ${heigth + 2 * padding}px`});

ctx.scale(1, -1);
ctx.translate(padding, -500 - padding);

ctx.fillStyle = 'red';
ctx.strokeStyle = 'blue';


// ctx.save();
// ctx.lineWidth = 1.5;
// ctx.moveTo(0, 0);
// // ctx.lineTo(100, 200);
// ctx.stroke();
// ctx.restore();


const params = {
  speed: 100,
  g: -9.8,
  d: 10,
  angle: 45,
  timeSpeed: 3,
  greedSize: 50,
};

let controls = document.getElementById('controls');
let els = {}
Object.keys(params).forEach(key => {
  let el = Object.assign(document.createElement('div'), {
    innerHTML: `<b>${key}</b><div><input type="number"></div>`
  });
  let input = el.querySelector('input');
  els[key] = input
  input.addEventListener('input', () => {
    params[key] = +input.value;
    draw()
  });
  input.value = params[key];
  controls.appendChild(el)
});

function clear() {
  ctx.clearRect(-padding, -padding, width + padding, heigth + padding )
}

function round(n, d = 1) {
  return Math.round(n * d) / d
}

function grid() {
  ctx.save();

  ctx.strokeStyle = 'black';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5, 5, 5, 5, 5, 5, 5, 500]);

  // top
  ctx.beginPath();
  ctx.moveTo(0.5, 0.5);
  ctx.lineTo(0.5, heigth + .5);
  ctx.fill();
  ctx.stroke();

  ctx.save();
  for(let i = 1; i < 10; i++) {
    ctx.fillStyle = 'black';
    ctx.fillRect(50 * i, -5, 1, 5)
    ctx.fillRect(-5, 50 * i, 5, 1)
    ctx.fill()
  }
  ctx.restore();





  // right
  ctx.beginPath();
  ctx.moveTo(0.5, 0.5);
  ctx.lineTo(width + .5, 0.5);
  ctx.stroke();
  // ctx.save();
  // ctx.scale(1, -1);
  // for(let i = 1; i < 10; i++) {
  //   ctx.fillText(50 * i + '', 50 * i + 0.5, 0.5);
  // }
  //
  // ctx.restore();

  ctx.restore();
}


function draw() {
  console.time('draw');
  let i = 0;
  let {speed, g, angle, d} = params;
  clear();
  grid();
  
  ctx.save();
  ctx.beginPath()
  ctx.setLineDash([5, 15]);
  let started = false;

  while (1) {
    let time = i / d;
    let radian = Math.PI * angle / 180;
    let vx = speed * round(Math.cos(radian), 10000000);
    let vy = speed * round(Math.sin(radian), 10000000);

    logg({vx, vy})

    let x = vx * time;
    let y = vy * time + g * time * time / 2;
    if (y < 0 || x > 500 || y > 500) {
      // console.log('times: ', i);
      console.timeEnd('draw');
      break
    }
    if (started) {
      ctx.moveTo(parseInt(x), parseInt(y))
      started = true
    } else {
      ctx.lineTo(parseInt(x), parseInt(y))
    }
    // ctx.save();
    // ctx.fillStyle = "rgba(0, 0, 0, 1)";
    // ctx.fillRect(parseInt(x), parseInt(y), 1, 1);
    // ctx.fill();
    i++;
  }
  ctx.stroke()
  ctx.restore()
}

draw();

function crEl(type, params = {}) {
  let element = document.createElement(type);
  Object.assign(element, params);
  return element
}

function ge(id) {return document.getElementById(id)}

let drop = document.querySelector('.drop');
let line = drop.parentElement;
let point = line.parentElement;
let start = false;
let h = 50;
let w = 3;
let d = 0;
drop.addEventListener('mousedown', (evt) => {
  let {pageX, pageY} = evt;
  start = {pageX, pageY};
  evt.preventDefault()
});



console.log('point => ', point)

document.addEventListener('mousemove', ({pageX, pageY}) => {
  if (start) {
    let a = h + start.pageY - pageY;
    let b = pageX - start.pageX;
    line.style.height = Math.sqrt(a * a + b * b) + 'px';
    let angl = radians_to_degrees(Math.atan(a / b)) + (b < 0 ? 180 : 0);
    logg({a, b, angl, an: radians_to_degrees(Math.atan(a / b))});
    els.speed.value = Math.sqrt(a * a + b * b);
    els.angle.value = angl;
    params.angle = angl;
    params.speed = els.speed.value;
    point.style.transform = `rotate(${180 - angl - 90}deg)`;
    draw()
  }
});

document.addEventListener('mouseup', ({pageY}) => {
  if (start) {
    h = Math.max(0, h + start.pageY - pageY);
    start = false
  }
});

console.log('Main');
console.timeEnd('init');
