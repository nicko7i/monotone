const db = require('../src/db');
const { _onGet, _onPost, _router } = require('../src/router')

const knex = db._knex;
const table = db._tableName;

beforeEach(async (done) => {
  const exists = await knex.schema.hasTable(table);
  if (exists) await knex.schema.dropTable(table);
  await db.createTable();
  done();
});

describe('knex stuff', () => {
  test('null', () => undefined);

  test('null async', async done => done());

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
    expect(result).toHaveProperty('hash', 'frog');
    done();
  });

  test('postHash', async (done) => {
    const result = await db.postHash('adriatic');
    console.log('test postHash: ', result)
    const count = await knex(table).count();
    expect(count[0]['count(*)']).toBe(1);
    expect(result).toBe(1);
    done();
  });

  test('postHash unique', async (done) => {
    await db.postHash('adriatic');
    const result = await db.postHash('adriatic');
    const count = await knex(table).count();
    expect(count[0]['count(*)']).toBe(1);
    expect(result).toBe(1);
    done();
  });

  test('getRecent', async (done) => {
    await db._insertRow('tristan');
    await db._insertRow('isolde');
    await db._insertRow('flagstad');
    const result = await db._getRecent();
    expect(result.number).toBe(3);
    expect(result.hash).toBe('flagstad');
    done();
  });
});

describe('route handler stuff', () => {
  test('onGet with query', async (done) => {
    await db._insertRow('pelican');
    const context = { request: { query: { hash: 'pelican' } } };
    await _onGet(context);
    expect(context.body.number).toBe(1);
    expect(context.body.hash).toBe('pelican');
    done();
  });

  test('onGet with no query', async (done) => {
    await db._insertRow('stork');
    await db._insertRow('sandpiper');
    const context = { request: { query: { } } };
    await _onGet(context);
    expect(context.body.number).toBe(2);
    expect(context.body.hash).toBe('sandpiper');
    done();
  });

  test('onPost with hash', async (done) => {
    const context = { request: { query: { hash: 'glissando' } } };
    await _onPost(context);
    expect(context.body).toBe(1);
    done();
  });
});
