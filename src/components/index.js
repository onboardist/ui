import { default as CoachmarkComponent } from './Coachmark.svelte';
import { default as HotspotComponent } from './Hotspot.svelte';
import { default as ModalComponent } from './Modal.svelte';
import { default as TooltipComponent } from './Tooltip.svelte';

export { CoachmarkComponent, HotspotComponent, ModalComponent, TooltipComponent };

const props = ['content', 'buttons', 'events', 'name', 'style', 'title',];

function genericConstructor(component, args) {
  const data = {};
  props.forEach(x => {
    if (args[x]) data[x] = args[x];  
  })

  return new component({
    ...args,
    data,
    target: document.querySelector('body'),
  });
}

export class Coachmark {
  constructor(args) {
    return genericConstructor(CoachmarkComponent, args);
  }
}

export class Hotspot {
  constructor(args) {
    return genericConstructor(HotspotComponent, args);
  }
}

export class Modal {
  constructor(args) {
    return genericConstructor(ModalComponent, args);
  }
}

export class Tooltip {
  constructor(args) {
    return genericConstructor(TooltipComponent, args);
  }
}