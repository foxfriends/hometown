/*
    Abstraction layer for accessing the database
*/
'use strict';

import pg from 'pg';
import Bluebird from 'bluebird';

import {run} from './run-generator.es6';

Bluebird.promisifyAll(pg);

const PG_CONN = 'postgres://hometown:htisthenewac@localhost/hometown';
const connect = () => { // Manually promisify connect so it works properly
    return new Bluebird((resolve, reject) => {
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
        return Bluebird.resolve(result);
    });
};

