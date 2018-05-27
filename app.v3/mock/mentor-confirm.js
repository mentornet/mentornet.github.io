const sessionManager = require('./mnsession.mock')
const { getMentor } = require('./mentor.mock')

async function go () {
	const args = process.argv.slice(2);

	const mUID = Number(args[0]);
	const sUID = Number(args[1]);

	const mentor = await getMentor(mUID);

	if (mentor.hasSession(sUID)) {
		console.error(`Error: ${ mentor.getMentorPageData().name } is already doing session #${sUID}`);
		return -1;
	}

	const sMentorView = sessionManager.getMentorView(sUID);

	const { date, startTime, length } = sMentorView.booking;
	mentor.addSession(sUID, date, startTime, length);
	sessionManager.setSessionState(sUID, sessionManager.sessionStates.mAccepted);

	console.log(
		mentor.getMentorPageData(),
		'\n',
		sessionManager.getStudentView(sUID)
	);
}

go();
