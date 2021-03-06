const db = require('./db');

function onGet(context) {
  const { hash } = context.request.query;
  if (hash) {
    return db.getByHash(hash)
      .then((result) => {
        /* eslint-disable-next-line prefer-destructuring */
        context.body = result; /* eslint-disable-line no-param-reassign */
      });
  }
  return db.getRecent()
    .then((result) => {
      /* eslint-disable-next-line prefer-destructuring */
      context.body = result; /* eslint-disable-line no-param-reassign */
    });
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

async function router(context) {
  if (context.path !== '/changeset') context.throw(404, 'not found');
  if (context.method === 'GET') {
    await onGet(context);
  } else if (context.method === 'POST') {
    await onPost(context);
  } else {
    context.throw(405, `method ${context.method} not allowed`);
  }
}

module.exports = {
  router,
  _onGet: onGet,
  _onPost: onPost,
};
