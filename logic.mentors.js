/*
 * CRUD logic
 * As per Dev Log endpoints
 *	Route: /mentors
 */

const logicUtils = require('./utils.logic')
const dataUtils = require('./utils.data')
const dbPath = './data/payments.json';

module.exports = {
	retrieve: async function retrieve (callingUID) {
		callingUID = Number(callingUID);

		try {
			const users = await dataUtils.readDB(dbPath);
			const mentors = users.filter(user => {
				return user.skills.length
					&& user.isActive
					&& user.isLoggedIn
					&& user.uid !== callingUID
			});
			const publicData = mentors.map(user => ({
				uid: user.uid,
				name: user.name
				// Can always change later e.g.: what if we need their phone #?
			}));
			return publicData;
		} catch (error) {
			logicUtils.handleUncaughtError(error);
		}
	},
};
