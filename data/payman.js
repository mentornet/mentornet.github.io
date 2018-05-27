// Includes
const program = require('commander')
const fs = require('fs')
const { promisify } = require('util')
const bcrypt = require('bcrypt')

// Global constants
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const DBFILE = __dirname + '/payments.json';

// Read database at point of entry
let readDatabase = () => readFile(DBFILE, { encoding: 'utf-8' }).then(JSON.parse);

// Function to write to database
let writeDatabase = (newDB) => writeFile(DBFILE, JSON.stringify(newDB, null, 2));

const addToDB = (pojoData) => readDatabase()
	.then(db => db.push(JSON.stringify(pojoData)))
	.then(db => writeDatabase(db));

program.command('reset')
	.action(() => {
		writeDatabase([]);
	});

program.command('inspect')
	.option('-u, --uid <uid>', 'Filter by unique ID')
	.action((com) => {
		readDatabase().then(db => {
			let searchResult = [];
			if (db.length > 0) {
				searchResult = db.filter(user => user.name);

				searchResult.forEach(entry => {
					delete entry.payid;
					delete entry.passwd;
				});

				let { uid } = com;

				if (uid) searchResult = searchResult.filter(x => x.uid == uid);
			}
			process.stdout.write(JSON.stringify(searchResult));
		});
	});

program
	.command('view <payid> <passwd>')
	.option('-s, --hash', 'use passwd hash instead')
	.action((payid, passwd, com) => {
		readDatabase().then(db => {
			let searchResult;
			try {
				searchResult = db.filter(user => user.payid === payid)[0];
			} catch (err) {
				process.stderr.write('Could not find payment account; incorrect credentials');
				return;
			}

			let testMethod = com.hash ? testHash : testPassword;

			if (!testMethod(passwd, searchResult.passwd)) {
				process.stderr.write('Could not find payment account; incorrect credentials');
				return;
			}

			process.stdout.write(JSON.stringify(searchResult));
		})
	});

program.command('new <payid> <passwd>')
	.action((payid, passwd) => {
		readDatabase().then(db => {
			const newEntry = {
				uid: Date.now(),
				payid,
				isActive: true,
				passwd: hashPassword(passwd),
				credit: 0
			};

			db.push(newEntry);

			writeDatabase(db);

			process.stdout.write(JSON.stringify(newEntry));
		});
	});

program.command('clash <payid>')
	.action((payid) => {
		readDatabase().then(db => {
			let searchResult = db.filter(account => account.payid === payid);

			process.stdout.write(searchResult.length ? '1' : '0');
		});
	});

program.command('credit <payid> <amount>')
	.option('-s, --subtract', 'Subtract credit from account')
	.action((payid, amount, cmd) => {
		readDatabase().then(db => {
			for (let i = 0; i < db.length; i++) {
				let entry = db[i];
				if (entry.payid !== payid) continue;

				amount = Number(amount);
				entry.credit += cmd.subtract ? -amount : amount;
			}

			writeDatabase(db);

			console.log('Payment account updated.');
		});
	});

program.command('skills <payid> <passwd> [skills...]')
	.action((payid, passwd, skills) => {
		readDatabase().then(db => {
			let output;
			for (let i = 0; i < db.length; i++) {
				let entry = db[i];
				if (entry.payid !== payid) continue;
				if (!testHash(passwd, entry.passwd)) continue;

				entry.skills = skills;
				output = entry;
			}

			writeDatabase(db);

			process.stdout.write(JSON.stringify(output));
		});
	});

program.command('profile <payid> <passwd> <name> <phone> [skills...]')
	.action((payid, passwd, name, phone, skills) => {
		readDatabase().then(db => {
			let output;
			for (let i = 0; i < db.length; i++) {
				let entry = db[i];
				if (entry.payid !== payid) continue;
				if (!testHash(passwd, entry.passwd)) continue;

				entry.name = name;
				entry.phone = phone;
				entry.skills = skills;

				output = entry;
			}

			writeDatabase(db);

			if (output)
				process.stdout.write(JSON.stringify(output));
			else
				process.stderr.write(JSON.stringify({ message: 'Database error.' }));
		});
	});

program.parse(process.argv);

function hashPassword (password) {
	const HASH_STRENGTH = 12;
	return bcrypt.hashSync(password, HASH_STRENGTH);
}

function testHash (hash, trueHash) {
	return hash === trueHash;
}

function testPassword (password, trueHash) {
	return bcrypt.compareSync(password, trueHash);
}

async function createUser(name, passwd, payid) {
	// 1. Init user
	const userData = {
		uid: Date.now(),
		name,
		passwd: hashPassword(passwd),

		payid,

		isActive: false,
		skills: [],

		sessions: {
			current: -1,
			history: []
		}
	};

	// 2. Write to database
	try {
		const writeResult = await addToDB(userData);
		return userData;
	} catch (error) {
		console.log(error);
		throw error;
	}
}

async function readUsers(...uids) {
	try {
		const db = await readDatabase();
		if (uids.length > 1)
			return findBy(db, (user) => uids.indexOf(user.uid) !== -1);
		if (uids.length === 1)
			return findFirstBy(db, (user) => user.uid === uids[0]).result;
		else
			return db;
	} catch (error) {
		console.log(error);
		throw error;
	}
}

async function updateUser(updateData) {
	try {
		const db = await readDatabase();
		const search = findFirstBy(db, (user) => user.uid === updateData.uid);

		let updatedUser = search.result;

		// Overwrite old properties
		Object.keys(updateData).forEach(key => updatedUser[key] = updateData[key]);

		db[search.index] = updatedUser;

		return updatedUser;
	} catch (error) {
		console.log(error);
		throw error;
	}
}

async function deleteUser(uid) {
	try {
		const db = await readDatabase();
		const search = findFirstBy(db, (user) => user.uid === uid);
		delete db[search.index];
		return 'Success';
	} catch (error) {
		console.log(error);
		throw error;
	}
}

function findBy(array, filterFunc) {
	let result = array.filter(filterFunc);

	if (result.length === 0)
		throw new Error('No matches found');

	return result;
}

function findFirstBy(array, filterFunc) {
	for (var i = 0; i < array.length; i++) {
		const elem = array[i];
		if (filterFunc(elem))
			return { result: elem, index: i };
	}

	throw new Error('No matches found');
}

module.exports = {
	createUser,
	readUsers,
	updateUser,
	deleteUser
};
