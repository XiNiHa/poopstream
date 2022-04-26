import { defineConfig } from 'vite'
import SolidPlugin from 'vite-plugin-solid'
import Unocss from 'unocss/vite'
import { presetAttributify, presetUno } from 'unocss'

export default defineConfig({
  plugins: [
    SolidPlugin(),
    Unocss({ presets: [presetAttributify(), presetUno()] }),
  ],
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
  },
})
