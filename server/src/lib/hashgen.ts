import { BinaryToTextEncoding, createHash, createHmac } from "node:crypto";

export function hash(value: string | null = null, algo = "sha256", encode: BinaryToTextEncoding = "base64url") {
  let hash = createHash(algo);
  hash.update(value || ('' + Math.random() + Date.now()));
  return hash.digest(encode);
}

export function hmac(value: string, secret: string, algo = "sha256", encode: BinaryToTextEncoding = "base64url") {
  let hmac = createHmac(algo, secret);
  hmac.update(value || ('' + Math.random() + Date.now()));
  return hmac.digest(encode);
}
