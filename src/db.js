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

async function seedTable() {
  try {
    await latestBuildNumber();
  } catch (e) {
    await insertRow('initial bootstrap row');
  }
  /*
  try {
    return knex('sqlite_sequence')
      .where({
        name: tableName,
      })
      .select('seq')
      .then(result => result[0].seq);
    // return latestBuildNumber();
  } catch (error) {
    return insertRow('initial bootstrap row');
  }
  */
}

function getByHash(hash) {
  return knex(tableName)
    .where({
      hash,
    })
    .select('*')
    .then(result => result[0]);
}

function getByNumber(n) {
  return knex(tableName)
    .where({
      number: n,
    })
    .select('*')
    .then(result => result[0]);
}

function getRecent() {
  return latestBuildNumber()
    .then(n => getByNumber(n));
}

async function postHash(hash) {
  try {
    await insertRow(hash);
    return getByHash(hash)
      .then(result => result.number);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT') {
      return getByHash(hash)
        .then(x => x.number);
    }
    throw error;
  }
}

module.exports = {
  createTable,
  getByHash,
  getRecent,
  latestBuildNumber,
  postHash,
  seedTable,
  _getRecent: getRecent,
  _insertRow: insertRow, // '_*' denotes for testing
  _knex: knex,
  _tableName: tableName,
};
