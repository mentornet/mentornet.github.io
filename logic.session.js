/*
 * CRUD logic
 * As per Dev Log endpoints
 *	Route: /session
 */

const user = require('./logic.user')
const logicUtils = require('./utils.logic')
const dataUtils = require('./utils.data')
const dbPath = './data/bookings.json';

module.exports = {
	retrieve: async function retrieve (userUID, sessionUIDs) {
		try { 
			sessionUIDs = sessionUIDs.split(',').map(Number);
			logicUtils.validateUIDs(...sessionUIDs);

			const sessions = await dataUtils.readDB(dbPath);
			const matches = sessions.filter(session => sessionUIDs.indexOf(session.uid) !== -1);

			if (matches.length === 0)
				throw { statusCode: 406, message: 'No sessions exist with those UIDs' };

				const ownSessions = matches.filter(session => {
					const isStudent = userUID === session.studentUID;
					const isMentor = userUID === session.mentorUID;
					return isStudent || isMentor;
				});

			if (ownSessions.length === 0)
				throw { statusCode: 406, message: 'You\re not authorised to access those sessions' };

			return ownSessions;
		} catch (error) {
			logicUtils.handleUncaughtError(error);
		}
	},
	create: async function create(sessionCreationData) {
		// 1. Validate given text input
		// Liable to change (e.g.: variable session time or pay rate
		try {
			const { studentUID, mentorUID, agreedTime } = sessionCreationData;
			logicUtils.validateUIDs(studentUID, mentorUID);

			const mentor = (await user.retrieve(mentorUID))[0];
			const mentorName = mentor.name;

			const sessionData = {
				uid: Date.now(),
				studentUID: Number(studentUID),

				mentorUID: Number(mentorUID),
				mentorName,

				status: 'verifying',

				agreedTime: Number(agreedTime),
				elapsedTime: 0,

				timestamp: undefined,

				notesText: '',
				studentFeedback: -1,

				feeRate: 30,
				fee: agreedTime * 0.5,
				mentorPaid: false
			};

			const writeSuccess = await dataUtils.pushDB(dbPath, sessionData);
			const updateUser = await user.setCurrentSession(studentUID, sessionData.uid);

			return updateUser;
		} catch (err) {
			logicUtils.handleUncaughtError(err);
		}
	},
	verify: async function verify(sessionUID) {
		try {
			sessionUID = Number(sessionUID);

			let sessions = await dataUtils.readDB(dbPath);
			console.log(sessionUID, sessions);
			const index = logicUtils.getIndexOfUID(sessions, sessionUID);

			let session = sessions[index];

			if (session.status !== 'verifying')
				throw { statusCode: 406, message: `Session ${sessionUID} already verified (${session.status})` };

			session.status = 'requested';

			// TODO: Sending the mentor a message goes here, if we were to automate it

			const writeSuccess = await dataUtils.writeDB(sessions);

			return session;
		} catch (err) {
			logicUtils.handleUncaughtError(err);
		}
	},
	confirm: async function confirm(sessionUID, mentorUID) {
		try {
			// TODO: Input validation
			sessionUID = Number(sessionUID);
			mentorUID = Number(mentorUID);

			let sessions = await dataUtils.readDB(dbPath);
			console.log(sessionUID, sessions);
			const index = logicUtils.getIndexOfUID(sessions, sessionUID);

			let session = sessions[index];

			if (session.mentorUID !== mentorUID)
				throw { statusCode: 401, message: `User ${mentorUID} is not mentoring in session ${sessionUID}` };

			if (session.status !== 'requested')
				throw { statusCode: 406, message: `Session ${sessionUID} is already ${session.status}` };

			session.status = 'confirmed';
			const updatedSession = await dataUtils.writeDB(dbPath, sessions);

			const updatedMentor = await user.setCurrentSession(mentorUID, sessionUID);

			return updatedMentor;
		} catch (err) {
			logicUtils.handleUncaughtError(err);
		}
	},
	complete: async function complete(sessionUID, mentorUID, completionData) {
		try {
			// TODO: Input validation
			sessionUID = Number(sessionUID);
			mentorUID = Number(mentorUID);

			let sessions = await dataUtils.readDB(dbPath);
			const index = logicUtils.getIndexOfUID(sessions, sessionUID);

			let session = sessions[index];

			if (session.mentorUID !== mentorUID)
				throw { statusCode: 401, message: `User ${mentorUID} is not mentoring in session ${sessionUID}` };

			if (session.status !== 'confirmed')
				throw { statusCode: 406, message: `Can't complete session ${sessionUID}: it's ${session.status}, not confirmed` };

			session.status = 'completed'
			Object.keys(completionData).forEach(key => session[key] = completionData[key]);
			const updatedSession = await dataUtils.writeDB(dbPath, sessions);

			const updatedMentor = await user.moveSessionToHistory(mentorUID, sessionUID);
			return updatedMentor;
		} catch (err) {
			logicUtils.handleUncaughtError(err);
		}
	},
	feedback: async function feedback(sessionUID, studentUID, feedbackData) {
		try {
			// TODO: Input validation
			sessionUID = Number(sessionUID);
			mentorUID = Number(mentorUID);

			let sessions = await dataUtils.readDB(dbPath);
			const index = logicUtils.getIndexOfUID(sessions, sessionUID);

			let session = sessions[index];

			if (session.studentUID !== studentUID)
				throw { statusCode: 401, message: `User ${studentUID} is not studenting in session ${sessionUID}` };

			if (session.status !== 'completed')
				throw { statusCode: 406, message: `Can't give feedback on session ${sessionUID}: it's ${session.status}, not completed` };

			Object.keys(completionData).forEach(key => session[key] = completionData[key]);
			const updatedSession = await dataUtils.writeDB(dbPath, sessions);

			const updatedStudent = await user.moveSessionToHistory(studentUID, sessionUID);
			return updatedStudent;
		} catch (err) {
			logicUtils.handleUncaughtError(err);
		}
	},
	cancel: async function cancel(sessionUID, studentUID) {
		try {
			sessionUID = Number(sessionUID);
			studentUID = Number(studentUID);

			let sessions = await dataUtils.readDB(dbPath);
			const index = logicUtils.getIndexOfUID(sessions, sessionUID);

			let session = sessions[index];

			if (session.studentUID !== studentUID)
				throw { statusCode: 401, message: `User ${studentUID} is not studenting in session ${sessionUID}` };

			if (session.status !== 'verifying')
				throw { statusCode: 406, message: `Can't cancel session ${sessionUID}: it's already underway (${session.status})` };

			sessions.splice(index, 1);
			const updatedSession = await dataUtils.writeDB(dbPath, sessions);

			const updatedStudent = await user.setCurrentSession(studentUID, -1);
			return updatedStudent;
		} catch (err) {
			logicUtils.handleUncaughtError(err);
		}
	},
	reject: async function reject(sessionUID, mentorUID) {
		try {
			sessionUID = Number(sessionUID);
			mentorUID = Number(mentorUID);
		} catch (err) {
			logicUtils.handleUncaughtError(err);
		}
	}
};
