import type { FC } from "hono/jsx";
import { Layout } from "./Layout";

export const Config: FC = () => {
  return (
    <Layout>
      <div class="container">
        <div class="bs-component">
          <div class="well">ユーザー名を入力してください</div>
        </div>
        <form method="post" action="/oauth/config">
          <div class="form-group">
            <label for="username">ユーザー名</label>
            <input
              class="form-control"
              type="text"
              name="username"
              id="username"
              required
              autofocus
            />
          </div>
          <button class="btn btn-primary" type="submit">
            設定
          </button>
        </form>
      </div>
    </Layout>
  );
};
