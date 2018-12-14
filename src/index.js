export { default as config } from './config';
import { default as CoachmarkComponent } from './components/Coachmark.svelte';
import { default as HotspotComponent } from './components/Hotspot.svelte';
import { default as ModalComponent } from './components/Modal.svelte';
import { default as TooltipComponent } from './components/Tooltip.svelte';
export { default as Tour } from './components/Tour';
import { uniquestring } from './methods';

export { Coachmark, Hotspot, Modal, Tooltip } from './components';
export { CoachmarkComponent, HotspotComponent, ModalComponent, TooltipComponent } from './components';

export const components = {};
export const listeners = {};

// Functions
export function next() {
  // Get current tour

  // Get next step of tour

  // Start next step
}

export function prev() {

}

export function stop() {

}

// TODO: should this be resetListeners()? reset() is pretty generic
export function reset() {
  listeners = {};
}

export function on(event, fn) {
  const subs = listeners[event] = listeners[event] || [];
  subs.push(fn);
  
  return function() {
    const index = subs.indexOf(fn);
    if (index !== -1) subs.splice(index, 1);

    if (!subs.length) delete listeners[event];
  }
}

export function fire(event, ...args) {
  if (!event in listeners) return;

  for (const fn of listeners[event]) {
    fn.apply(null, args);
  }
}

export function register({ name, component, args, instance }) {
  if (!name) name = uniquestring();
  args.name = name;

  components[name] = {
    component,
    args,
    instance
  };
}

export function registerInstance(name, instance) {
  components[name] = components[name] || {};
  components[name].instance = instance;
}

export function deregisterInstance(name) {
  if (name in components) delete components[name].instance;
}