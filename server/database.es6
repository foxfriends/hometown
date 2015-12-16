'use strict';

import pg from 'pg';
const PG_CONN = 'postgres://hometown:htisthenewac@localhost/hometown';

export const query = (query) => {
    pg.connect(PG_CONN, (err, client, done) => {
        client.query(query, (err, result) => {
          done();
        });
    });
};