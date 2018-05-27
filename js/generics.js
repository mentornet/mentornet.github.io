function getPageUID () {
	return Number(window.location.search.split('=')[1]);
}

function currentPage () {
	return window.location.href.split('/').slice(-1)[0] || 'index.html';
}

function redirect(page) {
	const domain = window.location.href.split('/').slice(0, -1).join('/');
	window.location.assign(domain + '/' + page);
}

function reauthAndReturn () {
	redirect('login.html?redir=' + currentPage());
}

function handleAxiosError (error) {
	let message, status;
	if (error.response) {
		message = error.response.data;
		status = error.response.status;
		if (error.response.status === 401 && currentPage().split('?')[0] !== 'login.html') reauthAndReturn();
	} else if (error.request) {
		if (error.request.status === 0) {
			// Axios timeout
			message = 'The Mentor Net database is offline, please come back later';
		} else { 
			message = error.request;
		}
	} else {
		message = error.message;
	}
	console.error(`${status?status:''} ${message}`);
	return message;
}

const http = axios.create({
	baseURL: 'http://api.joinmentornet.me:8080/', // 'http://localhost:8080/'
	timeout: 3000,
	withCredentials: true
});
