import { raw } from "hono/html";
import type { FC } from "hono/jsx";

type Props = {
  children?: unknown;
};

export const Layout: FC<Props> = ({ children }) => {
  return (
    <>
      {raw("<!DOCTYPE html>")}
      <html lang="ja">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500&display=swap"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
          />
          <link rel="stylesheet" href="/css/default.css" />
          <title>login — LocaPos</title>
        </head>
        <body>
          <main class="auth-main">
            <div class="auth-shell">
              <a class="auth-brand" href="/">
                <picture>
                  <source srcset="/img/logo-dark.svg" media="(prefers-color-scheme: dark)" />
                  <img src="/img/logo.svg" alt="LocaPos" height="58" />
                </picture>
              </a>
              <div class="auth-card">
                {children}
              </div>
            </div>
          </main>
        </body>
      </html>
    </>
  );
};
