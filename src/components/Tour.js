import { Store } from 'svelte/store';

export default class Tour {
  constructor(scenarios = [], options = {}) {
    this.scenarios = scenarios;
    this.options = Object.assign({}, {
      showNext: true,
    }, options);
    this.store = new Store({});
  }

  start() {
    const scenario = this.scenarios[0];

    if (!scenario) {
      console.warn('No scenarios');
      return;
    }
    
    this.render(scenario);
  }

  render(scenario) {
    for (const [comp, args = {}] of scenario) {
      if (this.options.showNext) args.buttons = [...args.buttons || [], { text: 'Next', handler: () => this.next() }];

      const el = new comp(args);
    }
  }

  next() {
    
  }

  clear() {
    // Remove all rendered elements
  }
};