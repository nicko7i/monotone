const Koa = require('koa');
const db = require('./db');
const { router } = require('./router');

const app = new Koa();
const port = process.env.MONOTONE_PORT || 3030;

app.use(router);

db.createTable()
  .then(() => db.seedTable())
  .then(() => {
    app.listen(port);
  });
