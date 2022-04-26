import type { AttributifyAttributes } from '@unocss/preset-attributify'

declare module "solid-js" {
  namespace JSX {
    /* eslint-disable @typescript-eslint/no-empty-interface */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    interface HTMLAttributes<T> extends AttributifyAttributes {}
    /* eslint-enable @typescript-eslint/no-empty-interface */
    /* eslint-enable @typescript-eslint/no-unused-vars */
  }
}
