'use strict';

const server = require('./server.mock.js')
const utils = require('./utils.mock.js')

const sessionManager = require('./mnsession.mock')
const mentorManager = require('./mentor.mock')

server.get('/session/:uid', (req, res) => {
	const uid = Number(req.params.uid);

	try {
		if (!req.session || !req.session.sessionList)
			throw new Error('No access');

		const index = req.session.sessionList.map(entry => entry.uid).indexOf(uid);

		if (index === -1)
			throw new Error('No access');

		const { viewToken } = req.session.sessionList[index];

		const sessionData = sessionManager.getByViewToken(uid, viewToken);
		res.status(200).send(sessionData);
	} catch (err) {
		res.status(400).send(err.message);
	}
});

server.get('/session/:uid/:viewToken', (req, res) => {
	const uid = Number(req.params.uid);
	const viewToken = req.params.viewToken;

	if (req.session && req.session.sessionList) {
		if (req.session.sessionList.map(x => x.uid).indexOf(uid) !== -1) {
			console.log(uid)
			res.redirect('/session/' + uid);
			return;
		}
	}

	try { 
		const sessionData = sessionManager.getByViewToken(uid, viewToken);

		// Build backend session reference if necessary
		if (!req.session.sessionList) {
			req.session.sessionList = [
				{ uid, viewToken }
			];
		} else {
			const index = req.session.sessionList.map(entry => entry.uid).indexOf(uid);
			if (index === -1) {
				req.sessionList.push({ uid, viewToken });
			} else {
				req.session.sessionList[index].viewToken = viewToken;
			}
		}

		// Give them relevant data
		res.status(200).redirect('/session/' + uid);
	} catch (err) {
		res.status(400).send(err.message);
	}
});

server.get('/mentor/:uid', async function(req, res) {
	const uid = Number(req.params.uid);

	try {
		const m = await mentorManager.getMentor(uid);
		res.json(m.getMentorPageData());
	} catch (err) {
		res.status(400).send(err.message);
	}
});

server.post('/session', async function(req, res) {

	const mentorData = req.body.booking.mentor;
	const studentData = req.body.studentDetails;
	const bookingData = {
		date: Number(new Date(req.body.booking.date)),
		startTime: req.body.booking.startTime,
		length: req.body.booking.length
	};

	const sUID = sessionManager.createSession(
		mentorData,
		studentData,
		bookingData
	);

	res.json(sessionManager.getStudentView(sUID));

});

server.get('/admin/abcde', async function (req, res) {

	const allSessions = sessionManager.getAllSessions().map(
		entry => ({
			mentor: entry.mentor.uid,
			student: entry.student,
			date: (new Date(entry.booking.date)).toDateString(),
			startTime: entry.booking.startTime,
			length: entry.booking.length,
			fee: entry.booking.fee
		})
	);

	res.send(
		JSON.stringify(
			allSessions,
			null,
			2
		).split('\n').join('<br/>')
	);
});

server.listen(8080);

function getViewToken () {
	return (utils.getRandomHash().replace('/', '').replace('\\', '').slice(0, 16));
}
