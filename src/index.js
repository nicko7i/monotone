const Koa = require('koa');
const db = require('./db');

const app = new Koa();

function onGet(context) {
  const { hash } = context.request.query;
  if (hash) {
    db.getByHash(context, hash);
  } else {
    db.getRecent(context);
  }
}

app.use(async ctx => {
  if (ctx.path !== '/') ctx.throw(404);
  if (ctx.method === 'GET') {
    onGet(ctx);
  } else if (ctx.method === 'POST') {
    db.postHash(ctx, 'ahash');
  } else {
    ctx.throw(405);
  }
});

db.createTable()
  .then(() => {
    app.listen(3030);
});
