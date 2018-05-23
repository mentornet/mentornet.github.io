const bookingData = new (function BookingData() {
	const key = 'bookingData';
	const storage = window.sessionStorage;

	this.store = function store (data) {
		storage.setItem(key, JSON.stringify(data) );
		storage.removeItem('checkoutDetails');
	};

	this.retrieve = function () {
		const data = storage.getItem(key);
		if (!data)
			throw new Error('No booking data saved');
		else {
			let parsedData = JSON.parse(data);

			if (parsedData.date)
				parsedData.date = new Date(parsedData.date);

			return parsedData;
		}
	};
});
