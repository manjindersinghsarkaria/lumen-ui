import type { Messages } from '../i18n'

/**
 * Default English locale dictionary.
 * Component tasks add their user-facing strings here under their own section.
 */
const en: Messages = {
  common: {
    close: 'Close',
    loading: 'Loading',
    search: 'Search',
    clear: 'Clear',
    noData: 'No data',
    confirm: 'Confirm',
    cancel: 'Cancel',
  },
  button: {
    loading: 'Loading',
  },
  input: {
    clear: 'Clear input',
  },
  textarea: {
    characters: '{count} / {max} characters',
  },
  select: {
    placeholder: 'Select an option',
    search: 'Search options',
    noOptions: 'No options found',
    clear: 'Clear selection',
  },
  alert: {
    close: 'Close alert',
  },
  modal: {
    close: 'Close dialog',
  },
}

export default en
