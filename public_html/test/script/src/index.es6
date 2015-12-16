'use strict';

// Setup sinon-chai
import chai from 'chai';
import sinon from 'sinon-chai';
chai.use(sinon);

// Run the game
import '../../../script/src/index.es6';

// Import tests
import './canvas.es6';
import './socket.es6';
import './input.es6';
import './event.es6';
import './game.es6';
import './sprite.es6';
import './actor.es6';
import './draw.es6';
import './util.es6';