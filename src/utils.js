let logs = {};
let log = new Proxy({}, {
  set(obj, key, value) {
    if (obj[key] === value || key === 'extend') return false;
    obj[key] = value;
    if (!logs[key]) {
      let el = crEl('div', {innerHTML: `<b>${key}: <span></span></b>`});
      logs[key] = el.querySelector('span');
      ge('logs').append(el)
    }
    logs[key].innerHTML = value;

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

function logg(params = {}) {
  Object.keys(params).forEach(key => log[key] = params[key])
};

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
      let x = (Dx / D);
      let y = (Dy / D);
      return {x, y, len: len({x: x1, y: y1}, {x, y})};
    }
  }
  else false
}


function createGridImage(size, color = 'rgba(0,0,0,0.2)') {
  if (!this._gridCanvas) {
    this._gridCanvas = crEl('canvas', {style: 'position: absolute; left: -100000; top: -10000px'});
  }
  Object.assign(_gridCanvas, {width: size, height: size, style: `width: ${size}px; height: ${size}px`});
  let ctx = this._gridCanvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.rect(0, 0, size, 1);
  ctx.rect(0, 0, 1, size);
  ctx.fill();
  return this._gridCanvas.toDataURL();
}

function radians_to_degrees(radians) {
  return radians * (180 / Math.PI);
}

function getMousePosOnElement(e) {
  let rect = e.target.getBoundingClientRect();
  return {left: e.clientX - rect.left, top: e.clientY - rect.top}
}

Function.prototype.throttle = function (milliseconds, context) {
  let baseFunction = this,
    lastEventTimestamp = null,
    limit = milliseconds;

  return function () {
    let self = context || this,
      args = arguments,
      now = Date.now();

    if (!lastEventTimestamp || now - lastEventTimestamp >= limit) {
      lastEventTimestamp = now;
      baseFunction.apply(self, args);
    }
  };
};