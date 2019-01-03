const UI = require('../src');

test('Can make a modal', () => {
  const modal = new UI.Modal({
    title: 'This is a modal',
    content: 'This is my content',
  });

  console.log(modal);

  expect(modal).toBeTruthy();
});
