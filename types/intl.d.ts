type Messages = typeof import('./messages/es.json');

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
