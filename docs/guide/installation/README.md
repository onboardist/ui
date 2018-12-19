# Installation

```shell
$ npm install --save @onboardist/ui
```

## Usage

Onboardist creates the global variable `Onboardist.UI` that has global options and methods. You can also import it:

```js
// Global variable

Onboardist.UI.configure(...);

// Import
import { default as OnboardistUI } from '@onboardist/ui';

OnboardistUI.configure(...)
```

Import and use individual components:

```js
import { Hotspot, Tooltip } from '@onboardist/ui';

const hotspot = new Hotspot({ attach: '#foo' });
const tooltip = new Tooltip({ attach: '#bar' });
```