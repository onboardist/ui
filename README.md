> Reusable user onboarding UI components

# Components

* Coachmark
* Hotspot
* Tour


# Scheme

1. Export each component individually from a single transpiled file. Tree-shaking on the using module's side will take care of excluding unused components.
2. Use storybook to develop components
3. Bundle with Rollup
4. 