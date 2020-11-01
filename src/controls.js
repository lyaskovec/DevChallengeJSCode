let app = {
  events: {},
  on(event, fun) {
    this.events[event] = this.events[event] || [];
    this.events[event].push(fun);
  },
  emit(event, ...args) {
    this.events[event] && this.events[event].forEach(fun => fun.apply(this, args));
    return this;
  },
  params: {}
};


const params = app.params = new Proxy(app.params, {
  set(obj, key, value) {
    if (obj[key] === value) return false;
    obj[key] = value;
    app.emit('set.' + key, value);
    app.emit('set', key, value);
    return true;
  }
});


// Working with images
{
  let inputFile = ge('selectFile');
  let images = ge('images');
  let list = Array.from(images.querySelectorAll('.ui-image.item'));
  let imgMap = {};

  list.forEach(item => {
    let url = item.getAttribute('data-img');
    addImage(item, url);
  });

  function addImage(item, url){
    let img = new Image();
    let id = Math.random();
    item.imageId = id;
    item.style.backgroundImage = `url(${url})`;
    img.onload = () => {
      let {width, height} = img;
      zoom.gridW = width;
      zoom.gridH = height;
      imgMap[id] = {width, height, url}
    };
    img.src = url
  }

  inputFile.addEventListener('change', async function (evt) {
    let item = evt.target.files[0];
    let bytes = await item.arrayBuffer();
    let blob = new Blob([bytes], {type: item.type});
    let src = URL.createObjectURL(blob);
    let img = crEl('div', {className: 'ui-image item', style: `background-image: url("${src}")`});
    inputFile.parentElement.prepend(img);
    list.unshift(img);
    addImage(img, src);
    this.value = '';
  });

  document.addEventListener('click', (evt) => {
    let {target} = evt;
    let {classList} = target;
    if (classList.contains('ui-image')) {
      if (classList.contains('add')) {
        inputFile.click()
      } else {
        let {imageId} = target;
        list.forEach(item => item !== target && item.classList.remove('selected'));
        classList.add('selected');
        canvas.style.backgroundImage = `url(${imgMap[imageId].url})`
      }
    }
  });
}





// Add sliders instead of number inputs
{
  let inputs = {};
  let current = false;
  window.par = inputs;
  let sliderNode = document.querySelector('.ui-slider');
  Array.from(document.querySelectorAll('input[type=number]')).forEach(input => {
    let node = sliderNode.cloneNode(true);
    input.parentNode.insertBefore(node, input);
    input.classList.add('none');
    let {name, min = 0, max, step = 1, value} = input;
    let param = inputs[name] = {min, max, step, value};
    Object.keys(param).forEach(key => param[key] = +param[key]);
    param.node = node;
    Array.from(node.querySelectorAll('[ref]')).forEach(item => param[item.getAttribute('ref')] = item);
    param.body.sliderId = name;
    param.posStep = 1 / ((max - min) / step );
    upd(name)
  });

  function upd(name) {
    let param = inputs[name];
    let {min, max, step, value} = param;
    updPos(name, (value - min) / (max - min));
    param.title.innerHTML = param.value
  }

  function updPos(name, position){
    let param = inputs[name];
    let {point, body, title, min, max, step, posStep} = param;
    position = Math.min(1, Math.max(0, position));
    position = Math.round(position / posStep) * posStep
    let value = min + position * (max - min);
    value = Math.round(value / step) * step;
    value = value * 10000;
    value = value - value % 1;
    value = value / 10000;
    inputs[name].value = value;
    title.innerHTML = value;
    point.style.left = `${position * 100}%`
  }

  document.addEventListener('mousedown', (evt) => {
    let {target} = evt;
    let {classList} = target;
    if (!classList.contains('ui-slider__body')) return;
    let name = target.sliderId;
    current = target;
    let pos = getMousePosOnElement(evt);
    updPos(name, pos.left / target.clientWidth);
    params[name] = inputs[name].value;
    startDrag(evt, ({dx}) => {
      updPos(target.sliderId, (pos.left + dx) / target.clientWidth)
      params[name] = inputs[name].value;
    })
  });

  app.on('set', (name, value) => {
    if (inputs[name]) {
      inputs[name].value = value;
      upd(name)
    }
  })
}


document.addEventListener('input', (evt) => {
  let {target} = evt;
  params[target.name] = target.value
});