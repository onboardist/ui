// / Story about Hotspot
import { storiesOf } from '@storybook/svelte';

import Hotspot from '../src/components/Hotspot.svelte';

storiesOf('Hotspot', module)
  .add('Basic', () => ({
    Component: Hotspot,

    data: {
      rounded: 'wargh'
    },

    on: {
      click: event => {
        console.log('clicked', event);
      }
    }
  }))
  .add('Custom Color', () => ({
    Component: Hotspot,

    data: {
      color: 'red'
    },
  }));