/*
 * Express server routing
 * As per Dev Log endpoints
 *	Route: /mentors
 */

const router = require('express').Router();

const routingUtils = require('./utils.routing');
const mentors = require('./logic.mentors');
const path = '/mentors';

router.get(path, (req, res) => {
	routingUtils.performAuthCheck(req, res)
		.then(() => mentors.retrieve(req.session.uid))
		.then(mentors => res.json(mentors))
		.catch(error => routingUtils.handleHTTPError(error, res));
});

module.exports = router;
