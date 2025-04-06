# h3-fast-compression

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

> Handles compression for H3

## Features

✔️ &nbsp;**Zlib Compression:** You can use zlib compression (brotli, gzip and deflate)

✔️ &nbsp;**Stream Compression:** You can use native stream compressions (gzip, deflate)

✔️ &nbsp;**Compression Detection:** It uses the best compression which is accepted

✔️ &nbsp;**Fast Compression:** Much faster than [h3-compression](https://github.com/CodeDredd/h3-compression) ([see benchmark](#Benchmarks))



## Install

```bash
# Using npm
npm install h3-fast-compression

# Using yarn
yarn add h3-fast-compression

# Using pnpm
pnpm add h3-fast-compression
```

## Usage

```ts
import { createServer } from 'node:http'
import { createApp, eventHandler, toNodeListener } from 'h3'
import { useCompressionStream } from 'h3-fast-compression'

const app = createApp({ onBeforeResponse: useCompressionStream }) // or { onBeforeResponse: useCompression }
app.use(
  '/',
  eventHandler(() => 'Hello world!'),
)

createServer(toNodeListener(app)).listen(process.env.PORT || 3000)
```

Example using <a href="https://github.com/unjs/listhen">listhen</a> for an elegant listener:

```ts
import { createApp, eventHandler, toNodeListener } from 'h3'
import { listen } from 'listhen'
import { useCompressionStream } from 'h3-fast-compression'

const app = createApp({ onBeforeResponse: useCompressionStream }) // or { onBeforeResponse: useCompression }
app.use(
  '/',
  eventHandler(() => 'Hello world!'),
)

listen(toNodeListener(app))
```

## Nuxt 3

If you want to use it in nuxt 3 you can define a nitro plugin.

`server/plugins/compression.ts`
````ts
import { useCompression } from 'h3-fast-compression'

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:response', async (response, { event }) => {
    if (!response.headers?.['content-type']?.startsWith('text/html'))
      return

    await useCompression(event, response)
  })
})
````
> [!NOTE]  
> `useCompressionStream` doesn't work right now in nitro. So you just can use `useCompression`

## Utilities

h3-fast-compression has a concept of composable utilities that accept `event` (from `eventHandler((event) => {})`) as their first argument and `response` as their second.

#### Zlib Compression

- `useGZipCompression(event, response)`
- `useDeflateCompression(event, response)`
- `useBrotliCompression(event, response)`
- `useCompression(event, response)`

#### Stream Compression

- `useGZipCompressionStream(event, response)`
- `useDeflateCompressionStream(event, response)`
- `useCompressionStream(event, response)`

## Benchmarks

For reference, several compression algorithms were tested and compared on a desktop featuring a Core i7-11370H CPU and running Ubuntu 24.04. 
Input is the document of amazon.fr (150kB). Compression ratio is uncompressed size / compressed size, more is better (smaller output).

| Compress method                 | Ratio | Timing     |
| ---------------                 | ------| -----------|
| **h3-fast-compression brotli**  | 7.39  |     14ms   |
| **h3-compression brotli**       | 9.08  |   1240ms   |
| **gzip**                        | 6.82  |     16ms   |
| **deflate**                     | 6.82  |     16ms   |

Although **the h3-fast-compression brotli** header loses some compression ratio, it is much faster and therefore more suitable for dynamic content.

## Related Projects

- [H3](https://github.com/unjs/h3)
- [H3 Compression](https://github.com/CodeDredd/h3-compression)

## License

[MIT](./LICENSE) License © 2023-PRESENT [Timothée Gonnet](https://github.com/TimGonnet)


<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/h3-fast-compression?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/h3-fast-compression
[npm-downloads-src]: https://img.shields.io/npm/dm/h3-fast-compression?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/h3-fast-compression
[bundle-src]: https://img.shields.io/bundlephobia/minzip/h3-fast-compression?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=h3-fast-compression
[license-src]: https://img.shields.io/github/license/TimGonnet/h3-fast-compression.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/TimGonnet/h3-fast-compression/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/h3-fast-compression
