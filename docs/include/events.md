### events

* Type: `object`
* Default: `{}`

An object that can contain `{ event: [fn()] }` pairs, or `{ event: ['close'|'next'|component-name] }` pairs.

The `event` key can either be a DOM event that can be triggered on the element (i.e. `click`, `mouseover`), or a string
representing an event that will be triggered using `Onboardist.UI.fire(event)` (basically global pub/sub).

```js
new Onboardist.UI.Hotspot({
  attach: '#foo',
  events: {
    click: () => { console.log('foo') }
  },
})
```

#### handler

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

### `scenario-name`

If a string is given that matches a registered scenario, that scenario will be started (ending any currently-shown
scenario);

### `scenario-name`

If a string is given that matches a registered scenario, that scenario will be started (ending any currently-shown
scenario);