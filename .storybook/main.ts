import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  // In Storybook 9 the essentials (docs, controls, actions) are built in;
  // @storybook/addon-essentials was discontinued after v8.
  addons: [],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
}

export default config
