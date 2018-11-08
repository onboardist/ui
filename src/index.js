import { default as HotspotComponent } from './components/Hotspot.svelte';
import { default as TooltipComponent } from './components/Tooltip.svelte';

export class Hotspot {
  constructor(args) {
    const data = {}
    if (args.style) data.style = args.style;

    return new HotspotComponent({
      ...args,
      data,
      target: document.querySelector('body') });
  }
}

export class Tooltip {
  constructor(args) {
    const data = {};
    ['style', 'title', 'content'].forEach(x => {
      if (args[x]) data[x] = args[x];  
    })

    return new TooltipComponent({
      ...args,
      data,
      target: document.querySelector('body') });
  }
}