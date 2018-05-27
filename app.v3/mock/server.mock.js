'use strict';

const utils = require('./utils.mock.js')

const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const logger = require('morgan');
const helmet = require('helmet')

const server = express();

server.use(bodyParser.json());

server.use(logger('dev'));

server.use(helmet());
server.use(helmet.noCache()); // Remove in production. Maybe

server.use(session({
	secret: utils.getRandomHash(),
	cookie: { domain: 'joinmentornet.me' }
}));

server.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "http://joinmentornet.me");
	res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
	res.header("Access-Control-Allow-Credentials", "true");
	res.header("Access-Control-Allow-Headers", "Content-Type,Cache-Control");
	console.log(req.session);
	next();
});

module.exports = server;
