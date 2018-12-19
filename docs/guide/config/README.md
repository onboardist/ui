# Configuration

Onboardist UI has some global configuration options you can use to customize it for your site.

```js
Onboardist.UI.configure({
  tours: [
    {
      name: 'test-tour',
      scenarios: [
        [
          ['hotspot', { name: 'h1', 'attach': '#foo' }],
          ['tooltip', { name: 't1', 'attach': 'h1', title: 'Test', content: 'Testing!' }]
        ],
        [
          ['hotspot', { attach: '#logout' }]
        ]
      ],
    },
    {
      name: 'create-user',
      scenarios: [
        [
          ['modal', {
            title: 'Create a New User',
            content: 'Learn how to create a new user'
          }],
        ],
        [
          ['hotspot', { name: 'user-button', attach: 'button.create-user' }],
          ['tooltip', { attach: 'user-button', content: 'Click to create open new user form' }],
        ],
      ]
    }
  ],
});
```