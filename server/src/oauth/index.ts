import { drizzle } from "drizzle-orm/d1";
import { createHono } from "../lib/factory";
import { accessTokensTable, secretsTable } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { deleteCookie, setSignedCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { getSession, setSession } from "../util/session";
import { hash, hmac } from "../lib/hashgen";

class ElementHandler implements HTMLRewriterElementContentHandlers {
  constructor(private uri: string) { }

  element(element: Element) {
    element.append(`<script type="text/javascript">setTimeout(function(){location.href='${this.uri}'},3000);</script>`, { html: true });
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

  // Validate client_id
  const db = drizzle(c.env.SDB);
  const ids = await db.select().from(secretsTable).where(eq(secretsTable.clientId, clientId));
  if (ids.length === 0) throw new HTTPException(400);
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
  // stub user
  const user = { provider: "stub_provider", id: "stub_user", name: "stub_name" };

  const session = await getSession(c)
  const uri = session?.redirect_uri;
  if (!session || !uri) throw new HTTPException(400);
  const prefix = hmac(`${session.client_id}#${user.provider}.${user.id}`, c.env.CRYPTO_HASH_KEY);
  const uniqueHash = hash();
  const token = encodeURIComponent(`${prefix}!${uniqueHash}`);
  const state = encodeURIComponent(session.state || "");
  let redirect = `${uri}#access_token=${token}&token_type=bearer&state=${state}`;
  // 
  const db = drizzle(c.env.SDB);
  const ids = await db.select().from(accessTokensTable).where(eq(accessTokensTable.hash, prefix));
  if (ids.length === 0) {
    await db.insert(accessTokensTable).values({
      hash: prefix,
      token: uniqueHash,
      clientId: session.client_id,
      provider: user.provider,
      id: user.id,
      username: user.name,
      defaultUsername: user.name,
      expireAt: Math.floor(Date.now() / 1000) + 30 * 86400,
    });
  } else {
    // extend token expiration
    await db.update(accessTokensTable).set({
      expireAt: Math.floor(Date.now() / 1000) + 30 * 86400,
    }).where(eq(accessTokensTable.hash, prefix));
    const reusedToken = encodeURIComponent(`${prefix}!${ids[0].token}`);
    redirect = `${uri}#access_token=${reusedToken}&token_type=bearer&state=${state}`;
  }
  // drop session
  deleteCookie(c, "session");
  // render redirect page
  const asset = await c.env.ASSETS.fetch("http://dummy/oauth/_redirect.html");
  const rewriter = new HTMLRewriter()
    .on("body", new ElementHandler(redirect))
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
