import { default as HotspotComponent } from './components/Hotspot.svelte';

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