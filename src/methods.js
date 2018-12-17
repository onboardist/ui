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
  const createPopper = attachEl => {
    this.popper = new Popper(attachEl, this.refs.el, { ...this.options });
  };

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

function generateEventHandler(handler) {
  if (typeof (handler) === 'function') return handler;

  const [pair1 = '', pair2 = ''] = handler.split(/\./);
  const comp = Onboardist.UI.component(pair1);
  const tour = Onboardist.UI.tour(pair1);

  if (comp) {
    // Do something with a component
    if (!pair2 || pair2 === 'show') {
      handler = () => {
        // TODO: create component pair1
        
      };
    } else if (pair2 === 'hide') {
      handler = () => {
        
        if (comp && comp.instance) comp.instance.hide();
      };
    }
  } else if (tour) {
    // TODO: Do something with a tour
    // tour.
  } else if (handler === 'close') {
    handler = () => this.close();
  } else if (handler === 'next') {
    handler = () => Onboardist.UI.next();
  } else if (handler === 'show') {
    // TODO: this one will need to work when generating handlers for components that don't exist in the DOM yet
    return handler;
  }
}

function registerForEvents() {
  for (const [events, handler] of Object.keys.entries(this.options.events)) {
    for (let event of [].concat(events)) {
      event = event.trim();

      const h = generateEventHandler.call(this, handler);

      // Event key is a DOM event
      if (event in ['click', 'mouseover', 'mouseout', 'contextmenu', 'dblclick']) {
        this.refs.el.addEventListener(event, h);
        this.on('destroy', () => this.refs.el.removeEventListener(event, h));
      } else {
        // Treat event as an Onboardist event
        const dereg = Onboardist.UI.on(event, h);
        this.on('destroy', dereg);
      }
    }
  }
}

export function oncreate() {
  // Set name to a random string if not already set
  if (!this.get().name) this.set({ name: uniquestring() });

  // Attach element to a DOM element if necessary
  if (this.options.attach) attachEl.call(this);

  // Register for events
  if (this.options.events) registerForEvents.call(this);

  // Register instance globally
  Onboardist.UI.registerInstance(this.get().name, this);
}

export function ondestroy() {
  Onboardist.UI.deregisterInstance(this.get().name);
}

export function expandButtonArgs(buttons) {
  if (!buttons) return buttons;

  return buttons.map(button => {
    if (typeof (button) !== 'string') return button;

    switch (button.toLowerCase()) {
      // TODO: remove this? next button should only be added by Tours, I think
      // case ('next'):
      //   return { text: 'Next', handler() { Onboardist.UI.next(); } };
      case ('ok'):
        return { text: 'OK', handler() {
 this.close(); 
} };
      default:
        return button;
    }
  });
}
