const ids = [
	'select-start',
	'select-end',
	'span-elapsed-time'
];

const [ start, end, elapsed ] = ids.map(x => document.getElementById(x));

const addOption = (selectElem, optionText, optionValue) => {
	let optionElem = document.createElement('option');
	optionElem.text = optionText;
	optionElem.value = optionValue;
	selectElem.add(optionElem);
};

const clearOptions = (selectElem) => {
	while (selectElem.options.length)
		selectElem.options.remove(0);
};

const getIntervals = (startTime, endTime) => {
	const INTERVAL_SPAN = 0.25; // 15min
	const diffTime = endTime - startTime;
	const numIntervals = diffTime / INTERVAL_SPAN;

	let intervalsArray = new Array(numIntervals + 1);
	for (var i = 0; i < intervalsArray.length; i++)
		intervalsArray[i] = startTime + INTERVAL_SPAN * i;

	return intervalsArray;
};

const formatHour = (hour) => {
	const minutes = (hour - Math.floor(hour))*60;
	hour = Math.floor(hour);

	return hour + ':' + (minutes > 0 ? minutes : '0' + minutes);
};

const formatHourFancy = (hour) => {
	const minutes = (hour - Math.floor(hour))*60;
	hour = Math.floor(hour);

	const minString = minutes > 0 ? minutes + 'min' : '';
	const hourString = hour > 0 ? hour + 'h' : '';

	return hourString + ' ' + minString;
};

const buildTimeOptions = (selectElem, timeValues) => {
	timeValues.forEach(time => {
		const timeString = formatHour(time);
		addOption(selectElem, timeString, time);
	});
};

const updateEndTimes = () => {
	const chosenStartTime = Number(start.value);
	const endTime = Number(start.options[start.options.length-1].value);

	const endTimes = getIntervals(chosenStartTime, endTime).slice(2);

	end.disabled = false;
	clearOptions(end);
	buildTimeOptions(end, endTimes);
	updateElapsedTime();
};

const updateElapsedTime = () => {
	const diffTime = end.value - start.value;

	elapsed.innerText = formatHourFancy(diffTime);
};

start.addEventListener('input', updateEndTimes);
end.addEventListener('change', updateElapsedTime);

buildTimeOptions(start, getIntervals(13, 18));
