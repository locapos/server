import type { FC } from "hono/jsx";
import { Layout } from "./Layout";

export const Authorize: FC = () => {
  return (
    <Layout>
      <div class="container">
        <div class="bs-component">
          <div class="well">ログインに使用するサービスを選択してください</div>
        </div>
        <ul class="list-unstyled">
          <li>
            <a class="btn btn-info btn-auth" href="/auth/google">
              <i class="bi bi-google"></i>
              Google
            </a>
          </li>
          <li>
            <a class="btn btn-info btn-auth" href="/auth/microsoft">
              <i class="bi bi-microsoft"></i>
              Microsoft
            </a>
          </li>
          <li>
            <a class="btn btn-info btn-auth" href="/auth/github">
              <i class="bi bi-github"></i>
              GitHub
            </a>
          </li>
          <li>
            <a class="btn btn-info btn-auth" href="/auth/line">
              <i class="bi bi-line"></i>
              LINE
            </a>
          </li>
          <li>
            <a class="btn btn-info btn-auth" href="/auth/apple">
              <i class="bi bi-apple"></i>
              Sign in with Apple
            </a>
          </li>
        </ul>
      </div>
    </Layout>
  );
};
