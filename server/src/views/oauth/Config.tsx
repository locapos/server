import type { FC } from "hono/jsx";
import { Layout } from "./Layout";

export const Config: FC = () => {
  return (
    <Layout>
      <hgroup>
        <h1>プロフィール設定</h1>
        <p>ユーザー名を入力してください</p>
      </hgroup>
      <form method="post" action="/oauth/config">
        <label for="username">ユーザー名</label>
        <input type="text" name="username" id="username" required autofocus />
        <button type="submit">設定</button>
      </form>
    </Layout>
  );
};
