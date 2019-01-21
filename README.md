> Reusable user onboarding UI components

[![Build Status](https://travis-ci.com/onboardist/ui.svg?branch=master)](https://travis-ci.com/onboardist/ui)

# Components

* Coachmark
* Hotspot
* Tour


# Development

## Scheme

1. Export each component individually from a single transpiled file. Tree-shaking on the using module's side will take care of excluding unused components.
2. Use storybook to develop components
3. Bundle with Rollup

## Notes

* [ ] Make components generate a unique ID on creation that is used in the `id=""` attribute, so they can be linked together.
  * [ ] Allow passing in Onboardist.UI instances as `attach` arguments. Use the `id` value (`.get('id')`) as the element selector to attach to.