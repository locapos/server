
import { DurableObject } from "cloudflare:workers";
import { Location, Storage } from "./storage";
import { isConstructorDeclaration } from "typescript";

export class Connection extends DurableObject<Env> {
  static stub(env: Env, hash: string) {
    const id = env.CONNECTION_DO.idFromName(hash);
    return env.CONNECTION_DO.get(id);
  }

  private connections: Set<WebSocket>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.connections = new Set<WebSocket>();
  }

  async fetch(req: Request) {
    const url = new URL(req.url);
    await this.setName(url.pathname.split("/")[2] || "0");

    const websocketPair = new WebSocketPair();
    const [client, server] = Object.values(websocketPair);

    this.ctx.acceptWebSocket(server);
    this.connections.add(client);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  webSocketError(ws: WebSocket, error: unknown): void | Promise<void> {
    console.error("WebSocket error:", error);
    this.connections.delete(ws);
  }

  webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean): void | Promise<void> {
    console.log("WebSocket closed:", { code, reason, wasClean });
    this.connections.delete(ws);
  }

  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): void | Promise<void> {
    const data = JSON.parse(message.toString());
    if (data.event === "sync") {
      this.sync(ws);
    }
  }

  async sync(socket: WebSocket) {
    const stub = Storage.stub(this.env);
    console.log("sync", await this.getName());
    const locations = await stub.showLocations(await this.getName());
    socket.send(JSON.stringify({ event: "sync", data: locations }));
  }

  async onUpdate(updated: Location) {
    console.log("onUpdate", updated);
    this.broadcast("update", [updated]);
  }

  async onDelete(removed: string) {
    this.broadcast("delete", [removed]);
  }

  private async broadcast(event: string, data: unknown) {
    const payload = JSON.stringify({ event, data });
    for (const ws of this.ctx.getWebSockets()) {
      try {
        console.log("sending to", ws);
        ws.send(payload);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  }

  private async getName() {
    return await this.ctx.storage.get<string>("name") || "0";
  }

  private async setName(name: string) {
    await this.ctx.storage.put("name", name);
  }
}