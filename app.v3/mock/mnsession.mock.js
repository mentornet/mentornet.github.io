'use strict';

const utils = require('./utils.mock')
const fs = require('fs')
const { getMentor } = require('./mentor.mock');

const exampleData = {
	mentorData: {
		uid: 0,
		name: 'Nessa',
		fee: 20
	},
	studentData: {
		uid: 0,
		name: 'Tom',
		phoneNumber: '0450797678',
		payid: '0450797678'
	},
	bookingData: {
		date: "2018-05-27T06:26:15.435Z",
		startTime: 13,
		length: 1.5
	}
};

const sessionManager = new (function () {
	let sessions = [];

	// Read files in sessions directory
	const sessionsDir = __dirname + '/sessions/';
	const sessionFilePaths = fs.readdirSync(sessionsDir)
		.filter(x => x.indexOf('~') === -1)
		.filter(x => x.indexOf('.swp') === -1);

	sessionFilePaths.forEach(path => {
		sessions.push(
			JSON.parse(
				fs.readFileSync(sessionsDir + path)
			)
		);
	});

	this.sessionStates = {
		// Prefixed with 's' or 'm' to denote student or mentor
		sRequested: 0,
		sCancelled: 1,
		mAccepted: 2,
		mDenied: 3,
		mCancelled: 4,
		mReviewed: 5,
		sReviewed: 6
	};

	this.setSessionState = function (sessionUID, state) {
		sessions[sessionUID].state = state;

		utils.savePDO(__dirname + '/sessions/' + sessionUID + '.json', sessions[sessionUID]);
	};

	this.createSession = function (
		mentorData = exampleData.mentorData,
		studentData = exampleData.studentData,
		bookingData = exampleData.bookingData
	) {
		// Calculate fee
		bookingData.fee = (mentorData.fee) * (bookingData.length);

		let session = {
			mentor: mentorData,
			student: studentData,
			booking: bookingData,
			viewTokens: {
				mentor: utils.getViewToken(),
				student: utils.getViewToken(),
			}
		};

		const index = sessions.push(session) - 1;

		session.uid = index;

		this.setSessionState(index, this.sessionStates.sRequested);

		return index;
	};

	this.getMentorView = function (sessionUID) {
		const session = sessions[sessionUID];
		return {
			uid: session.uid,
			student: {
				phoneNumber: session.student.phoneNumber
			},
			booking: session.booking,
			state: Object.keys(this.sessionStates)[session.state]
		};
	};

	this.getStudentView = function (sessionUID) {
		const session = sessions[sessionUID];

		return {
			uid: session.uid,
			mentor: {
				name: session.mentor.name,
				uid: session.mentor.uid
			},
			booking: session.booking,
			state: Object.keys(this.sessionStates)[session.state]
		};
	};

	this.getByViewToken = (uid, viewToken) => {
		if (sessions.length <= uid)
			throw new Error('No session with that UID exists');

		const session = sessions[uid];

		if (viewToken === session.viewTokens.student) {
			// TODO: update student view token
			return this.getStudentView(uid);
		}

		if (viewToken === session.viewTokens.mentor) {
			// TODO: update mentor view token
			return this.getMentorView(uid);
		}

		throw new Error('Incorrect view token!');
	};
});

async function test () {
	const mentor = await getMentor(0);
	const mentorData = mentor.getSessionRelevantData();

	// Student requests a session that's not at a bunkum time
	const sUID = sessionManager.createSession(
		mentorData,
		exampleData.studentData,
		{
			date: Number(new Date(2018, 4, 28)),
			startTime: 17,
			length: 1
		}
	);
	const sMentorView = sessionManager.getMentorView(sUID);

	// Mentor accepts it
	const { date, startTime, length } = sMentorView.booking;
	try {
		mentor.addSession(sUID, date, startTime, length);
		sessionManager.setSessionState(sUID, sessionManager.sessionStates.mAccepted);

		// Let's take a look at the mentor
		console.log(mentor.getMentorPageData());

		// Student sees this
		console.log(sessionManager.getStudentView(sUID));
	} catch (err) {
		console.log(err);
	}
}

module.exports = sessionManager;
