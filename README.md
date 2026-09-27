# lumen-ui

A modern Vue 3 + TypeScript UI component library.

- 🎨 **Org-configurable color theme** — pass any brand color at runtime; the full 50–900 palette is derived automatically
- 🌗 **Dark / light / auto mode**
- 🌍 **Built-in i18n** — English defaults, add or override any locale, zero extra dependencies
- 🧩 **Configurable components** — typed props, slots, and events on everything
- 📦 **Zero runtime dependencies** — only Vue as a peer

## Install

```bash
npm install lumen-ui
```

Requires Vue `^3.3.0` (peer dependency).

## Quick start

```ts
import { createApp } from 'vue'
import { createLumenI18n } from 'lumen-ui'
import 'lumen-ui/dist/style.css'
import App from './App.vue'

const app = createApp(App)

// Optional: install the i18n plugin to set the locale / add translations.
// (Components work without it too — they fall back to English.)
app.use(createLumenI18n({ locale: 'en' }))

app.mount('#app')
```

Then use the theme and i18n helpers anywhere:

```vue
<script setup lang="ts">
import { setTheme, setMode, useI18n } from 'lumen-ui'

// Brand the whole app with your organization's colors:
setTheme({ primary: '#7c3aed', secondary: '#db2777' })

// 'light' | 'dark' | 'auto' (follows the OS preference)
setMode('auto')

const { t } = useI18n()
</script>

<template>
  <!-- or scope a theme to one subtree -->
  <ThemeProvider :colors="{ primary: '#7c3aed' }" mode="dark">
    ...
  </ThemeProvider>
</template>
```

### Theming

`setTheme()` accepts any subset of `{ primary, secondary, success, warning, danger, info }`
as hex colors and derives the full `--lumen-*-50…900` scales plus readable on-colors.
`useTheme()` exposes `mode`, `resolvedMode`, `setTheme()`, `setMode()`, and `resetTheme()`.
`<ThemeProvider>` applies the same to a single subtree via `colors` / `mode` props.

### i18n

```ts
import { createLumenI18n } from 'lumen-ui'

app.use(
  createLumenI18n({
    locale: 'fr',
    messages: {
      fr: { common: { close: 'Fermer' } },
    },
  }),
)
```

In components: `const { t, locale, setLocale, addMessages } = useI18n()`.
Keys are dot-notated (`t('common.close')`), support `{name}` interpolation,
fall back to English, then to the key itself.

## Source layout

```
src/
  components/   # one folder per component: <Name>.vue + <Name>.test.ts + index.ts
  composables/  # shared composables
  theme/        # palette generation, useTheme, ThemeProvider, theme.css tokens
  i18n/         # locale dictionaries, createLumenI18n, useI18n
  styles/       # global styles (reserved)
  index.ts      # public entry
```

## Development

```bash
npm install
npm run build      # library build → dist/ (js + .d.ts + css)
npm test           # vitest
npm run typecheck  # vue-tsc
```

## License

MIT
