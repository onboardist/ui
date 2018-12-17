import { Store } from 'svelte/store';
import { uniquestring } from '../methods';
import { Coachmark, Hotspot, Modal, Tooltip } from '.';

export const ComponentMap = {
  coachmark: Coachmark,
  hotspot: Hotspot,
  modal: Modal,
  tooltip: Tooltip,
};

export default class Tour {
  constructor(options = {}) {
    this.name = options.name || uniquestring();
    this.scenarios = options.scenarios || [];
    this.options = Object.assign({}, {
      showNext: true,
      showPrev: true,
    }, options);
    this.store = new Store({});
    this.elementMap = {};

    if (!this.scenarios) throw new Error(`Tour ${this.name} was not given any scenarios`);

    this.register();
  }

  register() {
    Onboardist.UI.registerTour(this);

    for (const scenario of this.scenarios) {
      for (const [component, args = {}] of scenario) {
        Onboardist.UI.registerComponent({
          args,
          component,
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

    this.scenario = null;

    this.next();
  }

  render(scenario) {
    this.clear();

    // Start the component render chain
    this.renderChain(scenario[0], scenario);
  }

  nextComponent(compArgs, scenario) {
    return scenario[scenario.indexOf(compArgs) + 1];
  }

  // NOTE: right now the chain of elements has to be in order; i.e. if component 2 attaches to component 1, component 1
  //   has to come prior to two in the list of components.
  renderChain(compArgs, scenario) {
    let [comp, args] = compArgs;
    args = { ...args };

    if (typeof (comp) === 'string') {
      comp = ComponentMap[comp];
    }
    if (!comp) {
      throw new Error(`Component '${comp}' unrecognized`);
    }

    const nextButton = this.isLastScenario(scenario) ? { text: 'End', handler: () => this.clear() } : { text: 'Next', handler: () => this.next() };

    if (this.options.showPrev && !this.isFirstScenario(scenario)) {
      args.buttons = [{ text: 'Prev', handler: () => this.prev() }, ...(args.buttons || [])];
    }
    if (this.options.showNext) {
      args.buttons = [...(args.buttons || []), nextButton];
    }
    args.store = this.store;
    args.name = args.name || uniquestring();

    if (args.attach in this.elementMap) {
      args.attach = this.elementMap[args.attach].refs.el;
    }

    const el = new comp(args);
    Onboardist.UI.registerInstance({ name: el.get().name, instance: el });

    this.elementMap[el.get().name] = el;

    const next = this.nextComponent(compArgs, scenario);
    if (next) {
      setTimeout(() => this.renderChain(next, scenario));
    }
  }

  next() {
    if (this.scenario) {
      const curIdx = this.scenarios.indexOf(this.scenario);

      if (curIdx === -1) {
        return;
      }

      this.scenario = this.scenarios[curIdx + 1];
    } else {
      this.scenario = this.scenarios[0];
      this.clear();
    }

    this.render(this.scenario);
  }

  prev() {
    if (this.scenario) {
      const curIdx = this.scenarios.indexOf(this.scenario);

      if (curIdx === -1) {
        return;
      }

      this.scenario = this.scenarios[curIdx - 1];
    } else {
      this.scenario = this.scenarios[0];
    }

    this.render(this.scenario);
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

  stop() {
    this.clear();
  }
}
