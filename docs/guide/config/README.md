# Configuration

Onboardist UI has some global configuration options you can use to customize it for your site.

```
Onboardist.UI.configure({
  tours: [
    [
      [
        ['hotspot', { name: 'h1', 'attach': '#foo' }],
        ['tooltip', { name: 't1', 'attach': 'h1', title: 'Test', content: 'Testing!' }]
      ],
      [
        ['hotspot', { attach: '#logout' }]
      ]
    ],
    [
      
    ]
  ]
});
```