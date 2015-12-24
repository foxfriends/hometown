/*
    Abstraction layer for accessing the database
*/
'use strict';

import pg from 'pg';
import {promisifyAll as promisify} from 'bluebird';
import {v4 as uuid} from 'node-uuid';
import {createHmac} from 'crypto';

import {run} from './run-generator.es6';

promisify(pg);

const PG_CONN = 'postgres://hometown:htisthenewac@localhost/hometown';
const HASH_KEY = 'htisthenewac';

const connect = () => { // Manually promisify connect so it works properly
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

const query = (query) => {
    return run(function*() {
        const [client, done] = yield connect(PG_CONN);
        const result = yield client.queryAsync(query);
        done();
        return result;
    });
};

export const validLogin = ({username, password}) => {
    return run(function*() {
        const errors = {
            username: true,
            password: true,
            error: ''
        };
        try {
            const user = yield query(`SELECT password,salt FROM accounts WHERE username = '${username}'`);
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
    });
};

export const createAccount = ({username, password, email}) => {
    return run(function*() {
        const errors = {
            username: '',
            email: '',
            error: ''
        };
        try {
            const user_exists = yield query(`SELECT 1 FROM accounts WHERE username = '${username}'`);
            if(user_exists.rowCount) { errors.username = 'This username is in use'; }
            const email_exists = yield query(`SELECT 1 FROM accounts WHERE email = '${email}'`);
            if(email_exists.rowCount) { errors.email = 'This email is in use'; }
            if(user_exists.rowCount || email_exists.rowCount) { return errors; }

            const salt = uuid();
            const hash = createHmac('sha512', HASH_KEY);
            hash.write(password + salt);
            hash.end();
            password = hash.read().toString();
            yield query(`   INSERT INTO accounts (username, password, salt, email)
                            VALUES ('${username}', '${password}', '${salt}', '${email}')`);
        } catch(e) {
            console.error(e);
            errors.error = e;
        } finally {
            return errors;
        }
    });
};

export default {createAccount, validLogin};