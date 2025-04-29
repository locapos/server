import { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

export const decompress: MiddlewareHandler = async (c, next) => {
  const contentEncoding = c.req.header('Content-Encoding');

  if (contentEncoding === 'gzip') {
    try {
      const originalRequest = c.req.raw.clone();
      const decompressedBody = originalRequest.body?.pipeThrough(
        new DecompressionStream('gzip')
      );

      if (!decompressedBody) {
        await next();
        return;
      }

      const newRequest = new Request(originalRequest.url, {
        method: originalRequest.method,
        headers: originalRequest.headers,
        body: decompressedBody,
        redirect: originalRequest.redirect,
        integrity: originalRequest.integrity,
        signal: originalRequest.signal,
        cache: originalRequest.cache,
        credentials: originalRequest.credentials,
        mode: originalRequest.mode,
        referrer: originalRequest.referrer,
        referrerPolicy: originalRequest.referrerPolicy,
      });

      newRequest.headers.delete('Content-Encoding');
      newRequest.headers.delete('Content-Length');
      c.req.raw = newRequest;

      console.log('Decompressed gzipped request body');
    } catch (error) {
      throw new HTTPException(400, {
        message: 'Failed to decompress gzipped request body',
      });
    }
  }

  await next();
};