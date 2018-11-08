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

  // If the `attach` option is an element, use it right away. Otherwise wait (2.5s by default) for the attach element
  //   to exist.
  if (isDom(this.options.attach)) {
    createPopper(this.options.attach);
  } else {
    waitForTheElement(this.options.attach)
      .then(attachEl => createPopper(attachEl));
  }
}