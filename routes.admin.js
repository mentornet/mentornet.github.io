/*
 * Express server routing
 * As per Dev Log endpoints
 *	Route: /admin
 */

const router = require('express').Router();

const routingUtils = require('./utils.routing');
const path = '/admin';

const dataUtils = require('./utils.data');
const userDB = './data/payments.json';

router.get(path + '/:secretPassword', (req, res) => {
	if (req.params.secretPassword !== 'ayy-lmao') {
		res.status(401).json({ error: 'Wrong password' });
		return;
	}

	// Build JSON
	dataUtils.readDB(userDB)
		.then(users => res.json(users))
		.catch(error => routingUtils.handleHTTPError(error, res));
});

module.exports = router;
