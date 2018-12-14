# Event Handling

Events let components react to user input and also integrate with your applicaiton. Components can subscribe to two different kinds of events:

* DOM events: (`click`, `mouseover`, etc.)
* Onboardist events: pub/sub-style messaging.

DOM events are subscribed to using the `events` property when you define your component arguments.

Onboardist events use the `subscribe` property. You can use `Onboardist.UI.fire('eventname')` to trigger events across
Onboardist.

### events

* Type: `object`
* Default: `{}`

An object that looks like this:

```js
{ event: [fn()|'close'|'next'|componentName|tourName.ScenarioName] }
```

The `event` key is a DOM event that the event will listen for. This can be `click`, `mouseover`, `contextmenu`, etc. The
value can be an array of any of these:

* `fn()`: A handler function
* `'close'`: Remove the compnent on `event`
* `'next'`: Move to next scenario in current tour
* `componentName`: Activate component registered with name `componentName`
* `tourName.scenarioName`: Activate scenario `scenarioName` in tour `tourName`.

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


### subscribe

* Type: `object`
* Default: `{}`

An object that looks like this:

```js
{ event: [fn()|'close'|'next'|componentName|tourName.ScenarioName] }
```

The key is the string of the Onboardist event to subscribe to.
