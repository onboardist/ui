import { default as Tour, ComponentMap } from './components/Tour';
import { default as CoachmarkComponent } from './components/Coachmark.svelte';
import { default as HotspotComponent } from './components/Hotspot.svelte';
import { default as ModalComponent } from './components/Modal.svelte';
import { default as TooltipComponent } from './components/Tooltip.svelte';
import { uniquestring, registerForEvents } from './methods';

export { version } from '../package.json';
export { Tour };
export { default as config } from './config';
export { Coachmark, Hotspot, Modal, Tooltip } from './components';
export { CoachmarkComponent, HotspotComponent, ModalComponent, TooltipComponent } from './components';

let _activeTour = null;
export const components = {};
export const listeners = {};
export const tours = {};

export function component(name) {
  return components[name];
}

export function tour(name) {
  return tours[name];
}

export function setActiveTour(tour) {
  _activeTour = tour;
}

export function activeTour() {
  return _activeTour;
}

export function configure(config) {
  (config.tours || []).forEach(t => this.registerTour(t));
  // TODO: make sure each component exists
  (config.components || []).forEach(c => this.registerComponent(c));
}

// Functions
export function next() {
  if (this.activeTour) this.activeTour.next();
}

export function prev() {
  if (this.activeTour) this.activeTour.prev();
}

export function stop() {
  if (this.activeTour) this.activeTour.stop();
}

export function resetListeners() {
  for (const key of Object.keys(this.listeners)) {
    delete this.listeners[key];
  }
}

export function reset() {
  this.resetListeners();

  for (const key of Object.keys(components)) {
    if (components[key].instance) components[key].instance.destroy();
    delete components[key];
  }

  for (const key of Object.keys(tours)) {
    delete tours[key];
  }
}

export function on(event, fn) {
  listeners[event] = listeners[event] || [];
  const subs = listeners[event];
  subs.push(fn);

  return function () {
    const index = subs.indexOf(fn);
    if (index !== -1) subs.splice(index, 1);

    if (subs.length === 0) delete listeners[event];
  };
}

export function fire(event, ...args) {
  if (event in listeners) {
    for (const fn of listeners[event]) {
      fn(...args);
    }
  }
}

export function registerComponent({ name, component, args, instance }) {
  if (!name) name = uniquestring();
  args = args || {};
  args.name = name;

  if (component in ComponentMap) component = ComponentMap[component];

  components[name] = {
    component,
    args,
    instance,
  };

  registerForEvents(args.events, components[name]);
}

export function registerInstance({ name, instance }) {
  components[name] = components[name] || {};
  components[name].instance = instance;
}

export function deregisterInstance(name) {
  if (name in components) delete components[name].instance;
}

export function registerTour(tour) {
  const name = tour.name || uniquestring();

  this.tours[name] = tour;
}
