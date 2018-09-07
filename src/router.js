const db = require('./db');

function onGet(context) {
  const { hash } = context.request.query;
  console.log('hash is: ', hash)
  if (hash) {
    console.log('hash true')
    return db.getByHash(hash)
      .then((result) => {
        /* eslint-disable-next-line prefer-destructuring */
        context.body = result; /* eslint-disable-line no-param-reassign */
      });
  }
  console.log('hash false')
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
  if (context.path !== '/') context.throw(404);
  if (context.method === 'GET') {
    await onGet(context);
  } else if (context.method === 'POST') {
    await onPost(context.request.query.hash);
  } else {
    context.throw(405);
  }
}

module.exports = {
  router,
  _onGet: onGet,
  _onPost: onPost,
};
