/*
 * Express server routing
 * As per Dev Log endpoints
 *	Route: /session
 */

const router = require('express').Router();

const routingUtils = require('./utils.routing');
const user = require('./logic.user');
const path = '/auth';

router.get(path, (req, res) => {
	routingUtils.performAuthCheck(req, res)
		.then(() => user.retrieve(req.session.uid))
		.then(usersArray => usersArray[0])
		.then(user => {
			Object.keys(user).forEach(key => req.session[key] = user[key]);
			res.json(user);
		})
		.catch(error => routingUtils.handleHTTPError(error, res));
});

router.post(path, (req, res) => {
	user.loginCheck(req.body)
		.then(userData => user.update({ uid: userData.uid, isLoggedIn: true }))
		.then(user => {
			Object.keys(user).forEach(key => req.session[key] = user[key]);
			res.json(user);
		})
		.catch(error => routingUtils.handleHTTPError(error, res));
});

router.delete(path, (req, res) => {
	routingUtils.performAuthCheck(req, res)
		.then(() => user.update({ uid: Number(req.session.uid), isLoggedIn: false }))
		.then(() => routingUtils.performLogout(req))
		.then(success => res.send(success))
		.catch(error => routingUtils.handleHTTPError(error, res));
});

module.exports = router;
