const db = require('../src/db');

const knex = db._knex;
const table = db._tableName;

describe('knex stuff', () => {
  beforeEach(async (done) => {
    const exists = await knex.schema.hasTable(table);
    if (exists) await knex.schema.dropTable(table);
    await db.createTable();
    done();
  });

  test('create', async (done) => {
    await knex.schema.dropTable(table)
      .then(() => db.createTable())
      .then(() => knex('sqlite_master').where('type', 'table'))
      .then((tables) => {
        expect(tables.map(x => x.name)).toEqual(expect.arrayContaining([table]));
        done();
      });
  });

  test('insert row', async (done) => {
    await db._insertRow('deadcow');
    const count = await knex(table).count();
    expect(count[0]['count(*)']).toBe(1);
    done();
  });

  test('latest build number', async (done) => {
    await db._insertRow('deadcow');
    db.latestBuildNumber()
      .then((result) => {
        expect(result).toBe(1);
        done();
      });
  });

  test('enforce unique hash', async (done) => {
    const tryIt = async () => {
      await db._insertRow('magnificent');
      await db._insertRow('magnificent');
    };
    expect(tryIt()).rejects.toThrow('UNIQUE constraint failed');
    done();
  });

  test('getByHash', async (done) => {
    await db._insertRow('frog');
    const result = await db.getByHash('frog');
    expect(result[0]).toHaveProperty('hash', 'frog');
    done();
  });

  test('postHash', async (done) => {
    await db.postHash('adriatic');
    const count = await knex(table).count();
    expect(count[0]['count(*)']).toBe(1);
    done();
  });

  test('postHash unique', async (done) => {
    await db.postHash('adriatic');
    await db.postHash('adriatic');
    const count = await knex(table).count();
    expect(count[0]['count(*)']).toBe(1);
    done();
  });
});
