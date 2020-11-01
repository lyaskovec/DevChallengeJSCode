let app = new Proxy({
  items: [],
  events: {},
  started: false,
  finished: false,
  background: 'image',
  on(event, fun) {
    this.events[event] = this.events[event] || [];
    this.events[event].push(fun);
  },
  emit(event, ...args) {
    this.events[event] && this.events[event].forEach(fun => fun.apply(this, args));
    return this;
  },
  addLine() {
    let line = new Line(Math.random() * width, Math.random() * height, Math.random() * width, Math.random() * height);
    line.obstacle = true;
    items.push(line)
  },
  addObstacle(index){
    let x = cX = Math.random() * width;
    let y  = cY = Math.random() * height
    let patterns = [
      ()=>{
        let w = 100 + Math.random() * 150;
        let h = 100 + Math.random() * 150;
        let poligon = new Poligon();
        poligon.push({x, y});
        poligon.push({x: x + w, y: y});
        poligon.push({x: x + w, y: y + w});
        poligon.push({x, y: y + w});
        return poligon;
      },
      ()=> {
        let w = 100 + Math.random() * 250;
        let h = 100 + Math.random() * 250;
        let kf = 0.8;
        let kt = 1.2;
        let poligon = new Poligon();
        poligon.push({x: x * rand(kf, kt), y: y * rand(kf, kt)});
        poligon.push({x: (x + w / 2)* rand(kf, kt), y: (y + h / 2) * rand(kf, kt)});
        poligon.push({x: (x - w / 2)* rand(kf, kt), y: (y + h / 2) * rand(kf, kt)});
        return poligon;
      },
      function star() {
        let n = parseInt(rand(5, 9))
        let r = rand(50, 200);
        let poligon = new Poligon();
        poligon.push({x: cX + r, y: cY})

        //star draw
        for(let i = 1; i <= n * 2; i++) {
          let x, y, theta;
          if(i % 2 === 0){
            theta = i * (Math.PI * 2) / (n * 2);
            x = cX + (r * Math.cos(theta));
            y = cY + (r * Math.sin(theta));
          } else {
            theta = i * (Math.PI * 2) / (n * 2);
            x = cX + ((r/2) * Math.cos(theta));
            y = cY + ((r/2) * Math.sin(theta));
          }
          poligon.push({x ,y});
        }
        return poligon
      }
    ];

    let poligon = patterns[index]();
    poligon.obstacle = true;
    items.push(poligon);
    let list = Array.from(poligon.items);
    let first = list[0];
    list.push(first);
    list.forEach(item => {
      let line = new Line(first.x, first.y, item.x, item.y);
      line.obstacle = true;
      items.push(line);
      console.log('Line', line)
      first = item
    })
  },
  clear(){
    items = items.filter(item => !item.obstacle)
  },
  reset(){

  },
  init() {
    this.el = ge('app');
    Object.keys(this.data).forEach(key =>
      Object.defineProperty(module, key, {
        set(value) {
          if (this.data[key] !== value) {
            this.data[key] = value;
            this.emit(key, value)
          }
        },
        get() {
          this._watch && (module._watch[key] = 1);
          return this.data[key]
        }
      })
    )
  },
  add(item) {
    return item;
  }
}, {
  set(obj, key, value) {
    if (obj[key] === value) return false;
    obj[key] = value;
    obj.emit('set.' + key, value);
    obj.emit('set', key, value);
    return true;
  }
});

// app = new Proxy(app, {
//   set(app, key, value) {
//     if (app[key] === value) return false;
//     app[key] = value;
//     app.emit('set.' + key, value);
//     app.emit('set', key, value);
//     return true;
//   }
// });

// const params = app
// const params = app.params = new Proxy(app.params, {
//   set(obj, key, value) {
//     if (obj[key] === value) return false;
//     obj[key] = value;
//     app.emit('set.' + key, value);
//     app.emit('set', key, value);
//     return true;
//   }
// });


// Working with images
{
  let inputFile = ge('selectFile');
  let images = ge('images');
  let list = Array.from(images.querySelectorAll('.ui-image.item'));
  let imgMap = {none: {width: 100000, height: 10000, url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='}};

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
        app.img = imageId;
      }
    }
  });

  function setBg() {
    let {bg} = params;
    canvas.style.backgroundImage = `url(${imgMap[bg].url})`
  }

  app.on('set', (name, value) => {
    let {img, grid, background, bg} = app;
    if (name === 'img') {
      background === 'image' && (app.bg = img)
    } else if (name === 'grid') {
      let key = 'grid:' + value;
      if (!imgMap[key]) {
        imgMap[key] = {width: value, height: value, url: createGridImage(value)}
      }
      app.background === 'grid' && (app.bg = key);
    } else if (['background'].indexOf(name) >-1) {
      background === 'grid' && (app.bg = `grid:` + grid);
      background === 'image' && (app.bg = img);
      background === 'none' && (app.bg = 'none');
    } else if (name === 'bg') {
      setBg()
    }
  });
}





// Add sliders instead of number inputs
{
  let inputs = {};
  let current = false;
  let sliderNode = document.querySelector('.ui-slider');

  app.on('set', (name, value) => {
    if (inputs[name]) {
      inputs[name].value = value;
      upd(name)
    }
  });

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
    app[name] = param.value
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
    app[name] = inputs[name].value;
    startDrag(evt, ({dx}) => {
      updPos(target.sliderId, (pos.left + dx) / target.clientWidth)
      app[name] = inputs[name].value;
    })
  });
}


document.addEventListener('input', (evt) => {
  let {target} = evt;
  app[target.name] = target.value
});