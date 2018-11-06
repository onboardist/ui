# Standard API

All components share a standard API for attaching them to the DOM and interacting with them.

```javascript
import { Hotspot } from '@onboardist/ui';

document.addEventListener('DOMContentLoaded', () => {
  const h = new Hotspot();
  h.attach('#foo');
});
```