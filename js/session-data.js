const sessionKeys = [
	'payid',
	'name',
	'phone',
	'skills',
	'credit',
	'uid',
	'sessions',
	'isActive'
];

let data = {};

sessionKeys.forEach(key => data[key] = JSON.parse(sessionStorage.getItem(key)));

// build session data
function getSessionData () {
	return http.get('/auth')
		.then(response => {
			buildSessionData(response.data);
		});
}

function buildSessionData (dataRef) {
	Object.keys(dataRef).forEach(key => {
		let value = dataRef[key];
		setSessionKey(key, value);
	});
}

function setSessionKey (key, value) {
	data[key] = value;
	sessionStorage.setItem(key, JSON.stringify(value));
}

function clearSessionData () {
	Object.keys(sessionKeys).forEach(key => {
		data[key] = null;
	});
	sessionStorage.clear();
}

function hasSessionData () {
	return data.payid !== null;
}
