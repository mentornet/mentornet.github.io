/*
 * Express server routing
 * As per Dev Log endpoints
 *	Route: /user
 */

const router = require('express').Router();

const routingUtils = require('./utils.routing');
const user = require('./logic.user');
const path = '/user';

router.get(path + '/:uids', (req, res) => {
	routingUtils.performAuthCheck(req, res)
		.then(() => user.retrieve(req.params.uids))
		.then(users => res.json(users))
		.catch(error => routingUtils.handleHTTPError(error, res));
});

router.post(path, (req, res) => {
	user.create(req.body)
		.then(newUser => {
			Object.keys(newUser).forEach(key => req.session[key] = newUser[key]);
			res.json(newUser);
		})
		.catch(error => routingUtils.handleHTTPError(error, res));
});

router.put(path, (req, res) => {
	routingUtils.performAuthCheck(req, res, () => req.body.uid === req.session.uid)
		.then(() => user.update(req.body))
		.then(updatedUser => res.json(updatedUser))
		.catch(error => routingUtils.handleHTTPError(error, res));
});

router.delete(path + '/:uid', (req, res) => {
	routingUtils.performAuthCheck(req, res)
		.then(() => user.delete(req.params.uid, req.session.uid))
		.then(() => routingUtils.performLogout(req))
		.then(success => res.status(200).send(''))
		.catch(error => routingUtils.handleHTTPError(error, res));
});

module.exports = router;
