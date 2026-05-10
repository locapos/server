import type { FC } from "hono/jsx";
import { Layout } from "./Layout";

type Props = {
  redirectUri: string;
};

export const Redirect: FC<Props> = ({ redirectUri }) => {
  return (
    <Layout>
      <div class="auth-status auth-status-success">
        <div class="auth-status-heading">
          <i class="bi bi-check-circle-fill auth-status-icon" aria-hidden="true"></i>
          <h2>認証に成功しました</h2>
        </div>
        <p>
          アプリケーションに転送しています…{" "}
          転送されない場合は<a href={redirectUri}>こちら</a>
        </p>
      </div>
    </Layout>
  );
};
