'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinon_chai from 'sinon-chai';
import as_promised from 'chai-as-promised';
chai.use(sinon_chai);
chai.use(as_promised);

import './run-generator.es6';
import './database.es6';