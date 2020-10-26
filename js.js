console.time('init');

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let padding = 20;
let width = 500;
let heigth = 500;

ctx.scale(1, -1);
ctx.translate(padding, -500 + padding);

ctx.fillStyle = 'red';
ctx.strokeStyle = 'blue';


ctx.save();
ctx.lineWidth = 1.5;
ctx.moveTo(0, 0);
// ctx.lineTo(100, 200);
ctx.stroke();
ctx.restore();


const params = {
  speed: 100,
  g: -9.8,
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

function draw() {
  console.time('draw');
  let i = 0;
  let {speed, g, angle} = params;
  clear();
  while (1) {
    let time = i / 10;
    let radian = Math.PI * angle / 180;
    let x = speed * round(Math.cos(radian), 10000) * time / 2;
    let y = speed * round(Math.sin(radian), 10000) * time + g * time * time / 2;
    if (y < 0 || x > 500 || y > 500) {
      console.log('times: ', i);
      console.timeEnd('draw');
      break
    }
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(parseInt(x), parseInt(y), 1, 1);
    ctx.fill();
    i++;
  }
}

draw();

function radians_to_degrees(radians)
{
  var pi = Math.PI;
  return radians * (180/pi);
}


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
    console.log(' ==> ', start.pageX - pageX, start.pageY - pageY, );
    let newH = a = h + start.pageY - pageY;
    let newW = b = pageX - start.pageX;
    line.style.height = Math.sqrt(a*a + b*b) + 'px';
    // console.log('Atan: ', Math.atan(a / b))
    let angl = 90 - radians_to_degrees(Math.atan(a / b))
    if (b < 0) {
      angl = 90 - radians_to_degrees(Math.atan(a / b))
    }
    els.speed.value = Math.sqrt(a*a + b*b)
    els.angle.value = angl
    params.angle = angl
    params.speed = els.speed.value
    point.style.transform = `rotate(${angl}deg)`;
    draw()
  }
});

document.addEventListener('mouseup', ({pageY}) => {
  if (start) {
    h = Math.max(0, h + start.pageY - pageY)
    start = false
  }
});

console.log('Main');
console.timeEnd('init');
