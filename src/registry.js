import { uniquestring, registerForEvents } from './methods';
import { Coachmark, Hotspot, Modal, Tooltip } from './components';

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

export function component(name) {
  return _registry.components[name];
}

export function tour(name) {
  return _registry.tours[name];
}

export function activeTour(tour) {
  if (!tour) return _registry.activeTour;

  _registry.activeTour = tour;

  return tour;
}

export function registerComponent({ name, component, args, instance }) {
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
