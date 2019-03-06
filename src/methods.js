import Popper from 'popper.js';
import isDom from 'is-dom';
import { waitForTheElement } from 'wait-for-the-element';
import Registry from './registry';
import PubSub from './events';
import { uniquestring } from './util';

export function close() {
  this.destroy();
}

function attachEl() {
  const createPopper = attachEl => {
    if (!this.refs || !this.refs.el) return;
    this.popper = new Popper(attachEl, this.refs.el, { ...this.options });
    this.on('destroy', () => {
      this.popper.destroy();
    });
  };

  let { attach } = this.options;
  const comp = Registry.component(attach);
  if (comp && comp.instance) attach = comp.instance.refs.el;

  // TODO: handle `attach` that is a component in the registry
  // If the `attach` option is an element, use it right away. Otherwise wait (2.5s by default) for the attach element
  //   to exist.
  if (isDom(attach)) {
    this.set({ attach });
    createPopper(attach);
  } else {
    waitForTheElement(attach)
      .then(attachEl => {
        this.set({ attach: attachEl });
        createPopper(attachEl);
      });
  }
}

function generateEventHandler(handler, mappedComponent) {
  if (typeof (handler) === 'function') return handler;

  const [pair1 = '', pair2 = ''] = handler.split(/\./);
  const comp = Registry.component(pair1);
  const tour = Registry.tour(pair1);

  if (comp) {
    const { component, args } = comp;

    // Do something with a component
    if (!pair2 || pair2 === 'show') {
      handler = () => {
        // Show if not already instanced
        if (Registry.component(args.name).instance) return;
        new component(args); /* eslint-disable-line no-new */
      };
    } else if (pair2 === 'hide') {
      handler = () => {
        if (comp.instance) comp.instance.close();
      };
    }
  } else if (tour) {
    // TODO: Do something with a tour
    // tour.
  } else if (handler === 'close') {
    handler = () => {
      if (mappedComponent.instance) mappedComponent.instance.close();
    };
  } else if (handler === 'next') {
    handler = () => Registry.activeTour().next(); // TODO: this will throw if there's no activeTour, add a guard?
  } else if (handler === 'show') {
    // TODO: this one will need to work when generating handlers for components that don't exist in the DOM yet
    handler = () => {
      if (mappedComponent) {
        const { component, args } = mappedComponent;
        if (Registry.component(args.name).instance) return;
        if (component) new component(args); /* eslint-disable-line no-new */
      }
    };
  } else {
    throw new Error(`Unknown event handler ${handler}`);
  }

  return handler;
}

export function registerForEvents(eventArg = {}, mappedComponent) {
  for (const [events, handler] of Object.entries(eventArg)) {
    for (let event of [].concat(events)) {
      event = event.trim();

      const h = generateEventHandler.call(this, handler, mappedComponent);

      // Event key is a DOM event
      if (['click', 'mouseover', 'mouseout', 'contextmenu', 'dblclick'].includes(event)) {
        // This is not an instanced component, so no interactive events can be attached yet
        if (!this || !this.refs) return;
        this.refs.el.addEventListener(event, h);
        this.on('destroy', () => this.refs.el.removeEventListener(event, h));
      } else {
        // Treat event as an Onboardist event
        const dereg = PubSub.on(event, h);
        if (this) this.on('destroy', dereg);
      }
    }
  }
}

export function oncreate() {
  // Set name to a random string if not already set
  if (!this.get().name) this.set({ name: uniquestring() });

  // Attach element to a DOM element if necessary
  if (this.options.attach) attachEl.call(this);

  const { name } = this.get();
  const args = Object.assign({}, this.options);
  delete args.data;

  if (!Registry.component(name)) {
    const mappedComponent = {
      component: args.component,
      name,
      args,
      instance: this,
    };
    Registry.registerComponent(mappedComponent);
    if (this.options.events) registerForEvents.call(this, this.options.events, mappedComponent);
  }

  // Register instance globally
  Registry.registerInstance({ name: this.get().name, instance: this });
}

export function ondestroy() {
  Registry.deregisterInstance(this.get().name);
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
        return {
          type: 'close',
          text: 'OK',
          handler() {
            this.close();
          },
        };
      default:
        return button;
    }
  });
}
