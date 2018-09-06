const dbFile = process.env.MONOTONE_DB_FILE || '/tmp/monotone-db.sqlite';
const knex = require('knex')({
  client: 'sqlite3',
  connection: { filename: dbFile },
  useNullAsDefault: true,
});

const tableName = 'builds';

function createTable() {
  knex.schema.hasTable(tableName)
    .then((exists) => {
      if (!exists) {
        return knex.schema.createTable(tableName, (t) => {
          t.increments('number').primary();
          t.string('hash', 40);
          t.text('date');
        });
      }
      return null;
    });
}

function insertRow(hash) {
  return knex(tableName).insert({
    hash,
    date: knex.fn.now(),
  });
}

function latestBuildNumber() {
  return knex('sqlite_sequence')
  .where({
    name: 'builds',
  })
  .select('seq')
  .then((result) => {
    return result[0].seq;
  });
}

function getByHash(context, hash) {
  if (!hash) context.throw(400, 'no hash value');
  context.body = `got by hash ${hash}`;
}

function getRecent(context) {
  context.body = 'got recent';
  knex('sqlite_sequence')
    .where()
    .select('seq')
}

function postHash(context, hash) {

}

module.exports = {
  createTable,
  getByHash,
  getRecent,
  insertRow,  // for testing
  knex, // for testing
  latestBuildNumber,
  postHash,
}
