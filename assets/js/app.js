const log = (msg) => console.log(msg);

const delay = (ms, func) => setTimeout(func, ms);

const sendEvent = (category, action, label = "", value = undefined) =>
	ga('send', 'event', category, action, label, value);

// Retina.configure {retinaImageSuffix: "_2x"}

const setCurrentSlide = (slider, slide) => {
	const inner = $(slider).find(".images")

	const slideWidth = parseInt($(slider).data('slide-width'));
	const newOffset = slide * slideWidth

	inner.css('left', -newOffset + "px");

	$(slider).data("current-slide", slide);

	const $bubbles = $(slider).find('.indicator .bubble');
	const $active = $bubbles[slide];

	$bubbles.removeClass('active');
	$($bubbles[slide]).addClass('active');
};


const nextSlide = () => {
	$(".slider").each(function () {
		const inner = $(this).find(".images");

		const slides = inner.children().length
		const slideWidth = $(this).data('slide-width');

		const currentOffset = parseInt((inner.css('left')).replace(/[^-\d\.]/g, ''));
		const currentSlide = $(this).data('current-slide');

		const maxOffset = (slides-1) * slideWidth

		let nextSlide = 0
		if(Math.abs(currentOffset) < maxOffset) {
			nextSlide = currentSlide + 1
		}

		setCurrentSlide($(this), nextSlide);
	});
};
		

const updateSlider = () => {
	const slider = $(".slider")

	slider.each(function() {
		const slideWidth = parseInt(($(this).css('width')).replace(/[^-\d\.]/g, ''));
		const slideHeight = parseInt(($(this).css('height')).replace(/[^-\d\.]/g, ''));

		$(this).data('slide-width', slideWidth);
		$(this).data('slide-height', slideHeight);

		setCurrentSlide(this, $(this).data("current-slide"));
	});
};

let slideTimer = null;
let runThis = nextSlide;

const scheduleSlideChange = () => {
	clearInterval(slideTimer);
	slideTimer = setInterval(runThis, 5000);
};

const initSlider = () => {
	updateSlider()
	scheduleSlideChange()

	$(window).bind('resize', () => updateSlider());
	$(".slider .indicator .bubble").click((e) => {
		e.preventDefault()
		scheduleSlideChange()
		setCurrentSlide($(this).closest('.slider'), $(this).index());
	});
};

const iframe = $('#spilhuset')[0];
const player = $(iframe);

const showVideo = () => {
	$('.header-container .header').fadeOut()
	$('.header-container .video-overlay').fadeOut()
	$('.header-container .navigation').fadeOut()
	$('#spilhuset').fadeIn()

	player.api('play');
};

const hideVideo = (id) => {
	$('.header-container .header').fadeIn()
	$('.header-container .video-overlay').fadeIn()
	$('.header-container .navigation').fadeIn()
	$('#spilhuset').fadeOut()

	player.element.src = player.element.src
};

// player.addEvent('ready', () => {
// 	player.addEvent('pause', hideVideo);
// 	player.addEvent('finish', hideVideo);
// });

const toggleDescription = (box) => {
	const bWidth = $(window).width();
	let $ele = $('.descriptions .model.' + box);
	if (bWidth < 1000) {
		$ele = $('.pricing .model.' + box + ' .details');
	}

	const $button = $(".pricing .model."+box+" .learn-more");

	if ($ele.hasClass('open')) {
		$ele.removeClass('open');
		delay(200, () =>  $button.html('Learn more'));
	} else {
		$ele.addClass('open');
		delay(200, () => $button.html('Close'));
	}
};

const stickyMenu = () => {
	const $navigation = $(".navigation");
	let origin = 0
	if ($navigation.hasClass('topstick')) {
		origin = 0
	}

	if ($(window).scrollTop() > origin) {
		$navigation.addClass("sticky");
	} else {
		$navigation.removeClass("sticky");
	}
};

Modernizr.addTest('firefox', () => {
	return !!navigator.userAgent.match(/firefox/i);
});

const menuItems = $('.navigation a.scrollbased');
const scrollItems = menuItems.map(function(index, ele) {
	const item = $(ele).attr('href')
	if (item.length) {
		return item;
	}

	return null;
});

$(menuItems).on('click', function(e) {
	e.preventDefault();
	const href = $(this).attr('href');
	let offsetTop = 0
	if (href !== '#') {
		offsetTop = $(href).offset().top;
	}

	scrollTo(offsetTop);
});

const scrollTo = (offset, callback = null) => {
	let s = "html, body";
	if (Modernizr.firefox) {
		s = 'html';
	}

	$(s).stop().animate({scrollTop: offset}, 'slow', 'swing', callback);
};

const navigateToExternal = (url) => { window.open(url) };
const videoLink = 'http://vimeo.com/131718559';

$(window).on('scroll', () => stickyMenu());
$(function() {
	stickyMenu();
	initSlider();

	if (!Modernizr.touch) {
		const headerContainer = $('.header-container .video-overlay');
		const bv = new $.BigVideo({container: headerContainer, controls: false, forceAutoplay: false, doLoop: true});
		bv.init();
		bv.show([
			{type: 'video/mp4', src: '/header_movie.m4v', ambient: true, doLoop: true},
			{type: 'video/webm', src: '/header_movie.webm', ambient: true, doLoop: true},
		]);
		bv.getPlayer().on('loadedmetada', () => headerContainer.css('opacity', 1));
	}

	$('.play').on('click', function(e) {
		e.preventDefault();
		if (Modernizr.touch) {
			navigateToExternal(videoLink);
		} else {
			showVideo();
		}
	});

	$('.scrollandplay').on('click', function(e) {
		e.preventDefault();

		if (Modernizr.touch) {
			navigateToExternal(videoLink);
		} else {
			this.scrollTo(0, () => {
				showVideo();
			});
		}
	});

	$('.pricing .model .learn-more').on('click', function(e) {
		e.preventDefault();

		const $this = $(this);
		const $parent = $this.parent('.model');

		if ($parent.hasClass('flexible')) {
			toggleDescription('flexible');
		} else if ($parent.hasClass('fulltime')) {
			toggleDescription('fulltime');
		} else if ($parent.hasClass('office')) {
			toggleDescription('office');
		}
	});

	const mapLeaveHandler = function(e) {
		const $this = $(this);
		$this.on('click', mapClickHandler);
		$this.off('mouseleave', mapLeaveHandler);
		$this.find('iframe').css('pointer-events', 'none');
	}

	const mapClickHandler = function(e) {
		const $this = $(this);
		$this.off('click', mapClickHandler);
		$this.find('iframe').css('pointer-events', 'auto');
		$this.on('mouseleave', mapLeaveHandler);
	}

	$('.map-container').on('click', mapClickHandler);
});

