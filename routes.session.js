/*
 * Express server routing
 * As per Dev Log endpoints
 *	Route: /session
 */

const router = require('express').Router();

const routingUtils = require('./utils.routing');
const session = require('./logic.session');
const path = '/session';

router.get(path + '/:uids', (req, res) => {
	routingUtils.performAuthCheck(req, res)
		.then(() => session.retrieve(req.session.uid, req.params.uids))
		.then(sessions => res.json(sessions))
		.catch(error => routingUtils.handleHTTPError(error, res));
});

router.post(path, (req, res) => {
	routingUtils.performAuthCheck(req, res)
		.then(() => session.create(req.body))
		.then(updatedUser => res.json(updatedUser))
		.catch(error => routingUtils.handleHTTPError(error, res));
});


router.put(path + '/:uid/confirm', (req, res) => {
	routingUtils.performAuthCheck(req, res)
		.then(() => session.confirm(req.params.uid, req.session.uid))
		.then(updatedMentor => res.json(updatedMentor))
		.catch(error => routingUtils.handleHTTPError(error, res));
});

router.put(path + '/:uid/complete', (req, res) => {
	routingUtils.performAuthCheck(req, res)
		.then(() => session.complete(req.params.uid, req.session.uid, req.body))
		.then(updatedMentor => res.json(updatedMentor))
		.catch(error => routingUtils.handleHTTPError(error, res));
});

router.put(path + '/:uid/feedback', (req, res) => {
	routingUtils.performAuthCheck(req, res)
		.then(() => session.complete(req.params.uid, req.session.uid, req.body))
		.then(updatedStudent => res.json(updatedStudent))
		.catch(error => routingUtils.handleHTTPError(error, res));
});

router.delete(path + '/:uid/cancel', (req, res) => {
	routingUtils.performAuthCheck(req, res)
		.then(() => session.cancel(req.params.uid, req.session.uid))
		.then(updatedStudent => res.json(updatedStudent))
		.catch(error => routingUtils.handleHTTPError(error, res));
});

router.delete(path + '/:uid/reject', (req, res) => {
	routingUtils.performAuthCheck(req, res)
		.then(() => session.cancel(req.params.uid, req.session.uid))
		.then(updatedMentor => res.json(updatedMentor))
		.catch(error => routingUtils.handleHTTPError(error, res));
});

module.exports = router;
