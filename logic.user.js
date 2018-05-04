/*
 * CRUD logic
 * As per Dev Log endpoints
 *	Route: /user
 */

const bcrypt = require('bcrypt')

const logicUtils = require('./utils.logic')
const dataUtils = require('./utils.data')
const dbPath = './data/payments.json';

module.exports = {
	loginCheck: async function loginCheck (loginInfo) {
		// TODO: validate login info

		return dataUtils.readDB(dbPath)
			.then(users => {
				const matches = users.filter(user => {
					const sameEmail = user.email === loginInfo.email;
					const sameHash  = bcrypt.compareSync(loginInfo.passwd, user.passwd);
					return sameEmail && sameHash;
				});

				if (matches.length === 0)
					throw { statusCode: 406, message: 'Bad credentials given' };

				return getCleanUserResponse(matches[0]);
			})
			.catch(logicUtils.handleUncaughtError);
	},
	retrieve: async function retrieve (uids, fields) {
		if (uids.split)
			uids = uids.split(',');
		else if (uids instanceof Array === false)
			uids = [ uids ];
		uids = uids.map(Number);

		logicUtils.validateUIDs(...uids);

		return dataUtils.readDB(dbPath)
			.then(users => {
				const matches = users.filter(user => uids.indexOf(user.uid) !== -1);

				if (matches.length === 0)
					throw { statusCode: 406, message: 'No users exist with given UID info' };

				const publicData = matches.map(user => {
					let t = user;

					if (fields) {
						Object.keys(user).forEach(field => {
							if (fields.indexOf(field) === -1)
								delete t[field];
						});
					}

					if (t.passwd) delete t.passwd;

					return t;
				});
				return publicData;
			})
			.catch(error => {
				if (error.statusCode)
					throw error;
				else
					logicUtils.handleUncaughtError(error);
			});
	},
	create: async function create (userCreationData) {
		// 1. Validate given text input
		const { name, passwd, email, phone, payid, skills, rate } = userCreationData;

		if (!email || email.length == 0)
			throw { statusCode: 406, message: 'Give an email to sign up.' }
		if (!name || name.length == 0)
			throw { statusCode: 406, message: 'Give a name to sign up.' }
		if (!passwd || passwd.length == 0)
			throw { statusCode: 406, message: 'Give a password to sign up.' }

		const userData = {
			uid: Date.now(),

			email,
			passwd: hashPassword(passwd),

			name,
			phone,

			payid,
			rate,

			isActive: false,
			isLoggedIn: true,

			skills,

			sessions: {
				current: -1,
				history: []
			}
		};

		return dataUtils.pushDB(dbPath, userData)
			.then(success => getCleanUserResponse(userData))
			.catch(logicUtils.handleUncaughtError);
	},
	update: async function update (userUpdateData) {
		// 1. User input validation
		// ... TODO

		try {
			let db = await dataUtils.readDB(dbPath)
			const index = logicUtils.getIndexOfUID(db, userUpdateData.uid);

			Object.keys(userUpdateData).forEach(key => db[index][key] = userUpdateData[key]);
			
			let writeSuccess = await dataUtils.writeDB(dbPath, db)
		  return getCleanUserResponse(db[index]);
		} catch (err) {
			logicUtils.handleUncaughtError(err);
		}
	},
	setCurrentSession: async function ucs (uid, sessionUID) {
		try {
			let db = await dataUtils.readDB(dbPath)
			const index = logicUtils.getIndexOfUID(db, uid);
			db[index].sessions.current = sessionUID;
			let writeSuccess = await dataUtils.writeDB(dbPath, db)
		  return getCleanUserResponse(db[index]);
		} catch (err) {
			logicUtils.handleUncaughtError(err);
		}
	},
	moveSessionToHistory: async function msth (uid, sessionUID) {
		try {
			let db = await dataUtils.readDB(dbPath)
			const index = logicUtils.getIndexOfUID(db, uid);
			db[index].sessions.current = -1;
			console.log(sessionUID);
			db[index].sessions.history.push(sessionUID);
			let writeSuccess = await dataUtils.writeDB(dbPath, db)
		  return getCleanUserResponse(db[index]);
		} catch (err) {
			logicUtils.handleUncaughtError(err);
		}
	},
	delete: async function d (deletingUID, callingUID) {
		// 1. Validate given UID (could be weird text!)
		deletingUID = Number(deletingUID);
		callingUID = Number(callingUID);
		logicUtils.validateUIDs(deletingUID, callingUID);

		if (deletingUID !== callingUID)
			throw { statusCode: 401, message: `User ${callingUID} can't delete another account` };

		try {
			let users = await dataUtils.readDB(dbPath);
			const index = logicUtils.getIndexOfUID(users, deletingUID);
			users.splice(index, 1);
			return await dataUtils.writeDB(dbPath, users);
		} catch (error) {
			logicUtils.handleUncaughtError(error);
		}
	}
};

function hashPassword (password) {
	const HASH_STRENGTH = 12;
	return bcrypt.hashSync(password, HASH_STRENGTH);
}

function getCleanUserResponse (userData) {
	let x = userData;
	delete x.passwd;
	return x;
}
