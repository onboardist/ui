export { default as config } from './config';
import { default as CoachmarkComponent } from './components/Coachmark.svelte';
import { default as HotspotComponent } from './components/Hotspot.svelte';
import { default as ModalComponent } from './components/Modal.svelte';
import { default as TooltipComponent } from './components/Tooltip.svelte';
export { default as Tour } from './components/Tour';

export { Coachmark, Hotspot, Modal, Tooltip } from './components';
export { CoachmarkComponent, HotspotComponent, ModalComponent, TooltipComponent } from './components';

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
