# Configuration

Onboardist UI has some global configuration options you can use to customize it for your site.

```js
Onboardist.UI.configure({
  // TODO: pre-register components for use else-where
  components: [
    {
      name: 'user-tip',
      attach: '#create-user-button',
      content: 'Click here to create a user',
    },
  ],
  tours: [
    {
      name: 'test-tour',
      scenarios: [
        {
          components: [
            { component: 'hotspot', name: 'h1', 'attach': '#foo' },
            { component: 'tooltip', name: 't1', 'attach': 'h1', title: 'Test', content: 'Testing!' },
          ],
        },
        {
          components: [{ component: 'hotspot', attach: '#logout' }],
        },
      ],
    },
    {
      name: 'create-user',
      scenarios: [
        {
          components: [{
            component: 'modal',
            title: 'Create a New User',
            content: 'Learn how to create a new user',
          }],
        },
        {
          components: [{
            component: 'hotspot',
            name: 'user-button',
            attach: 'button.create-user',
            events: {
              click: 'user-tip.show',
            },
          }],
        },
        {
          wait: '#create-user-form',
          components: [{
            component: 'tooltip', attach: 'input[name="email"]', content: 'An invite will be sent to the user at this address'
          }],
        },
      ],
    },
  ],
});
```