/*
 * Express server routing utility functions
 */

async function performAuthCheck (req, res, specificAuthCheck = () => true) {
	// This boolean check is liable to change
	const isAuthorised = req.session
		&& req.session.uid
		&& specificAuthCheck()
		|| false;

	if (isAuthorised)
		return 
	else
		throw { statusCode: 401, message: 'Unauthorised' };
}

function performLogout(req) {
	return new Promise((resolve, reject) => {
		req.session.destroy((err) => {
			if (err) reject(err);
			resolve('Successfully logged out.');
		});
	});
}

module.exports = {
	performAuthCheck,
	performLogout,

	handleHTTPError(httpError, res) {
		const statusCode = httpError.statusCode || 500;
		const message = httpError.message;
		console.log(`${statusCode} Error: ${message}`);
		res.status(statusCode).send(message);
	}
};
