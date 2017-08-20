/*
 * Abstraction layer for accessing the database
 */
'use strict';

const { promisifyAll: promisify } = require('bluebird');
const { createHmac } = require('crypto');
const uuid = require('uuid/v4');
const pg = require('pg');
const SQL = require('sql-template-strings');

promisify(pg);

const PG_CONN = 'postgres://hometown:htisthenewac@localhost/hometown';
const HASH_KEY = 'htisthenewac';

// Manually promisify connect so it works properly
function connect() {
  return new Promise((resolve, reject) => {
    pg.connect(PG_CONN, (err, client, done) => {
      if(err) {
        reject(err);
      } else {
        resolve([client, done]);
      }
    });
  });
};

async function query(q) {
  const [client, done] = await connect(PG_CONN);
  const result = await client.queryAsync(q);
  done();
  return result;
};

async function validLogin({username, password}) {
  const errors = {
    username: true,
    password: true,
    error: ''
  };
  try {
    const user = await query(SQL`SELECT password,salt FROM accounts WHERE username = '${username}'`);
    if(!user.rowCount) { errors.username = false; }

    const hash = createHmac('sha512', HASH_KEY);
    hash.write(password + user.rows[0].salt);
    hash.end();
    password = hash.read().toString();

    if(password !== user.rows[0].password) {
      errors.password = false;
    }
  } catch(e) {
    console.error(e);
    errors.error = e;
  } finally {
    return errors;
  }
};

async function createAccount({username, password, email}) {
  const errors = {
    username: '',
    email: '',
    error: ''
  };
  try {
    const user_exists = await query(SQL`SELECT 1 FROM accounts WHERE username = '${username}'`);
    if(user_exists.rowCount) { errors.username = 'This username is in use'; }
    const email_exists = await query(SQL`SELECT 1 FROM accounts WHERE email = '${email}'`);
    if(email_exists.rowCount) { errors.email = 'This email is in use'; }
    if(user_exists.rowCount || email_exists.rowCount) { return errors; }

    const salt = uuid();
    const hash = createHmac('sha512', HASH_KEY);
    hash.write(password + salt);
    hash.end();
    password = hash.read().toString();
    await query(SQL`
      INSERT INTO accounts (username, password, salt, email)
      VALUES ('${username}', '${password}', '${salt}', '${email}')
    `);
  } catch(e) {
    console.error(e);
    errors.error = e;
  } finally {
    return errors;
  }
};

module.exports = { createAccount, validLogin };
