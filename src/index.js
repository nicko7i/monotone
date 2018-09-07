const Koa = require('koa');
const db = require('./db');

const app = new Koa();

function onGet(context) {
  const { hash } = context.request.query;
  if (hash) {
    return db.getByHash(hash)
      .then((result) => {
        context.body = result; /* eslint-disable-line no-param-reassign */
      });
  }
  return db.getRecent();
}

function onPost(context) {
  const { hash } = context.request.query;
  if (hash) {
    return db.postHash(hash)
      .then((result) => {
        context.body = result; /* eslint-disable-line no-param-reassign */
      });
  }
  context.throw(400, 'no hash value provided');
  return null;
}

app.use(async (context) => {
  if (context.path !== '/') context.throw(404);
  if (context.method === 'GET') {
    await onGet(context);
  } else if (context.method === 'POST') {
    await onPost(context.request.query.hash);
  } else {
    context.throw(405);
  }
});

db.createTable()
  .then(() => {
    app.listen(3030);
  });
