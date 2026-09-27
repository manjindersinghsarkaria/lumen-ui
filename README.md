# lumen-ui

A modern Vue 3 + TypeScript UI component library — built from scratch.

- 🎨 **Org-configurable color theme** — pass any brand color at runtime; the full palette is derived automatically
- 🌗 **Dark / light / auto mode**
- 🌍 **Built-in i18n** — English defaults, add or override any locale, zero extra dependencies
- 🧩 **Configurable components** — typed props, slots, and events on everything
- 📦 **Zero runtime dependencies** — only Vue as a peer

> 🚧 Under active construction (built by an autonomous build loop). Install and usage docs land as the foundation completes.

## Install

```bash
npm install lumen-ui
```

## Quick start

```ts
import { createApp } from 'vue'
import LumenUI from 'lumen-ui'
import 'lumen-ui/dist/style.css'

createApp(App).use(LumenUI).mount('#app')
```

## Theming, i18n, components

Full guides coming with the foundation tasks. See `src/` for the source layout:

```
src/
  components/   # one folder per component: <Name>.vue + <Name>.test.ts + index.ts
  composables/  # useTheme, useI18n, ...
  theme/        # palette generation, ThemeProvider
  i18n/         # locale dictionaries, createLumenI18n
  styles/       # theme.css design tokens
  index.ts      # public entry
```

## License

MIT
