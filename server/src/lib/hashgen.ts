import { BinaryToTextEncoding, createHash, createHmac } from "node:crypto";

export function hash(
  value: string | null = null,
  algo = "sha256",
  encode: BinaryToTextEncoding = "base64url"
) {
  const hash = createHash(algo);
  hash.update(value || "" + Math.random() + Date.now());
  return hash.digest(encode);
}

export function hmac(
  value: string,
  secret: string,
  algo = "sha256",
  encode: BinaryToTextEncoding = "base64url"
) {
  const hmac = createHmac(algo, secret);
  hmac.update(value || "" + Math.random() + Date.now());
  return hmac.digest(encode);
}

export function uniqueId(env: Env, user: { id: string; provider: string }) {
  const { provider, id } = user;
  return hash(`${env.CRYPTO_HASH_KEY}${provider}${id}`, "sha224");
}
