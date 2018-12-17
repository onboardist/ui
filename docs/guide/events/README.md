# Event Handling

Events let components react to user input and also integrate with your applicaiton. Components can subscribe to two
different kinds of events:

* **DOM events**: (`click`, `mouseover`, etc.)
* **Onboardist events**: pub/sub-style messaging.

## DOM Events

All events are subscribed to using the `events` property when you define your component arguments.

```js
new Hotspot({
  attach: '#foo',
  events: {
    click: 'modal01', // instantiate component `modal01` on click
    hover: 'tooltip5', // instatiate component `tooltip5` when hotspot
                       // is moused over; `tooltip5` will be removed when
                       // the user mouses out.
  },
})
```

## Onboardist Events

Onboardist UI has its own simple pub/sub message bus. This is used by components to communicate with each other, and by
*you* to communicate with Onboardist.

Say you want to show a user how to remove an item from their cart when they first add one. You've made a tour named
`cart-remove-item` 

Onboardist events also use the `events` property. You can use `Onboardist.UI.fire('eventname')` to trigger events across
Onboardist.

```js
new Hotspot({
  attach: '#foo',
  subscribe: {
    'show-hotspot': 'show',
  },
});

Onboardist.UI.fire('show-hotspot');
```

## The Events Argument



### events

* Type: `object`
* Default: `{}`

An object that looks like this:

```js
{ event: [fn()|'close'|'next'|componentName|tourName<.scenarioName>] }
```

The `event` key is a DOM event that the event will listen for. This can be `click`, `mouseover`, `contextmenu`, etc. The
value can be an array of any of these:

* `fn()`: A handler function
* `'close'`: Remove the compnent on `event`
* `'next'`: Move to next scenario in current tour
* `'show'`: Show this component
* `componentName`: Activate component registered with name `componentName`
* `tourName<.scenarioName>`: Activate scenario `scenarioName` in tour `tourName`. If no scenario name is supplied the
  tour will start at the beginning.

```js
new Onboardist.UI.Hotspot({
  attach: '#foo',
  events: {
    click: () => { console.log('foo') }
  },
})
```

#### `fn()`

If a handler function is given it will be called when the event named `event` is triggered.

#### `'close'`

If the string `'close'` is given, the element will be removed.

```js
new Onboardist.UI.Hotspot({
  events: { click: 'close' },
});
```

#### `'next'`

If the string `'next'` is given, the current [tour](/components/tour/) will move to the next scenario.

```js
new Onboardist.UI.Hotspot({
  events: { click: 'next' },
});
```

#### `tourName.scenarioName`

* Format: `'tourName.scenarioName`

Examples: `'userpage.usertable'`, `'cart.additem'`, `'welcome.logging-out'`

If a string is given that matches a registered scenario, that scenario will be started (ending any currently-shown
scenario);

#### `componentName`

If a string is given that matches a registered component, that component will be instantiated and shown.


<!-- ### subscribe

* Type: `object`
* Default: `{}`

An object that looks like this:

```js
{ event: [fn()|'close'|'next'|componentName|tourName.ScenarioName] }
```

The key is the string of the Onboardist event to subscribe to. -->
