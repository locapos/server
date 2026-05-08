import type { FC } from "hono/jsx";
import { Layout } from "./Layout";

type Props = {
  redirectUri: string;
};

export const Redirect: FC<Props> = ({ redirectUri }) => {
  const script = `setTimeout(function(){location.href='${redirectUri}'},3*1000);`;
  return (
    <Layout>
      <div class="container">
        <div class="bs-callout bs-callout-success">
          <h4>認証に成功しました</h4>
          <p>
            アプリケーションに転送しています...
            転送されない場合は<a href={redirectUri}>ここをクリック</a>してください
          </p>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: script }}></script>
    </Layout>
  );
};
