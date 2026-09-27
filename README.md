# lumen-ui

A modern Vue 3 + TypeScript UI component library.

- 🎨 **Org-configurable color theme** — pass any brand color at runtime; the full 50–900 palette is derived automatically
- 🌗 **Dark / light / auto mode**
- 🌍 **Built-in i18n** — English defaults, add or override any locale, zero extra dependencies
- 🧩 **Configurable components** — typed props, slots, and events on everything
- 📦 **Zero runtime dependencies** — only Vue as a peer
- 📖 **Storybook included** — run `npm run storybook` to browse every component, variant, and state

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

```vue
<script setup lang="ts">
import { Button, Input, Modal } from 'lumen-ui'
import { ref } from 'vue'

const open = ref(false)
const name = ref('')
</script>

<template>
  <Input v-model="name" placeholder="Your name" clearable />
  <Button variant="primary" @click="open = true">Open dialog</Button>
  <Modal v-model:open="open" title="Hello">
    Hello, {{ name || 'stranger' }}!
  </Modal>
</template>
```

## Theming

lumen-ui styles everything with CSS custom properties (`--lumen-*`), so a theme is just
data — swap it at runtime with no rebuild.

### Organization colors

Pass any subset of `{ primary, secondary, success, warning, danger, info }` as hex colors.
The full `--lumen-*-50…900` scales plus readable on-colors are derived automatically
(guaranteed 4.5:1 contrast on mid tones):

```ts
import { setTheme, resetTheme } from 'lumen-ui'

// Brand the whole app with your organization's colors:
setTheme({ primary: '#7c3aed', secondary: '#db2777' })

// Restore the default palette:
resetTheme()
```

### Dark / light / auto mode

```ts
import { setMode, useTheme } from 'lumen-ui'

// 'light' | 'dark' | 'auto' (follows the OS preference)
setMode('auto')

const { mode, resolvedMode } = useTheme() // reactive
```

### Scoping a theme to one subtree

```vue
<ThemeProvider :colors="{ primary: '#7c3aed' }" mode="dark">
  <!-- everything inside uses this theme -->
</ThemeProvider>
```

`useTheme()` also exposes `setTheme()`, `setMode()`, and `resetTheme()` reactively.
All component colors resolve through the tokens, so custom palettes and dark mode
apply to every component automatically.

## i18n

No `vue-i18n` required. Components render English by default; install the plugin to
switch locale or add translations:

```ts
import { createLumenI18n } from 'lumen-ui'

app.use(
  createLumenI18n({
    locale: 'fr',
    messages: {
      fr: { common: { close: 'Fermer' } }, // deep-merged over English defaults
    },
  }),
)
```

Inside components (or setup functions):

```ts
import { useI18n } from 'lumen-ui'

const { t, locale, setLocale, addMessages } = useI18n()

t('common.close')            // dot-notated keys
t('greeting', { name: 'Ada' }) // {name} interpolation
setLocale('fr')               // switch at runtime
addMessages('fr', { common: { close: 'Fermer' } }) // extend later
```

Keys fall back to English, then to the key itself, so a partial translation never breaks rendering.
`useI18n()` also works outside the plugin (plain English fallback).

## Components

All components use the `lumen-` class prefix, typed props, declared emits, useful slots,
and keyboard/ARIA support. Run `npm run storybook` to explore every variant live.

| Component | Key props |
|---|---|
| `Button` | `variant` (primary/secondary/ghost/danger), `size` (sm/md/lg), `loading`, `disabled`, `block` |
| `Input` | `v-model`, `type`, `size`, `clearable`, `error`, `prefix`/`suffix` slots |
| `Textarea` | `v-model`, `autosize` (min/max rows), char counter via `maxlength`, `error` |
| `Select` | `v-model`, `options`, `searchable`, `clearable`, keyboard nav |
| `Checkbox` / `CheckboxGroup` | `v-model`, `indeterminate`, group `options`, `min`/`max` |
| `Radio` / `RadioGroup` | `v-model`, `options`, `name`, `direction` (row/column) |
| `Switch` | `v-model`, `size`, `loading`, `checkedLabel`/`uncheckedLabel` |
| `Badge` | `count`, `max` (overflow → `99+`), `dot`, `variant`, `showZero`, `offset` |
| `Card` | `title`/`subtitle` props, `header`/`body`/`footer` slots, `bordered`, `shadow`, `hoverable` |
| `Alert` | `variant` (info/success/warning/danger), `closable`, `title`, `description` slot |
| `Modal` | `v-model:open`, `size` (sm/md/lg/xl), `header`/`footer` slots, `closeOnEscape`/`closeOnBackdrop`, focus trap |
| `Tooltip` | `content` prop/slot, `placement` (top/bottom/left/right), `trigger` (hover/focus/click), `showDelay`/`hideDelay` |
| `Dropdown` | `items` (icon/disabled/divided/danger), `trigger` slot, `v-model:open`, full keyboard nav |
| `Tabs` | `v-model` active key, `variant` (line/card), `closable`, `tab`/`panel`/`extra` slots |
| `Accordion` | `v-model` open-keys, `accordion` single-open mode, `title`/`content` slots, `expandIconPosition` |
| `Avatar` / `AvatarGroup` | `src` with initials fallback, `size` (named/px), `shape`, `status` dot, group `max` overflow |
| `Progress` | `percent`, `type` (bar/circle), `status`, `showInfo`, `format`, `strokeWidth`, `color` |
| `Spinner` | `size` (sm/md/lg/px), `fullscreen` overlay, `tip` |
| `Pagination` | `v-model:page`/`pageSize`, `total`, `pageSizes`, `showSizeChanger`, `showJumper` |
| `Table` | `columns`, `rows`, `rowKey`, sortable columns, `v-model:selected`, `loading`, `striped`, `bordered`, `cell`/`header` slots |
| `Toast` | `useToast()` (`success`/`error`/`info`/`warning`), `duration`, `placement`, plus `<ToastHost>` |
| `Breadcrumb` | `items`, `separator` prop/slot, `maxItems` collapse |

Also exported: `ThemeProvider`, `useTheme`, `setTheme`, `setMode`, `resetTheme`,
`createLumenI18n`, `useI18n`, and the `version` string.

## Development

```bash
npm install
npm run build           # library build → dist/ (js + .d.ts + css)
npm test                # vitest (full suite)
npm run typecheck       # vue-tsc
npm run storybook       # component explorer on :6006
npm run build-storybook # static Storybook build
```

### Project conventions

- Components live in `src/components/<Name>/` as `<Name>.vue` + `<Name>.test.ts` + `<Name>.stories.ts` + `index.ts`
- `src/index.ts` is the public entry — every export ships typed `.d.ts`
- Styling: plain CSS + CSS custom properties, `lumen-` prefix, no CSS-in-JS
- Shared core: `src/theme/` (palette, `useTheme`, `ThemeProvider`, `theme.css`), `src/i18n/` (locales, plugin, `useI18n`)

## Changelog

### 0.1.0 (unreleased)

- Initial release: 22 components (Button → Breadcrumb), runtime org-color theming with dark/light/auto modes, built-in i18n with English defaults, typed props/slots/emits throughout, unit tests + Storybook stories for every component.

## License

MIT
