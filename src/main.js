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


let paused = false;
let stop = false;

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

items.push(new Line(500, 50, 0, 50));
items.push(new Line(0, 500, 50, 0)); // left
items.push(new Line(500, 500, 0, 450)); // bottom
items.push(new Line(500, 0, 500, 500)); // right
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
  logg({xx, yy, 'Frame time': delta, 'Fps': parseInt(1 / delta * 1000)})
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
  let h = 50;
  let w = 3;
  let d = 0;

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
      line.style.height = mVector.l + 'px';
      point.style.transform = `rotate(${180 - mVector.getAngle(hVector.n) - 90}deg)`;
    }
  });

  document.addEventListener('mouseup', ({pageY}) => {
    if (start) {
      h = Math.max(0, h + start.pageY - pageY);
      start = false
    }
  });
}

{
  let element = document.querySelector('.ui-slider');
  let pointer = element.querySelector('.ui-slider__point');
  let $value = element.querySelector('.ui-slider__value');
  let start = false;
  let width;
  element.onmousedown = (evt) => {
    let {pageX} = evt;
    width = pointer.parentElement.clientWidth;
    let pos = getMousePosOnElement(evt);
    pointer.style.left = pos.left + 'px';
    start = {pageX, left: pos.left};
    evt.preventDefault()
  };
  document.addEventListener('mousemove', (evt) => {
    if (start) {
      let {pageX} = evt;
      let dx = pageX - start.pageX;
      let value = Math.min(Math.max(0, start.left + dx), width);
      pointer.style.left = Math.min(Math.max(value), width) + 'px';
      $value.innerHTML = parseInt(value / width  * 100);
      console.log( value / width);
    }
  });
  document.addEventListener('mouseup', (evt)=> {
    if (start) {
      start = false
    }
  })
}


{
  let params = [
    {id: 'speed', v: 100, step: 1, title: 'Швидкість'},
    {id: 'angle', v: 45, min: 0, step: 1, max: 360, title: 'Кут'},
    {id: 'race', v: 1, min: 1, step: 3, max: 360, title: 'Швидкість відтворення'},
    {id: 'coef', v: 0.1, min: 0.1, max: 1, step: 0.1, title: 'Коефецієнт розсіювання'},
    {id: 'Backgraound', items: ['Сітка', 'Картинка']}
  ]
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

//
// let controls = document.getElementById('controls');
// let els = {};
// Object.keys(params).forEach(key => {
//   let el = Object.assign(document.createElement('div'), {
//     innerHTML: `<b>${key}</b><div><input type="number"></div>`
//   });
//   let input = el.querySelector('input');
//   els[key] = input
//   input.addEventListener('input', () => {
//     params[key] = +input.value;
//     draw()
//   });
//   input.value = params[key];
//   controls.appendChild(el)
// });

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


let inputFile = ge('selectFile');
inputFile.addEventListener('change', async function (evt) {
  let item = evt.target.files[0];
  let bytes = await item.arrayBuffer();
  let blob = new Blob([bytes], {type: item.type});
  let src = URL.createObjectURL(blob);
  let img = crEl('div', {className: 'ui-image item', style: `background-image: url("${src}")`});
  inputFile.parentElement.prepend(img);
  this.value = '';
});

document.addEventListener('click', (evt) => {
  let {target} = evt;
  let {classList} = target;
  if (classList.contains('ui-image')) {
    if (classList.contains('add')) {
      inputFile.click()
    } else {

    }
  }
});




// Add sliders instead of number inputs
{
  let params = {};
  let current = false;
  window.par = params;
  let sliderNode = document.querySelector('.ui-slider');
  Array.from(document.querySelectorAll('input[type=number]')).forEach(input => {
    let node = sliderNode.cloneNode(true);
    input.parentNode.insertBefore(node, input);
    input.classList.add('none');
    let {name, min = 0, max, step = 1, value} = input;
    let param = params[name] = {min, max, step, value};
    Object.keys(param).forEach(key => param[key] = +param[key]);
    param.node = node;
    Array.from(node.querySelectorAll('[ref]')).forEach(item => param[item.getAttribute('ref')] = item);
    param.body.sliderId = name;
    upd(name)
  });

  function upd(name) {
    let param = params[name];
    param.title.innerHTML = param.value
  }

  function updPos(name, left){
    let param = params[name];
    let {point, body} = param;
    left = Math.min(100, Math.max(0, left));
    console.log(left)
    point.style.left = `${left}%`
  }

  document.addEventListener('mousedown', (evt) => {
    let {target} = evt;
    let {classList} = target;
    if (!classList.contains('ui-slider__body')) return;
    current = target;
    let pos = getMousePosOnElement(evt);
    updPos(target.sliderId, pos.left / target.clientWidth * 100);
    startDrag(evt, ({dx}) => {
      updPos(target.sliderId, (pos.left + dx) / target.clientWidth * 100)
    })
  });
}