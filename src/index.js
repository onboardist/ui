import Registry from './registry';
import PubSub from './events';
import { default as Tour } from './components/tour';
import { default as CoachmarkComponent } from './components/Coachmark.svelte'; /* eslint-disable-line no-unused-vars */
import { default as HotspotComponent } from './components/Hotspot.svelte'; /* eslint-disable-line no-unused-vars */
import { default as ModalComponent } from './components/Modal.svelte'; /* eslint-disable-line no-unused-vars */
import { default as TooltipComponent } from './components/Tooltip.svelte'; /* eslint-disable-line no-unused-vars */

export { version } from '../package.json';
export { Registry, Tour };
export { default as config } from './config';
export { Coachmark, Hotspot, Modal, Tooltip } from './components';
export { CoachmarkComponent, HotspotComponent, ModalComponent, TooltipComponent } from './components';

const { on, fire } = PubSub;
export { on, fire };

// const component = Registry.getComponent;
// const tour = Registry.getTour;
// export { component, tour };

// export function activeTour() {
//   return _activeTour;
// }

export function configure(config) {
  (config.tours || []).forEach(t => Registry.registerTour(t));
  // TODO: make sure each component exists
  (config.components || []).forEach(c => Registry.registerComponent(c));
}

// Functions
export function next() {
  if (Registry.activeTour()) Registry.activeTour().next();
}

export function prev() {
  if (Registry.activeTour()) Registry.activeTour().prev();
}

export function stop() {
  if (Registry.activeTour()) Registry.activeTour().stop();
}

export function reset() {
  PubSub.reset();

  Registry.destroyInstances();
  Registry.clear();
}
