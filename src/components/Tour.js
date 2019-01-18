import { Store } from 'svelte/store';
import { waitForTheElement } from 'wait-for-the-element';
import { uniquestring } from '../methods';
import Registry, { ComponentMap } from '../registry';

export default class Tour {
  constructor(options = {}) {
    this.options = Object.assign({}, {
      name: uniquestring(),
      showNext: true,
      showPrev: true,
      scenarios: [],
    }, options);

    this.name = this.options.name;
    this.scenarios = this.options.scenarios;

    this.store = new Store({});
    this.elementMap = {};

    if (!this.scenarios || this.scenarios.length === 0) throw new Error(`Tour ${this.name} was not given any scenarios`);

    this.register();
  }

  register() {
    Registry.registerTour(this);

    for (const i in this.scenarios) {
      if (!{}.hasOwnProperty.call(this.scenarios, i)) continue;

      const scenario = this.scenarios[i];
      if (!scenario.components) {
        throw new Error(`Tour '${this.name}' scenario #${parseInt(i, 10) + 1} has no components property. Should be an array`);
      }

      for (const args of scenario.components) {
        Registry.registerComponent({
          component: args.component,
          args,
          name: args.name,
        });
      }
    }
  }

  start() {
    if (this.scenarios.length === 0) {
      console.warn('No scenarios');
      return;
    }

    // We are now the active tour
    Registry.setActiveTour(this);

    // Reset scenario in case //#endregionit was set
    this.scenario = null;

    this.next();
  }

  render(scenario) {
    this.clear();

    // Start the component render chain
    this.renderChain(scenario.components[0], scenario);
  }

  nextComponent(compArgs, scenario) {
    return scenario.components[scenario.components.indexOf(compArgs) + 1];
  }

  // NOTE: right now the chain of elements has to be in order; i.e. if component 2 attaches to component 1, component 1
  //   has to come prior to two in the list of components.
  renderChain(compArgs, scenario) {
    let comp = compArgs.component;
    const args = { ...compArgs };

    if (typeof (comp) === 'string') {
      comp = ComponentMap[comp];
    }

    if (!comp) throw new Error(`Component '${comp}' unrecognized`);

    const nextButton = this.isLastScenario(scenario) ?
      { text: 'End', handler: () => this.clear() } :
      { text: 'Next', handler: () => this.next() };

    // Clear out buttons 'cause we're overriding them
    args.buttons = [];
    if (this.options.showPrev && args.showPrev !== false && !this.isFirstScenario(scenario)) {
      args.buttons = [{ text: 'Prev', handler: () => this.prev() }, ...(args.buttons || [])];
    }
    if (this.options.showNext && args.showNext !== false) {
      args.buttons = [...(args.buttons || []), nextButton];
    }
    args.store = this.store;
    args.name = args.name || uniquestring();

    if (args.attach in this.elementMap) {
      args.attach = this.elementMap[args.attach].refs.el;
    }

    const el = new comp(args);
    Registry.registerInstance({ name: el.get().name, instance: el });

    this.elementMap[el.get().name] = el;

    const next = this.nextComponent(compArgs, scenario);
    if (next) {
      setTimeout(() => this.renderChain(next, scenario));
    }
  }

  waitScenario(scenario) {
    // Handle wait
    let p = scenario.wait;
    if (p) {
      // Number
      const ms = parseInt(p, 10);
      if (isNaN(ms)) {
        p = waitForTheElement(p, {
          timeout: 10000,
        });
      } else {
        p = new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, ms);
        });
      }
    }

    Promise.resolve(p)
      .then(() => {
        this.scenario = scenario;
        this.render(scenario);
      });
  }

  next() {
    const scenario = this.nextScenario(this.scenario);

    if (!scenario) return;

    this.scenario = scenario;

    this.render(this.scenario);

    const nextScenario = this.nextScenario(scenario);
    if (nextScenario && nextScenario.wait) this.waitScenario(nextScenario);
  }

  prev() {
    const scenario = this.prevScenario(this.scenario);

    if (!scenario) return;

    this.scenario = scenario;

    this.render(this.scenario);

    const prevScenario = this.prevScenario(scenario);
    if (prevScenario && prevScenario.wait) this.waitScenario(prevScenario);
  }

  clear() {
    // Remove all rendered elements
    for (const el of Object.values(this.elementMap)) {
      el.destroy();
    }

    this.elementMap = {};
  }

  isFirstScenario(scenario) {
    return this.scenarios.indexOf(scenario) === 0;
  }

  isLastScenario(scenario) {
    return this.scenarios.indexOf(scenario) === this.scenarios.length - 1;
  }

  nextScenario(scenario) {
    if (scenario) {
      const curIdx = this.scenarios.indexOf(scenario);

      if (curIdx === -1) {
        return;
      }

      return this.scenarios[curIdx + 1];
    }

    this.clear();
    return this.scenarios[0];
  }

  prevScenario(scenario) {
    if (scenario) {
      const curIdx = this.scenarios.indexOf(scenario);

      if (curIdx === -1) {
        return;
      }

      return this.scenarios[curIdx - 1];
    }

    this.clear();
    return this.scenarios[0];
  }

  stop() {
    this.clear();
  }
}
