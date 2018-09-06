const db = require('../src/db');
const knex = db.knex;

describe('knex stuff', () => {
  test('create', () => {
    db.createTable();
    expect('me').toBe('me');
  });

  test('insert row', () => {
    db.insertRow('deadcow')
    .then((result) => {
      console.log('inserted row: ', result);
    });
  });

  test('latest build number', () => {
    db.latestBuildNumber()
    .then((result) => {
      console.log('latest build number: ', result);
    });
  });
});
