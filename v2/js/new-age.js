(function($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 48)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 54
  });

  // Collapse Navbar
  var navbarCollapse = function() {
    if ($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-shrink");
    } else {
      $("#mainNav").removeClass("navbar-shrink");
    }
  };
  // Collapse now if page is not at top
  navbarCollapse();
  // Collapse the navbar when page is scrolled
  $(window).scroll(navbarCollapse);

	// Randomise study goal
	var unitCodes = [
		'ECC1000',
		'FIT2085',
		'ETC2410',
		'BTC1110',
		'MKC2500',
		'ENG2005',
		'MTH1020'
	];

	var studyCodes = [
		'maths',
		'essay writing',
		'referencing',
		'report writing',
		'time management',
		'excel skills',
		'MATLAB',
		'computer science'
	];

	var names = [
		'Jack',
		'Jane',
		'Mohammed',
		'Mason',
		'Candice',
		'Alex',
		'Harper',
		'Carter',
		'Aurora',
		'Julian'
	];

	function choose(arr) {
		return arr[ Math.floor(Math.random()*arr.length) ];
	}

	$('#study-code')[0].placeholder = 'Unit code or topic: ' + (Math.random() > 0.5 ? choose(unitCodes) : choose(studyCodes));
	$('#study-name')[0].placeholder = choose(names);

})(jQuery); // End of use strict
