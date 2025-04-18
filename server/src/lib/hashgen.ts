import { BinaryToTextEncoding, createHash, createHmac } from "node:crypto";

export function hash(value: string | null = null, algo = "sha256", encode: BinaryToTextEncoding = "base64") {
  let hash = createHash(algo);
  hash.update(value || ('' + Math.random() + Date.now()));
  return hash.digest(encode)
    .replace(/=/g, '')
    .replace(/\//g, '_')
    .replace(/\+/g, '-');
}

export function hmac(value: string | null = null, secret, algo, encode) {
  let hmac = createHmac(algo || 'sha256', secret);
  hmac.update(value || ('' + Math.random() + Date.now()));
  return hmac.digest(encode || 'base64')
    .replace(/=/g, '')
    .replace(/\//g, '_')
    .replace(/\+/g, '-');
}
