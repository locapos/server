import { Hono } from 'hono'
import { api } from './api';
import { oauth } from './oauth';
import { Connection } from './durable-objects/connection';
import { auth } from './auth';

export { Storage } from "./durable-objects/storage";
export { Connection } from "./durable-objects/connection";

const app = new Hono<{ Bindings: Env }>()

app.route('/api', api);
app.route('/oauth', oauth);
app.route('/auth', auth);

app.get('/ws/:hash?', (c) => {
  const hash = c.req.param('hash') || "0";
  return Connection.stub(c.env, hash).fetch(c.req.raw);
});

app.get('/:hash{([a-zA-Z0-9_-]{38}|[a-zA-Z0-9_-]{43})}', async (c) => {
  const asset = await c.env.ASSETS.fetch(`http://dummy/index.html`);
  return c.newResponse(asset.body, asset);
});

export default app
