### buttons

* Type: `array`
* Default: `['ok']`

A list of buttons to show at the bottom of the component. Each element in the array can either be the string `'ok'` or an
object with `text` and `handler` properties:

```js
new Hotspot({ attach: '#foo', buttons: [
  { text: 'Close', handler() { this.close() } },
]});
```

`text` will be the text on the button and `handler` will be a function that is called when the button is clicked. Make sure
to use a real function and not a lambda if you want to use `this` to refer to the component instance.

If `'ok'` is given, a button that says "Ok" and closes the tooltip will be shown.