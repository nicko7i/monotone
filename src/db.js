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
          t.string('hash', 40).unique();
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
      name: tableName,
    })
    .select('seq')
    .then(result => result[0].seq);
}

function getByHash(hash) {
  return knex(tableName)
    .where({
      hash,
    })
    .select('*');
}

function getRecent() {
  return knex('sqlite_sequence')
    .where()
    .select('seq');
}

function postHash(hash) {
  return insertRow(hash);
}

module.exports = {
  createTable,
  getByHash,
  getRecent,
  latestBuildNumber,
  postHash,
  _insertRow: insertRow, // for testing
  _knex: knex, // for testing
  _tableName: tableName,
};
