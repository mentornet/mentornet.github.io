const vueGenerics = {
	directives: {
		bookingButton (element) {
			const mentorProfilePage = 'mentor-profile.html'
			if (data.booking)
				element.href = mentorProfilePage + '?uid=' + data.booking.mentorUID;
			else
				element.className += ' disabled';
		}
	}
};
