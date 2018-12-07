import Popper from 'popper.js';
import isDom from 'is-dom';
import { waitForTheElement } from 'wait-for-the-element';

export function show() {
  this.show = true;
}

export function hide() {
  this.show = false;
}

export function oncreate() {
  const createPopper = (attachEl) => {
    this.popper = new Popper(attachEl, this.refs.el, { ...this.options });
  }

  if (!this.options.attach) return;

  // If the `attach` option is an element, use it right away. Otherwise wait (2.5s by default) for the attach element
  //   to exist.
  if (isDom(this.options.attach)) {
    createPopper(this.options.attach);
  } else {
    waitForTheElement(this.options.attach)
      .then(attachEl => createPopper(attachEl));
  }
}

export function expandButtonArgs(buttons) {
  if (!buttons) return buttons;

  const b = buttons.map(button => {
    if (typeof(button) !== 'string') return button;

    switch (button.toLowerCase()) {
      case ('next'):
        return { text: 'Next', handler() { Onboardist.UI.next(); } };
      case ('ok'):
        return { text: 'OK', handler() { this.close(); } };
      default:
        return button;
    }
  });

  console.log('b', b);

  return b;
}