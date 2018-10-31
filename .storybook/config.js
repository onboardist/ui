import { configure } from '@storybook/svelte';

function loadStories() {
  // You can require as many stories as you need.
  require('../stories');
}

configure(loadStories, module);