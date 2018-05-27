const fs = require('fs');
const express = require('express');
const logger = require('morgan');
const helmet = require('helmet')
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.use(logger('dev'));
app.use(logger('combined', {
	stream: fs.createWriteStream('./server.log')
}));

app.use(helmet());
app.use(helmet.noCache()); // Remove in production. Maybe

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use(session({
	secret: 'ayy'
}));

app.use( (req, res, next) => {
	if (req.headers.origin === 'null')
		res.header('Access-Control-Allow-Origin', 'null')
	else
		res.header('Access-Control-Allow-Origin', 'http://joinmentornet.me');

	res.header('Access-Control-Allow-Credentials', 'true');
	res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');

	next();
});

const basePath = '/mentornet';

app.post(basePath + '/session', (req, res) => {
	// Write to file
	const date = Number(new Date(req.body.booking.date));
	const path = __dirname + '/sessions/' + date + '.json';

	fs.writeFile(path, JSON.stringify(req.body, null, 2));

	res.sendStatus(200);
});

app.listen(8080);
