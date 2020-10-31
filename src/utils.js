
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

