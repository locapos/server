import { Context } from "hono";
import { getSignedCookie, setSignedCookie } from "hono/cookie";

type Session = {
  provider: string;
  id: string;
  name: string;
};

type State = {
  state: string;
};

const COOKIE_NAME = "auth";

export const getAuthState = async (c: Context<{ Bindings: Env }>): Promise<State | null> => {
  const cookie = await getSignedCookie(c, c.env.COOKIE_SECRET, COOKIE_NAME);
  if (!cookie) return null;
  try {
    const state = JSON.parse(cookie) as State;
    if (!state.state) {
      return null;
    }
    return state;
  } catch {
    return null;
  }
};

export const setAuthState = async (c: Context<{ Bindings: Env }>, state: string) => {
  await setSignedCookie(c, COOKIE_NAME, JSON.stringify({ state }), c.env.COOKIE_SECRET);
};

export const getAuthUser = async (c: Context<{ Bindings: Env }>): Promise<Session | null> => {
  const cookie = await getSignedCookie(c, c.env.COOKIE_SECRET, COOKIE_NAME);
  if (!cookie) return null;
  try {
    const session = JSON.parse(cookie) as Session;
    if (!session.provider || !session.id || !session.name) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

export const setAuthUser = async (c: Context<{ Bindings: Env }>, session: Session) => {
  await setSignedCookie(c, COOKIE_NAME, JSON.stringify(session), c.env.COOKIE_SECRET);
};
