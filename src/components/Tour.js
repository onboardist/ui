export default class Tour {
  constructor(scenarios = [], options = {}) {
    this.scenarios = scenarios;
    this.options = Object.assign({}, {
      showNext: true,
    }, options);
  }

  next() {
    
  }

  clear() {
    // Remove all rendered elements
  }
};