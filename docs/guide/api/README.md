# Standard Component API

All components share a standard API for attaching them to the DOM and interacting with them.

```html
<div id="foo">
  Let's attach a hotspot to this div on page load.
</div>
```

```javascript
import { Hotspot } from '@onboardist/ui';

document.addEventListener('DOMContentLoaded', () => {
  const h = new Hotspot({ attach: '#foo' });
});
```

## Options

### attach

* Type: `string|Node`
* Default: `undefined`

Either a DOM selector or a DOM node. If a selector is given and the element is not present, Onboardist will wait up to 2 seconds to appear in the DOM.

```js
new Hotspot({ attach: 'input.my-input-class' });

new Hotspot({ attach: document.querySelector('input.my-input-class') });
```