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


{
  let start = false;
  let fun = false;

  function result(evt, finished = false) {
    let {pageX, pageY, type} = evt
    fun && fun({dy: pageY - start.pageY, dx: pageX - start.pageX, type, finished})
  };

  ['mousemove', 'touchmove'].forEach(eventName => {
    document.addEventListener(eventName, ((evt) => {
      if (start) {
        let {type} = evt
        let params = type === 'touchmove' ? Object.assign(evt.changedTouches[0], {type}) : evt;
        result(params)
      }
    }).throttle(1))
  });

  ['mouseup', 'touchend'].forEach(eventName =>
    document.addEventListener(eventName, (evt) => {
      if (start) {
        let {type} = evt
        let params = type === 'touchend' ? Object.assign(evt.changedTouches[0], {type}) : evt;
        result(params, true);
        start = false;
      }
    })
  );

  function startDrag(evt, callback) {
    let params = evt.targetTouches ? evt.targetTouches[0] : evt;
    let {pageX, pageY} = params;
    start = {pageX, pageY};
    fun = callback;
    evt.preventDefault()
  }

  window.startDrag = startDrag;
}

function ge(id) {return document.getElementById(id)}

let app = ge('app');
['mousedown', 'touchstart'].forEach(eventName => app.addEventListener(eventName, function (evt) {
  startDrag(evt, ({dx, dy, type, finished}) => {
    app.classList[finished ? 'add' : 'remove']('anim')
    if (finished) {
      let delay = Math.abs(dx)
      if (delay > 20) {
        dx = dx < 0 ? -app.clientWidth : app.clientWidth
      } else {
        dx = 0
      }
    }
      app.style.transform = `translateX(${dx}px)`;
  })
}))

document.querySelector('#img').addEventListener('touchmove', (evt)=> {
  console.log('evt', evt.type, evt)
})