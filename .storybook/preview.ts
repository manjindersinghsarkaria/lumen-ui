import type { Preview } from '@storybook/vue3'
import { setup } from '@storybook/vue3'
import '../src/theme/theme.css'
import { createLumenI18n } from '../src/i18n'
import { resetTheme, setMode, setTheme } from '../src/theme'
import type { ThemeMode } from '../src/theme'

/**
 * Storybook preview — installs the library's own i18n plugin and wires the
 * toolbar globals to the library's runtime theming API (setMode / setTheme)
 * and locale, so every story can be checked in light/dark mode, any locale,
 * and any org brand color.
 */

const i18n = createLumenI18n()
setup((app) => {
  app.use(i18n)
})

const BRANDS: Record<string, string> = {
  Indigo: '#4f46e5',
  Emerald: '#059669',
  Amber: '#d97706',
  Rose: '#e11d48',
}

const preview: Preview = {
  globalTypes: {
    themeMode: {
      name: 'Mode',
      description: 'Light / dark mode',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'auto', title: 'Auto (system)' },
        ],
      },
    },
    locale: {
      name: 'Locale',
      description: 'UI language',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [{ value: 'en', title: 'English' }],
      },
    },
    brand: {
      name: 'Brand',
      description: 'Organization primary color',
      defaultValue: 'Indigo',
      toolbar: {
        icon: 'paintbrush',
        items: [
          ...Object.keys(BRANDS).map((name) => ({ value: name, title: name })),
          { value: 'default', title: 'Library default' },
        ],
      },
    },
  },
  decorators: [
    (story, context) => {
      setMode(((context.globals.themeMode as ThemeMode) ?? 'light'))
      const hex = BRANDS[context.globals.brand as string]
      if (hex) setTheme({ primary: hex })
      else resetTheme()
      i18n.setLocale((context.globals.locale as string) ?? 'en')
      return story()
    },
  ],
}

export default preview
