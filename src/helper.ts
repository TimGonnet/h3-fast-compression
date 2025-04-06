import { promisify } from 'node:util'
import zlib from 'node:zlib'
import type { Buffer } from 'node:buffer'
import type { H3Event } from 'h3'
import {
  getRequestHeader,
  getResponseHeader,
  send,
  setResponseHeader,
} from 'h3'

/**
 * Minimum of 1024 bytes are recommend to enable compression, below input string can be smaller than output
 */
const MINIMUM_COMPRESSION_INPUT_SIZE = 1024

export interface RenderResponse {
  body: string | unknown
  statusCode: number
  statusMessage: string
  headers: Record<string, string>
}

export function getAnyCompression(event: H3Event) {
  const encoding = getRequestHeader(event, 'accept-encoding')
  if (encoding?.includes('br'))
    return 'br'

  if (encoding?.includes('gzip'))
    return 'gzip'

  if (encoding?.includes('deflate'))
    return 'deflate'

  return undefined
}

export async function compress(event: H3Event, response: Partial<RenderResponse>, method: 'gzip' | 'deflate' | 'br') {
  const acceptEncoding = getRequestHeader(event, 'accept-encoding')?.includes(method)
  const contentEncoding = getResponseHeader(event, 'content-encoding')
  const responseBody = response.body

  const shouldCompress
    = typeof responseBody === 'string'
    // Do not compress already compressed response (such as assets already compressed by nitro)
    && !contentEncoding
    && responseBody.length >= MINIMUM_COMPRESSION_INPUT_SIZE
    && acceptEncoding

  if (shouldCompress) {
    setResponseHeader(event, 'Content-Encoding', method)

    const compressed: Buffer = await (
      method === 'br'
        ? promisify(zlib.brotliCompress)(responseBody, {
          params: {
            [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
            // 4 is generally more appropriate for dynamic content, faster than gzip and better compression ratio
            [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
          },
        })
        : promisify(zlib[method])(responseBody)
    )

    void send(event, compressed)
  }
}

export async function compressStream(event: H3Event, response: Partial<RenderResponse>, method: 'gzip' | 'deflate') {
  const stream = new Response(response.body as string).body as ReadableStream
  const acceptsEncoding = getRequestHeader(event, 'accept-encoding')?.includes(
    method,
  )

  if (acceptsEncoding) {
    setResponseHeader(event, 'Content-Encoding', method)
    response.body = stream.pipeThrough(new CompressionStream(method))
  }
  else {
    response.body = stream
  }
}
