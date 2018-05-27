'use strict';

const utils = require('./utils.mock')

const mentor = function (pdo = {
	uid: 0,
	fee: 20,
	name: '',
	units: [],
	skills: [],
	availabilities: {},
	interval: 0.5,
}) {
	let data = pdo;

	if (!data.uid) data.uid = 0;
	data.blockedTimes = data.blockedTimes || [];
	data.pastSessions = data.pastSessions || [];
	data.comingSessions = data.pastSessions || [];

	const buildNextFortnight = () => {
		let dates = [];
		const now = new Date();

		let i = 0;
		while (dates.length < Object.keys(data.availabilities).length * 2) {
			let key = i % 7;
			if (key in data.availabilities) {
				const dateNumber = (now.getDate()-now.getDay())+i;
				if (dateNumber >= now.getDate()) {
					const { from, to, interval } = data.availabilities[key];
					const [ year, month ] = [
						now.getFullYear(),
						now.getMonth(),
					];

					dates.push({
						date: Number(new Date(year, month, dateNumber)),
						times: utils.getTimes(from, to, data.interval)
					});
				}
			}
			i++;
		}

		if (data.dates)
			data.dates = data.dates.concat(dates);
		else
			data.dates = dates;
	};


	const blockTimes = (date, startTime, endTime) => {
		const entry = {
			date,
			times: utils.getTimes(startTime, endTime, data.interval).slice(0, -1)
		};

		if (data.blockedTimes) {
			const existingEntries = data.blockedTimes.filter(x => x.date === entry.date);
			if (existingEntries.length) {
				data.blockedTimes = data.blockedTimes.map(x => {
					if (x.date === entry.date)
						x.times = x.times.concat(entry.times);
					return x;
				});
			} else {
				data.blockedTimes.push(entry);
			}
		} else {
			data.blockedTimes = [ entry ];
		}
	};

	this.addSession = (sessionUID, sessionDate, startTime, length) => {
		const endTime = startTime + length;

		const isBlocked = data.blockedTimes.filter(entry =>  {
			if (entry.date !== sessionDate) return false;
			for (var i in entry.times) {
				let time = entry.times[i];
				if (time > startTime && time < endTime)
					return true;
			}
		}).length > 0;

		if (isBlocked)
			throw new Error(data.name + ' is already booked at that time');

		try {
			const relevantDate = data.dates.filter(entry => {
				return entry.date === sessionDate
			})[0];

			if (startTime < relevantDate.times[0]
				|| endTime > relevantDate.times[relevantDate.times.length-1])
				throw new Error(data.name + ` isn't doing sessions between those times`);
		} catch (error) {
			const dateString = (new Date(sessionDate)).toDateString()
			throw new Error(error.message + '\n' + data.name + ` isn't doing sessions on ${dateString}`);
		}

		data.comingSessions.push(sessionUID);

		blockTimes(sessionDate, startTime, endTime);
		this.save();
	};

	this.hasSession = (uid) => data.comingSessions.indexOf(uid) !== -1;
	this.hadSession = (uid) => data.pastSessions.indexOf(uid) !== -1;

	this.getMentorPageData = () => {
		return {
			uid: data.uid,
			name: data.name,
			fee: data.fee,
			units: data.units,
			skills: data.skills,
			dates: data.dates,
			blockedTimes: data.blockedTimes,
			interval: data.interval
		};
	};

	this.getSessionRelevantData = () => {
		return {
			uid: data.uid,
			name: data.name,
			fee: data.fee,
		}
	};

	this.save = () => {
		const path = __dirname + '/mentors/' + data.uid + '.json';
		utils.savePDO(path, data);
	};

	if (!data.dates) {
		buildNextFortnight();
		this.save();
	}
};

const buildMentorFromUID = (uid) => {
	const path = __dirname + '/mentors/' + uid + '.json';
	return utils.readPDO(path)
		.then(data => new mentor(data))
		.catch(err => {
			throw new Error('Could not retrieve mentor with UID ' + uid);
		});
};

module.exports = {
	mentor,
	getMentor: buildMentorFromUID
};
