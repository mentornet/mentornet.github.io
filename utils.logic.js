
module.exports = {
	handleUncaughtError (error) {
		if (!error.statusCode)
			throw { statusCode: 500, message: error.message };
		else
			throw error;
	},
	validateUIDs (...uids) {
		const invalidUIDs = uids.map(Number).filter(isNaN);
		if (invalidUIDs.length > 0)
			throw { statusCode: 406, message: `${invalidUIDs.length} invalid UID${invalidUIDs.length > 1 ? 's' : ''} given` };
	},
	getIndexOfUID (db, uid) {
		const uids = db.map(element => element.uid);
		const index = uids.indexOf(uid);
		if (index === -1)
			throw { statusCode: 406, message: 'Cannot find given UID in database' };
		return index;
	}
};
