import { Context } from "hono";

const host = "http://dummy";

export class AssetsRepository {
  constructor(private context: Context<{ Bindings: Env }>) { }

  private getAsset(path: string) {
    return this.context.env.ASSETS.fetch(`${host}${path}`);
  }

  authorize() {
    return this.getAsset("/oauth/_authorize.html");
  }

  redirect() {
    return this.getAsset("/oauth/_redirect.html");
  }

  failed() {
    return this.getAsset("/oauth/_failed.html");
  }

  config() {
    return this.getAsset("/oauth/_config.html");
  }

  index() {
    return this.getAsset("/index.html");
  }
}
