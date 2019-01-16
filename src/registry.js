import { uniquestring, registerForEvents } from './methods';
import { Coachmark, Hotspot, Modal, Tooltip } from './components';

// Singleton registry
const _registry = {
  tours: {},
  components: {},
  instances: {},
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
  for (const key of Object.keys(_registry.components)) {
    delete _registry.components[key];
  }

  for (const key of Object.keys(_registry.tours)) {
    delete _registry.tours[key];
  }
}

function getComponent(name) {
  return _registry.components[name];
}

function getTour(name) {
  return _registry.tours[name];
}

function activeTour(tour) {
  if (!tour) return _registry.activeTour;

  _registry.activeTour = tour;

  return tour;
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

  registerForEvents(args.events, _registry.components[name]);
}

function registerTour(tour) {
  tour.name = tour.name || uniquestring();

  _registry.tours[tour.name] = tour;
}

function setActiveTour(tour) {
  _registry.activeTour = tour;
}

function registerInstance({ name, instance }) {
  _registry.components[name] = _registry.components[name] || {};
  _registry.components[name].instance = instance;
}

function deregisterInstance(name) {
  if (name in _registry.components) delete _registry.components[name].instance;
}

function destroyInstances() {
  for (const component of _registry.components) {
    if (component.instance) component.instance.destroy();
  }
}

export default {
  activeTour,
  clear,
  deregisterInstance,
  destroyInstances,
  getComponent,
  getTour,
  registerComponent,
  registerTour,
  registerInstance,
  setActiveTour,
};
