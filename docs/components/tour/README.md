# Tour

A tour is a special component that combines multiple sub-components into a series of steps. Technically it is a
state machine. Each step in the tour is an independent state and each state defines multiple ways to transition to the
next, previous, or an arbitrary state.

Example:

1. User clicks on a help button which starts the tour. A modal opens in the middle of the screen with a "Next" button in it.
2. Clicking the next button opens a hotspot with a tooltip next to it. This also has a "Next" button
3. Clicking THAT next button opens yet another hotspot with another tooltip, etc, etc.

# API

```js
tour = new Onboardist.UI.Tour(
  [
    [
      Onboadist.UI.Modal({
        title: 'Getting Started',
        content: 'Take a quick tour of the system',
      }),
    ],
    [
      Onboardist.UI.Hotspot({ attach: '.links a[href="/guide/"]', name: 'hot1' }),
      Onboardist.UI.Tooltip({ attach: 'hot1', content: 'Try the guide' }),
    ],
  ],
  {
    showNext: true,
    showPrev: true,
  },
);

tour.start();
```