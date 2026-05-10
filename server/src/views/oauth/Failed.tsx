import type { FC } from "hono/jsx";
import { Layout } from "./Layout";

export const Failed: FC = () => {
  return (
    <Layout>
      <div class="auth-status auth-status-danger">
        <div class="auth-status-heading">
          <i class="bi bi-x-circle-fill auth-status-icon" aria-hidden="true"></i>
          <h2>認証に失敗しました</h2>
        </div>
        <p>アプリケーションに戻り、認証を最初からやり直してください</p>
      </div>
    </Layout>
  );
};
