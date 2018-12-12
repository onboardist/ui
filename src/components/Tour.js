import { Store } from 'svelte/store';
import { Coachmark, Hotspot, Modal, Tooltip } from './';

console.log({ Coachmark, Hotspot, Modal, Tooltip });

const uniqstr = () => Math.random().toString(36).substr(2);

export const ComponentMap = {
  'coachmark': Coachmark,
  'hotspot': Hotspot,
  'modal': Modal,
  'tooltip': Tooltip,
}

export default class Tour {
  constructor(scenarios = [], options = {}) {
    this.scenarios = scenarios;
    this.options = Object.assign({}, {
      showNext: true,
    }, options);
    this.store = new Store({});
    this.elementMap = {};
  }

  start() {
    const scenario = this.scenarios[0];

    if (!scenario) {
      console.warn('No scenarios');
      return;
    }
    
    this.next();
  }

  render(scenario) {
    this.clear();

    const [comp, args = {}] = scenario[0];

    // Start the component render chain
    this.renderChain(scenario[0], scenario);
  }

  nextComponent(compArgs, scenario) {
    return scenario[scenario.indexOf(compArgs) + 1];
  }

  renderChain(compArgs, scenario) {
    const [comp, args] = compArgs;

    if (typeof(comp) === 'string') comp = ComponentMap[comp];
    if (!comp) throw new Error(`Component '${comp}' unrecognized`);

    if (this.options.showNext) args.buttons = [...(args.buttons || []), { text: 'Next', handler: () => this.next() }];
    if (this.options.showPrev && !this.isFirstScenario(scenario)) args.buttons = [ { text: 'Prev', handler: () => this.prev() }, ...(args.buttons || [])];
    args.store = this.store;
    args.name = args.name || uniqstr();

    if (this.elementMap.hasOwnProperty(args.attach)) {
      args.attach = this.elementMap[args.attach].refs.el;
    }

    const el = new comp(args);

    this.elementMap[args.name] = el;

    const next = this.nextComponent(compArgs, scenario);
    if (next) setTimeout(() => this.renderChain(next, scenario));
  }

  next() {
    const curIdx = this.scenarios.indexOf(this.scenario);

    if (curIdx === -1) return;

    this.scenario = this.scenarios[curIdx + 1];

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
};