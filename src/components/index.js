import { default as CoachmarkComponent } from './Coachmark.svelte';
import { default as HotspotComponent } from './Hotspot.svelte';
import { default as ModalComponent } from './Modal.svelte';
import { default as TooltipComponent } from './Tooltip.svelte';

export { CoachmarkComponent, HotspotComponent, ModalComponent, TooltipComponent };

const props = ['backdrop', 'buttons', 'content', 'events', 'name', 'style', 'title'];

function genericConstructor(component, args) {
  const data = {};
  props.forEach(x => {
    if (x in args) data[x] = args[x];
  });

  return new component({
    ...args,
    data,
    target: document.querySelector('body'),
  });
}

export class Coachmark {
  constructor(args) {
    args.component = 'coachmark';
    return genericConstructor(CoachmarkComponent, args);
  }
}

export class Hotspot {
  constructor(args) {
    args.component = 'hotspot';
    return genericConstructor(HotspotComponent, args);
  }
}

export class Modal {
  constructor(args) {
    args.component = 'modal';
    return genericConstructor(ModalComponent, args);
  }
}

export class Tooltip {
  constructor(args) {
    args.component = 'tooltip';
    return genericConstructor(TooltipComponent, args);
  }
}
