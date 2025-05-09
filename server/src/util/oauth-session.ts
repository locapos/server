import { Context } from "hono";
import { getSignedCookie, setSignedCookie, deleteCookie } from "hono/cookie";

// OAuthクライアント情報セッション
export type OAuthClientSession = {
  client_id: string;
  redirect_uri: string;
  state?: string;
};

// OAuth認証済みユーザー
export type OAuthUserSession = {
  provider: string;
  id: string;
  name: string;
};

// 外部プロバイダステート
export type OAuthProviderStateSession = {
  state: string;
};

const CLIENT_SESSION_COOKIE = "oauth_client_session";
const USER_SESSION_COOKIE = "oauth_user_session";
const PROVIDER_STATE_COOKIE = "oauth_provider_state_session";

// --- クライアントセッション ---
export const getOAuthClientSession = async (c: Context<{ Bindings: Env }>): Promise<OAuthClientSession | null> => {
  const cookie = await getSignedCookie(c, c.env.COOKIE_SECRET, CLIENT_SESSION_COOKIE);
  if (!cookie) return null;
  try {
    const session = JSON.parse(cookie) as OAuthClientSession;
    if (!session.client_id || !session.redirect_uri) return null;
    return session;
  } catch {
    return null;
  }
};

export const setOAuthClientSession = async (c: Context<{ Bindings: Env }>, session: OAuthClientSession) => {
  await setSignedCookie(c, CLIENT_SESSION_COOKIE, JSON.stringify(session), c.env.COOKIE_SECRET);
};

export const deleteOAuthClientSession = (c: Context) => {
  deleteCookie(c, CLIENT_SESSION_COOKIE);
};

// --- 認証済みユーザー ---
export const getOAuthUserSession = async (c: Context<{ Bindings: Env }>): Promise<OAuthUserSession | null> => {
  const cookie = await getSignedCookie(c, c.env.COOKIE_SECRET, USER_SESSION_COOKIE);
  if (!cookie) return null;
  try {
    const session = JSON.parse(cookie) as OAuthUserSession;
    if (!session.provider || !session.id || !session.name) return null;
    return session;
  } catch {
    return null;
  }
};

export const setOAuthUserSession = async (c: Context<{ Bindings: Env }>, session: OAuthUserSession) => {
  await setSignedCookie(c, USER_SESSION_COOKIE, JSON.stringify(session), c.env.COOKIE_SECRET);
};

export const deleteOAuthUserSession = (c: Context) => {
  deleteCookie(c, USER_SESSION_COOKIE);
};

// --- 外部プロバイダステート ---
export const getOAuthProviderStateSession = async (c: Context<{ Bindings: Env }>): Promise<OAuthProviderStateSession | null> => {
  const cookie = await getSignedCookie(c, c.env.COOKIE_SECRET, PROVIDER_STATE_COOKIE);
  if (!cookie) return null;
  try {
    const session = JSON.parse(cookie) as OAuthProviderStateSession;
    if (!session.state) return null;
    return session;
  } catch {
    return null;
  }
};

export const setOAuthProviderStateSession = async (c: Context<{ Bindings: Env }>, session: OAuthProviderStateSession) => {
  await setSignedCookie(c, PROVIDER_STATE_COOKIE, JSON.stringify(session), c.env.COOKIE_SECRET);
};

export const deleteOAuthProviderStateSession = (c: Context) => {
  deleteCookie(c, PROVIDER_STATE_COOKIE);
};
