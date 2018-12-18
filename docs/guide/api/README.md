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

!!!include(attach.md)!!!

!!!include(backdrop.md)!!!

!!!include(name.md)!!!