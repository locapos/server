import type { FC } from "hono/jsx";
import { Layout } from "./Layout";

export const Authorize: FC = () => {
  return (
    <Layout>
      <hgroup>
        <h1>ログイン</h1>
        <p>ログインに使用するサービスを選択してください</p>
      </hgroup>
      <div class="auth-buttons">
        {/* biome-ignore lint/a11y/useSemanticElements: Pico CSS button-styled link pattern */}
        <a role="button" href="/auth/google">
          <i class="bi bi-google" aria-hidden="true"></i>
          Google
        </a>
        {/* biome-ignore lint/a11y/useSemanticElements: Pico CSS button-styled link pattern */}
        <a role="button" href="/auth/microsoft">
          <i class="bi bi-microsoft" aria-hidden="true"></i>
          Microsoft
        </a>
        {/* biome-ignore lint/a11y/useSemanticElements: Pico CSS button-styled link pattern */}
        <a role="button" href="/auth/github">
          <i class="bi bi-github" aria-hidden="true"></i>
          GitHub
        </a>
        {/* biome-ignore lint/a11y/useSemanticElements: Pico CSS button-styled link pattern */}
        <a role="button" href="/auth/line">
          <i class="bi bi-line" aria-hidden="true"></i>
          LINE
        </a>
        {/* biome-ignore lint/a11y/useSemanticElements: Pico CSS button-styled link pattern */}
        <a role="button" href="/auth/apple">
          <i class="bi bi-apple" aria-hidden="true"></i>
          Sign in with Apple
        </a>
      </div>
    </Layout>
  );
};
