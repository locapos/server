import type { FC } from "hono/jsx";
import { Layout } from "./Layout";

export const Failed: FC = () => {
  return (
    <Layout>
      <div class="container">
        <div class="bs-callout bs-callout-danger">
          <h4>認証に失敗しました</h4>
          <p>アプリケーションに戻り、認証を最初からやり直してください</p>
        </div>
      </div>
    </Layout>
  );
};
