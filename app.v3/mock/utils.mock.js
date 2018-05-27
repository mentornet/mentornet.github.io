const bcrypt = require('bcrypt')
const fs = require('fs')
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const getRandomHash = () => {
	const HASH_STRENGTH = 12;
	const num = Math.random();
	const bcryptCompatibleNum = num.toString();
	const hash = bcrypt.hashSync(bcryptCompatibleNum, HASH_STRENGTH);
	return hash;
};

module.exports = {
	getTimes: (start, end, interval) => {
		const diff = end - start;
		const count = diff / interval;

		let arr = new Array(count + 1);
		for (var i = 0; i < arr.length; i++)
			arr[i] = start + interval * i;

		return arr;
	},
	getRandomHash,
	checkIsEqual: (a, b) => JSON.stringify(a) === JSON.stringify(b),
	savePDO: (path, pdo) => writeFile(path, JSON.stringify(pdo, null, 2)),
	readPDO: (path) => readFile(path).then(JSON.parse),
	getViewToken: () => 
		getRandomHash().replace('/', '').replace('\\', '').slice(0, 16)
}
