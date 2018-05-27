/*
 * Data handling utility functions
 */

const fs = require('fs');
const {promisify} = require('util')

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

module.exports = {
	readFile: promisify(fs.readFile),
	writeFile: promisify(fs.writeFile),
	readDB: (path) => module.exports.readFile(path, { encoding: 'utf-8'}).then(JSON.parse),
	writeDB: (path, db) => module.exports.writeFile(path, JSON.stringify(db, null, 2)),
	pushDB: (path, item) => {
		return module.exports.readDB(path)
			.then(db => { db.push(item); return db; })
			.then(db => module.exports.writeDB(path, db));
	},

	validateUIDs (uids) {
		uids = uids.split(',');
		const invalidUIDs = uids.map(Number).filter(isNaN);
		if (invalidUIDs.length > 0)
			throw { statusCode: 406, message: `${invalidUIDs.length} invalid UID${invalidUIDs.length > 1 ? 's' : ''} given` };
	}
};
