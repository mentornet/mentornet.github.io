'use strict';

const utils = require('./utils.mock.js')

const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')

const server = express();

server.use(bodyParser.json());

server.use(session({
	secret: utils.getRandomHash(),
	cookie: { domain: 'localhost' }
}));

server.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "null");
	res.header("Access-Control-Allow-Credentials", "true");
	res.header("Access-Control-Allow-Headers", "Content-Type");
	console.log(req.session);
	next();
});

module.exports = server;
