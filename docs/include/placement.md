### placement

* Type: `Placement`
* Default: `'auto'

The placement is an option that gets passed to [Popper.js](https://popper.js.org/). It can be one of:

* `auto`
* `top`
* `right`
* `bottom`
* `left`

With the additional optional modifiers:

* `-start`
* `-end`

So the placement `top` would put the tooltip off the middle of the top of the reference element, while `top-start` would
put the tooltip at the top-left corner. Conversely, `right` would put it in the middle of the right side, and `right-start`
would put it at the top-right corner.

The default `auto` option puts the tooltip on the side with more space available.