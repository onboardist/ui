import { Coachmark, Hotspot, Modal, Tooltip } from './components';
import { uniquestring } from './util';
import { registerForEvents } from './methods';

// TODO: rewrite with Map()
// Singleton registry
const _registry = {
  tours: {},
  components: {},
  listeners: [],

  activeTour: null,
};

export const ComponentMap = {
  coachmark: Coachmark,
  hotspot: Hotspot,
  modal: Modal,
  tooltip: Tooltip,
};

function clear() {
  destroyInstances();

  for (const key of Object.keys(_registry.components)) {
    delete _registry.components[key];
  }

  for (const key of Object.keys(_registry.tours)) {
    delete _registry.tours[key];
  }
}

function component(name) {
  return _registry.components[name];
}

function tour(name) {
  return _registry.tours[name];
}

function registerComponent({ name, component, args, instance }) {
  if (!name) name = uniquestring();
  args = args || {};
  args.name = name;

  if (component in ComponentMap) component = ComponentMap[component];

  _registry.components[name] = {
    component,
    args,
    instance,
  };

  // TODO: this doesn't belong here. Causing circular dependency
  // registerForEvents.call(this, args.events, _registry.components[name]);

  return _registry.components[name];
}

function registerTour(tour) {
  tour.name = tour.name || uniquestring();

  _registry.tours[tour.name] = tour;

  return tour;
}

function activeTour() {
  return _registry.activeTour;
}

function setActiveTour(tour) {
  if (typeof tour === 'string') tour = _registry.tours[tour];
  if (!tour) throw new Error('No tour specified');
  if (typeof tour !== 'object');

  _registry.activeTour = tour;
}

function registerInstance({ name, instance }) {
  if (!name) throw new Error('No component name provided');
  if (!instance) throw new Error('No component instance provided');

  _registry.components[name] = _registry.components[name] || {};
  _registry.components[name].instance = instance;
}

function deregisterInstance(name) {
  if (name in _registry.components) {
    if (_registry.components[name].instance) _registry.components[name].instance.destroy();
    delete _registry.components[name].instance;
  }
}

function destroyInstances() {
  for (const component of Object.values(_registry.components)) {
    if (component.instance) {
      component.instance.destroy();
      delete component.instance;
    }
  }
}

export default {
  _registry,

  activeTour,
  clear,
  component,
  deregisterInstance,
  destroyInstances,
  registerComponent,
  registerTour,
  registerInstance,
  setActiveTour,
  tour,
};
