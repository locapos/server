import { createHono } from "../lib/factory";
import { HTTPException } from "hono/http-exception";
import { hash, hmac } from "../lib/hashgen";
import { newResponse } from "../util/response";
import {
  getOAuthClientSession,
  setOAuthClientSession,
  deleteOAuthClientSession,
  getOAuthUserSession,
  deleteOAuthUserSession
} from "../util/oauth-session";
import { ClientRepository } from "../repositories/ClientRepository";
import { AccessTokenRepository } from "../repositories/AccessTokenRepository";
import { AssetsRepository } from "../repositories/AssetsRepository";

class BodyElementHandler implements HTMLRewriterElementContentHandlers {
  constructor(private uri: string) { }

  element(element: Element) {
    element.append(
      `<script type="text/javascript">setTimeout(function(){location.href='${this.uri}'},3 * 1000);</script>`,
      { html: true }
    );
  }
}

class AnchorElementHandler implements HTMLRewriterElementContentHandlers {
  constructor(private uri: string) { }

  element(element: Element) {
    const href = element.getAttribute("href");
    if (href !== "#-REPLACE-#") {
      return;
    }
    element.setAttribute("href", this.uri);
  }
}

const app = createHono();

app.get("/authorize", async (c) => {
  const responseType = c.req.query("response_type");
  const redirectUri = c.req.query("redirect_uri");
  const clientId = c.req.query("client_id");

  // Validate query parameters
  if (responseType !== "token") throw new HTTPException(400);
  if (!redirectUri) throw new HTTPException(400);
  if (!clientId) throw new HTTPException(400);

  // Validate client_id using ClientRepository
  const clientRepository = new ClientRepository(c.env.SDB);
  const client = await clientRepository.getById(clientId);
  if (!client) throw new HTTPException(400);

  await setOAuthClientSession(c, {
    client_id: clientId,
    redirect_uri: redirectUri,
    state: c.req.query("state"),
  });

  // Proxy asset content
  return newResponse(c, await new AssetsRepository(c).authorize());
});

app.get("/redirect", async (c) => {
  const user = await getOAuthUserSession(c);
  const session = await getOAuthClientSession(c);
  const uri = session?.redirect_uri;
  if (!user || !session || !uri) throw new HTTPException(400);

  const userHash = hmac(`${session.client_id}#${user.provider}:${user.id}`, c.env.CRYPTO_HASH_KEY);
  const tokenHash = hash();

  // Check existing token
  const tokenRepository = new AccessTokenRepository(c.env.SDB);
  const existingToken = await tokenRepository.getByHash(userHash);

  if (!existingToken) {
    // Create new token
    await tokenRepository.create({
      hash: userHash,
      token: tokenHash,
      clientId: session.client_id,
      provider: user.provider,
      id: user.id,
      username: user.name,
      defaultUsername: user.name,
      expireAt: Date.now() + 30 * 86400 * 1000,
    });
  } else {
    // Extend token expiration
    await tokenRepository.extendExpiration(userHash);
  }

  // drop session
  deleteOAuthClientSession(c);
  deleteOAuthUserSession(c);

  // render redirect page
  const state = encodeURIComponent(session.state || "");
  const accessToken = existingToken
    ? encodeURIComponent(`${userHash}.${existingToken.token}`)
    : encodeURIComponent(`${userHash}.${tokenHash}`);

  const asset = await new AssetsRepository(c).redirect();
  const rewriter = new HTMLRewriter()
    .on(
      "body",
      new BodyElementHandler(`${uri}#access_token=${accessToken}&token_type=bearer&state=${state}`)
    )
    .on("a",
      new AnchorElementHandler(`${uri}#access_token=${accessToken}&token_type=bearer&state=${state}`)
    )
    .transform(asset);
  return c.newResponse(rewriter.body, asset);
});

app.get("/failed", async (c) => {
  // drop session
  deleteOAuthClientSession(c);
  deleteOAuthUserSession(c);

  // Proxy content
  return newResponse(c, await new AssetsRepository(c).failed());
});

export { app as oauth };
