// Includes
const program = require('commander')
const fs = require('fs')
const { promisify } = require('util')

// Global constants
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const DBFILE = __dirname + '/bookings.json';

// Read database at point of entry
const readDatabase = () => readFile(DBFILE, { encoding: 'utf-8' }).then(JSON.parse);

// Function to write to database
const writeDatabase = (newDB) => writeFile(DBFILE, JSON.stringify(newDB, null, 2));

// Function to simplify single read/writes
const addToDB = (pojoData) => readDatabase()
	.then(db => db.push(JSON.stringify(pojoData)))
	.then(db => writeDatabase(db));

program.command('reset')
	.action(() => {
		writeDatabase([]);
	});

program.command('inspect <studentUID> <mentorUID>')
	.action((studentUID, mentorUID) => {
		// Convert input
		studentUID = Number(studentUID);
		mentorUID = Number(mentorUID);

		readDatabase().then((db) => {
			let looseMatches; 
			if (db.length > 0) {
				looseMatches = db.filter(booking => {
					return booking.studentUID === studentUID || booking.mentorUID === mentorUID
				});
			} else looseMatches = [];

			process.stdout.write(JSON.stringify(looseMatches));
		});
	});

program.command('get <bookingUID>')
	.action((bookingUID) => {
		readDatabase().then((db) => {
			let result = db.filter(booking => booking.uid === Number(bookingUID));

			process.stdout.write(JSON.stringify(result));
		});
	});

program.command('new <studentUID> <mentorUID> <uid>')
	.action((studentUID, mentorUID, bookingUID) => {
		readDatabase().then((db) => {
			let newBooking = {
				studentUID: Number(studentUID),
				mentorUID: Number(mentorUID),
				uid: Number(bookingUID),
				maxTime: "60:00.00",
			};

			db.push(newBooking);

			writeDatabase(db);

			process.stdout.write(JSON.stringify({ success: true }));
		});
	});

program.parse(process.argv);

async function createSession(studentUID, mentorUID, agreedTime) {
	const presetMentorRate = 30;

	// 1. Init sessionData
	const sessionData = {
		uid: Date.now(),
		studentUID,
		mentorUID,

		agreedTime,
		elapsedTime: 0,

		notesText: '',
		studentFeedback: -1,

		mentorRate: presetMentorRate,
		mentorPayment: 0,
		mentorPaid: false
	};

	// 2. Write to database
	try {
		const writeResult = await addToDB(sessionData);
		return sessionData;
	} catch (error) {
		console.log(error);
		throw error;
	}
}

async function readSessions(...uids) {
	try {
		const db = await readDatabase();
		if (uids.length > 1)
			return findBy(db, (session) => uids.indexOf(uid) !== -1);
		if (uids.length === 1)
			return findFirstBy(db, (session) => session.uid === uids[0]).result;
		else
			return db;
	} catch (error) {
		console.log(error);
		throw error;
	}
}

async function updateSession(updateData) {
	try {
		const db = await readDatabase();
		const search = findFirstBy(db, (session) => session.uid === updateData.uid);

		let updatedSession = search.result;

		// Overwrite old properties
		Object.keys(updateData).forEach(key => updatedSession[key] = updateData[key]);

		db[search.index] = updatedSession;

		return updatedSession;
	} catch (error) {
		console.log(error);
		throw error;
	}
}

async function deleteSession(uid) {
	try {
		const db = await readDatabase();
		const search = findFirstBy(db, (session) => session.uid === uid);
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
	createSession,
	readSessions,
	updateSession,
	deleteSession
};
