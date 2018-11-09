export { default as Config } from './config';
import { default as HotspotComponent } from './components/Hotspot.svelte';
import { default as TooltipComponent } from './components/Tooltip.svelte';

function genericConstructor(component, args) {
  const data = {};
  ['style', 'title', 'content'].forEach(x => {
    if (args[x]) data[x] = args[x];  
  })

  return new component({
    ...args,
    data,
    target: document.querySelector('body'),
  });
}

export class Hotspot {
  constructor(args) {
    return genericConstructor(HotspotComponent, args);
  }
}

export class Tooltip {
  constructor(args) {
    return genericConstructor(TooltipComponent, args);
  }
}
