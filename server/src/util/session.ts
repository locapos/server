import { Context } from "hono";
import { getSignedCookie, setSignedCookie } from "hono/cookie";

type Session = {
  client_id: string;
  redirect_uri: string;
  state?: string;
};

const COOKIE_NAME = "session";

export const getSession = async (c: Context<{ Bindings: Env }>): Promise<Session | null> => {
  const cookie = await getSignedCookie(c, c.env.COOKIE_SECRET, COOKIE_NAME);
  if (!cookie) return null;
  try {
    const session = JSON.parse(cookie) as Session;
    if (!session.client_id || !session.redirect_uri) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

export const setSession = async (c: Context<{ Bindings: Env }>, session: Session) => {
  await setSignedCookie(c, COOKIE_NAME, JSON.stringify(session), c.env.COOKIE_SECRET);
};
