const sessionManager = new (function () {
	const sessionKeys = [
		'uid',

		'email',

		'name',
		'phone',

		'currentSession',
		'pastSessions',
		'comingSessions',

		'skills',
		'isActive'
	];

	let data = {};

	sessionKeys.forEach(key => data[key] = JSON.parse(sessionStorage.getItem(key)));

	// build session data
	this.getSessionData = function getSessionData () {
		return http.get('/auth')
			.then(response => {
				buildSessionData(response.data);
			});
	};

	this.setDataFromModel = function buildSessionData (dataRef) {
		Object.keys(dataRef).forEach(key => {
			let value = dataRef[key];
			setSessionKey(key, value);
		});
	}

	function setSessionKey (key, value) {
		data[key] = value;
		sessionStorage.setItem(key, JSON.stringify(value));
	}

	this.getDataKey = (key) => data[key];
	this.getDataSubset = (...keys) => keys.reduce((a,b) => (a[b] = data[b], a), {});

	this.clearData = function clearSessionData () {
		Object.keys(sessionKeys).forEach(key => {
			data[key] = null;
		});
		sessionStorage.clear();
	}

	this.hasData = function hasSessionData () {
		return data.email !== null;
	}
});
