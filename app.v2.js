const express = require('express');
const helmet = require('helmet')
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.use(helmet());
app.use(helmet.noCache()); // Remove in production. Maybe
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(session({
	secret: 'ayy'
}));

app.use( (req, res, next) => {
	console.log('\n', req.method, req.originalUrl, req.session.payid, req.body);

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
app.use(basePath, require('./routes.admin'))
app.use(basePath, require('./routes.auth'))
app.use(basePath, require('./routes.user'))
app.use(basePath, require('./routes.mentors'))
app.use(basePath, require('./routes.session'))
app.listen(8080, () => console.log('running'));
