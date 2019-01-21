const mock = require('mock-require');
const PopperJs = require('popper.js');

class Popper {
  static placements() {
    return PopperJs.placements;
  }

  constructor() {
    return {
      destroy: () => {},
      scheduleUpdate: () => {},
    };
  }
}

mock('popper.js', Popper);
