const dbFile = process.env.MONOTONE_DB_FILE || '/tmp/monotone-db.sqlite';
const knex = require('knex')({
  client: 'sqlite3',
  connection: { filename: dbFile },
  useNullAsDefault: true,
});

const tableName = 'builds';

function createTable() {
  return knex.schema.hasTable(tableName)
    .then((exists) => {
      if (!exists) {
        return knex.schema.createTable(tableName, (t) => {
          t.increments('number').primary();
          t.string('hash', 40).unique();
          t.text('date');
        });
      }
      console.log('table already exists');
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

async function postHash(hash) {
  let result;
  try {
    result = await insertRow(hash);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') return null;
    throw error;
  }
  return result;
}

module.exports = {
  createTable,
  getByHash,
  getRecent,
  latestBuildNumber,
  postHash,
  _insertRow: insertRow, // '_*' denotes for testing
  _knex: knex,
  _tableName: tableName,
};
