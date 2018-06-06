const booking = Vue.component('booking', {
	template: `
		<div class="py-2 pl-3">
			<a href="#" class="row" @click="(event) => {toggleVisibility(); event.preventDefault()}">
				<div class="col-9">
					<p class="mb-2"> {{ dateText }} </p>
				</div>
				<div class="col-3 text-center">
					<small v-show="!isVisible" class="pb-1 fa fa-chevron-right"></small>
					<small v-show="isVisible" class="pb-1 fa fa-chevron-down"></small>
				</div>
			</a>

			<div v-show="isVisible">
				<div class="row justify-content-around align-items-center py-1">
					<div class="col-4">
						<small>Start at </small>
					</div>
					<div class="col-6">
						<select ref="start" @input="updateEndTime" class="w-100 custom-select custom-select-sm"></select>
					</div>
				</div>

				<div class="row justify-content-around align-items-center py-1">
					<div class="col-4">
						<small>Finish at </small>
					</div>
					<div class="col-6">
						<select @change="updateElapsedTime" ref="end" class="w-100 custom-select custom-select-sm"></select>
					</div>
				</div>

				<div class="row justify-content-around align-items-center py-1">
					<div class="col-4">
						<small>Total time</small>
					</div>
					<div class="col-6">
					<p class="text-right mb-0"> {{ formatElapsedTime(length) }} </p>  
					</div>
				</div>

				<div class="row justify-content-around align-items-center mt-2 py-1">
					<div class="col-4 small">Location</div>
					<div class="col-6 small text-right">TBD</div>
				</div>

				<div class="px-2 mt-1">
					<button
					@click="confirmBooking"
					:disabled="!length"
					class="w-100 btn btn-sm btn-primary mt-1">Confirm Booking</button>
				</div>
			</div>
		</div>
	`,
	props: [ 'date', 'times', 'blockedTimes', 'minInterval' ],
	data () {
		return {
			isVisible: false,
			length: ''
		};
	},
	computed: {
		dateText () {
			return this.date.toDateString().slice(0,-5);
		},
		timeInterval () {
			return this.times[1] - this.times[0];
		}
	},
	methods: {
		toggleVisibility () {
			this.isVisible = !this.isVisible;

			if (this.isVisible)
				this.$nextTick(() => {
					this.$el.scrollIntoView({ behavior: 'smooth' });
					this.$refs.start.focus();
				});
		},
		addOption (select, text, value, isDisabled) {
			let optionElem = document.createElement('option');
			optionElem.text = text;
			optionElem.value = value;
			optionElem.disabled = isDisabled || false;
			select.add(optionElem);
		},
		formatHourString(hour) {
			const minutes = (hour - Math.floor(hour))*60;
			hour = Math.floor(hour);

			return hour + ':' + (minutes > 0 ? minutes : '0' + minutes);
		},
		formatElapsedTime(hour) {
			const minutes = (hour - Math.floor(hour))*60;
			hour = Math.floor(hour);

			const minString = minutes > 0 ? minutes + 'min' : '';
			const hourString = hour > 0 ? hour + 'h' : '';

			return hourString + ' ' + minString;
		},
		updateEndTime () {
			const start = this.$refs.start, end = this.$refs.end;
			const chosenStartTime = Number(start.value) +  this.minInterval;

			// Figure out how long they can book til
			let endTime;
			for (var i = 0, t = this.blockedTimes[i]; i < this.blockedTimes.length; i++)
				if (t > chosenStartTime) {
					endTime = t;
					break;
				}
			if (!endTime) endTime = this.times[this.times.length-1];

			const endTimes = this.getValues(chosenStartTime, endTime, this.timeInterval);

			end.disabled = false;

			while (end.options.length)
				end.options.remove(0);

			endTimes.forEach(time => {
				this.addOption(
					end,
					this.formatHourString(time),
					time,
					this.blockedTimes.indexOf(time) !== -1
				);
			});

			this.updateElapsedTime();

			this.$refs.end.focus();
		},
		updateElapsedTime () {
			const diffTime = this.$refs.end.value - this.$refs.start.value;

			this.length = diffTime;
		},
		getValues (start, end, interval = 0.25) {
			const diff = end - start;
			const count = diff / interval;

			let arr = new Array(count + 1);
			for (var i = 0; i < arr.length; i++)
				arr[i] = start + interval * i;

			return arr;
		},

		confirmBooking () {
			this.$emit('confirm-booking', Number(this.$refs.start.value), this.length);
		}
	},
	mounted () {
		// Populate times
		const interval = this.times[1] - this.times[0];
		this.times.slice(0,-1).forEach((time, index) => {
			this.addOption(
				this.$refs.start,
				this.formatHourString(time),
				time,
				this.blockedTimes.indexOf(time) !== -1
			);
		});

		this.updateEndTime();
	}
});
