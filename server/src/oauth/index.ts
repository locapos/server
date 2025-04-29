import { createHono } from "../lib/factory";
import { deleteCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { getSession, setSession } from "../util/session";
import { hash, hmac } from "../lib/hashgen";
import { getAuthUser } from "../util/auth-session";
import { ClientRepository } from "../repositories/ClientRepository";
import { AccessTokenRepository } from "../repositories/AccessTokenRepository";

class BodyElementHandler implements HTMLRewriterElementContentHandlers {
  constructor(private uri: string) { }

  element(element: Element) {
    element.append(
      `<script type="text/javascript">setTimeout(function(){location.href='${this.uri}'},3000);</script>`,
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

  await setSession(c, {
    client_id: clientId,
    redirect_uri: redirectUri,
    state: c.req.query("state"),
  });

  // Proxy asset content
  const asset = await c.env.ASSETS.fetch("http://dummy/oauth/_authorize.html");
  return c.newResponse(asset.body, asset);
});

app.get("/redirect", async (c) => {
  const user = await getAuthUser(c);
  const session = await getSession(c);
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
  deleteCookie(c, "session");

  // render redirect page
  const state = encodeURIComponent(session.state || "");
  const accessToken = existingToken
    ? encodeURIComponent(`${userHash}.${existingToken.token}`)
    : encodeURIComponent(`${userHash}.${tokenHash}`);

  const asset = await c.env.ASSETS.fetch("http://dummy/oauth/_redirect.html");
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
  deleteCookie(c, "session");

  // Proxy content
  const asset = await c.env.ASSETS.fetch("http://dummy/oauth/_failed.html");
  return c.newResponse(asset.body, asset);
});

export { app as oauth };
