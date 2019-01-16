// Singleton registry
const _listeners = {};

function on(event, fn) {
  _listeners[event] = _listeners[event] || [];
  const subs = _listeners[event];
  subs.push(fn);

  return function () {
    const index = subs.indexOf(fn);
    if (index !== -1) subs.splice(index, 1);

    if (subs.length === 0) delete _listeners[event];
  };
}

function fire(event, ...args) {
  if (event in _listeners) {
    for (const fn of _listeners[event]) {
      fn(...args);
    }
  }
}

function reset() {
  for (const key of Object.keys(_listeners)) {
    delete this.listeners[key];
  }
}

export default {
  on,
  fire,
  reset,
};
