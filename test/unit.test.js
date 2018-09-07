const db = require('../src/db');

const knex = db._knex;
const table = db._tableName;

describe('knex stuff', () => {
  beforeEach(async () => {
    // await knex.schema.dropTable(table);
    // await knex.schema.dropTable('sqlite_sequence');
    // await db.createTable();
  });

  test('create', () => {
    knex.schema.dropTable(table)
      .then(() => db.createTable())
      .then(() => knex('sqlite_master').where('type', 'table'))
      .then((tables) => {
        expect(tables.map(x => x.name)).toEqual(expect.arrayContaining([table]));
      });
  });

  test.skip('insert row', async () => {
    await db._insertRow('deadcow');
  });

  test.skip('latest build number', () => {
    db.latestBuildNumber()
      .then((result) => {
        console.log('latest build number: ', result);
      });
  });
});
