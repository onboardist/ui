import Popper from 'popper.js';
import isDom from 'is-dom';
import { waitForTheElement } from 'wait-for-the-element';

export function uniquestring() {
  return Math.random().toString(36).substr(2);
}

export function close() {
  this.destroy();
}

export function show() {
  this.show = true;
}

export function hide() {
  this.show = false;
}

function attachEl() {
  const createPopper = (attachEl) => {
    this.popper = new Popper(attachEl, this.refs.el, { ...this.options });
  }

  // TODO: handle `attach` that is a component in the registry
  // If the `attach` option is an element, use it right away. Otherwise wait (2.5s by default) for the attach element
  //   to exist.
  if (isDom(this.options.attach)) {
    createPopper(this.options.attach);
  } else {
    waitForTheElement(this.options.attach)
      .then(attachEl => createPopper(attachEl));
  }
}

export function oncreate() {
  if (this.options.attach) attachEl.call(this);

  if (!this.get().name) this.set({ name: uniquestring() })

  // Register instance
  Onboardist.UI.registerInstance(this.get().name, this);
}

export function ondestroy() {
  Onboardist.UI.deregisterInstance(this.get().name);
}

export function expandButtonArgs(buttons) {
  if (!buttons) return buttons;

  return buttons.map(button => {
    if (typeof(button) !== 'string') return button;

    switch (button.toLowerCase()) {
      // TODO: remove this? next button should only be added by Tours, I think
      // case ('next'):
      //   return { text: 'Next', handler() { Onboardist.UI.next(); } };
      case ('ok'):
        return { text: 'OK', handler() { this.close(); } };
      default:
        return button;
    }
  });
}