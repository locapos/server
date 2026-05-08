import type { FC } from "hono/jsx";

type Props = {
  children?: any;
};

export const Layout: FC<Props> = ({ children }) => {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href="/components/Umi/dist/css/bootstrap.min.css" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100..900&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />
        <link rel="stylesheet" href="/css/default.css" />
        <title>login</title>
      </head>
      <body>
        <header>
          <div class="navbar navbar-default navbar-static-top">
            <div class="container">
              <div class="navbar-header">
                <a class="navbar-brand">LocaPos</a>
                <p class="navbar-text">ログイン</p>
              </div>
            </div>
          </div>
        </header>
        {children}
        <div id="message" class="modal fade">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <button class="close" type="button" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
                <h4 id="modal-title" class="modal-title"></h4>
              </div>
              <div id="modal-body" class="modal-body"></div>
            </div>
          </div>
        </div>
        <footer class="footer">
          <div class="container">
            <p class="text-muted">
              <a id="about" href="#">
                about LocaPos
              </a>
            </p>
          </div>
        </footer>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.min.js" defer></script>
        <script src="/components/Umi/dist/js/bootstrap.min.js" defer></script>
        <script src="/js/auth.js" defer></script>
      </body>
    </html>
  );
};
