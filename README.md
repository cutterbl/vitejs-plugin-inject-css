# @cxing/vitejs-plugin-inject-css

A plugin for [ViteJs](https://vitejs.dev/) library builds to inject css modules.

By default Vite will already compile CSS modules. But, when building libraries, it does not inject those styles with your components like a standard Rollup build would do. This will add that style injection into your bundled library code.

## Install

```
npm install @cxing/vitejs-plugin-inject-css
```

## Usage

In your `vite.config.js`:

```js
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import injectCss from '@cxing/vitejs-plugin-inject-css';

const isExternal = (id) => !id.startsWith('.') && !path.isAbsolute(id);

export default defineConfig({
  plugins: [react(), injectCss()],
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'myLibrary',
      formats: ['es'],
      fileName: (format) => `my-library.${format}.js`,
    },
    rollupOptions: {
      external: isExternal,
    },
  },
});
```
## Support Us

Did this help you? Help further our Open Source development and buy us a cup of coffee.


[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/O4O1B4MH5)

[Cutter's Crossing](https://cutterscrossing.com)
