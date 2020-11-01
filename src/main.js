let canvas = ge('canvas');
let ctx = canvas.getContext('2d');
let width, height = 500;
let padding = 50;

function len(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2), Math.pow(a.y - b.y, 2))
}

let point = new Point(300, 100, 0, 250);
let items = [point];
for(let i = 0; i < 3; i++) {
  items.push(new Line(Math.random() * 100, Math.random() * 100, Math.random() * 500, Math.random() * 500))
}

items.push(new Grid());

// Floor item
let floor = new Line(-10000000, height - padding, 5000000, height - padding);
items.push(floor);

let time = Date.now();
function draw() {
  let current = Date.now();
  let delta = current - time;
  time = current;
  ctx.save();
  items.forEach(item => item.upd && item.upd(delta / 1000 * params.game));
  ctx.clearRect(0, 0, width, 500);
  let {x, y} = point.p;
  let xx = 0;
  let yy = 0;
  if (!point.paused) {
    if (x > width - padding) {
      xx = x - width + padding;
    }
    if (x < padding) {
      xx = x - padding;
    }
    if (y > height - padding) {
      yy = y - height + padding;
    } else if (y < padding) {
      yy = y - padding;
    }
  }

  ctx.xx = xx;
  ctx.yy = yy;
  canvas.style.backgroundPosition = `${-xx}px ${-yy}px `;
  logg({xx, yy, x, y});
  ctx.translate(-xx, -yy);
  items.forEach(item => item.draw && item.draw());
  ctx.restore();
  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);


function pause() {
  console.log('pause');
  stop = !stop;
  point.paused = !point.paused;
}

document.body.addEventListener('keydown', (evt) => {
  let {keyCode} = evt;
  if (keyCode === 32) {
    pause();
    evt.preventDefault();
  }
});

// Arrow controll
{
  let dropElement = ge('point');
  let line = dropElement.querySelector('.end');
  let start = false;

  app.on('set.speed', (length) => line.style.height = (length) + 'px');
  app.on('set.angle', (angle) => dropElement.style.transform = `translate(-50%, -50%) rotate(${180 - angle - 90}deg)`);

  dropElement.addEventListener('mousedown', evt => {
    let {target} = evt;
    let role = target.getAttribute('role');
    if (!role) return;

    point.paused = true;
    let {speed, angle} = params;
    point.len(speed);

    // Move arrow
    if (role === 'move') {
      let {x, y} = point.p;
      startDrag(evt, ({dx, dy}) => {
        Object.assign(dropElement.style, {left: x + dx + 'px', top: y + dy + 'px'});
        point.update({p: {x: x + dx, y: y + dy}});
        draw()
      })
    }

    // Set angle
    if (role === 'set') {
      start = {x: point.v.x, y: point.v.y};
      startDrag(evt, ({dx, dy}) => {
        point.update({v: {x: start.x + dx, y: start.y + dy}});
        let angle = point.getAngle(floor.n);
        if (angle < 0) {
          angle = 360 + angle
        }
        params.angle = angle;
        params.speed = Math.min(point.l, 1000);
        draw()
      })
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

{
  let start = false;
  let fun = false;

  function result({pageX, pageY, type}){
    fun && fun({dy: pageY - start.pageY, dx: pageX - start.pageX, type})
  }

  document.addEventListener('mousemove', ((evt) => {
    if (start) {
      result(evt)
    }
  }).throttle(15));

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
