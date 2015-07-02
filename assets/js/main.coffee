log = (msg) -> console.log msg

delay = (ms, func) -> setTimeout func, ms

sendEvent = (category, action, label = "", value = undefined) ->
	ga('send', 'event', category, action, label, value)

Retina.configure {retinaImageSuffix: "_2x"}

setCurrentSlide = (slider, slide) ->
	inner = $(slider).find(".images")

	slideWidth = parseInt($(slider).data 'slide-width')
	newOffset = slide * slideWidth

	inner.css 'left', -newOffset + "px"

	$(slider).data "current-slide", slide

	$bubbles = $(slider).find('.indicator .bubble')
	$active = $bubbles[slide]

	$bubbles.removeClass 'active'
	$($bubbles[slide]).addClass 'active'


nextSlide = ->
	$(".slider").each () ->
		inner = $(this).find(".images")

		slides = inner.children().length
		slideWidth = $(this).data 'slide-width'

		currentOffset = parseInt((inner.css 'left').replace(/[^-\d\.]/g, ''))
		currentSlide = $(this).data 'current-slide'

		maxOffset = (slides-1) * slideWidth

		nextSlide = 0
		if Math.abs(currentOffset) < maxOffset
			nextSlide = currentSlide + 1

		setCurrentSlide $(this), nextSlide
		

updateSlider = () ->
	slider = $(".slider")

	slider.each () ->
		slideWidth = parseInt(($(this).css 'width').replace(/[^-\d\.]/g, ''))
		slideHeight = parseInt(($(this).css 'height').replace(/[^-\d\.]/g, ''))

		$(this).data 'slide-width', slideWidth
		$(this).data 'slide-height', slideHeight

		setCurrentSlide(this, $(this).data("current-slide"))

slideTimer = null
runThis = nextSlide

scheduleSlideChange = ->
	clearInterval slideTimer
	slideTimer = setInterval runThis, 5000

initSlider = ->
	updateSlider()
	scheduleSlideChange()

	$(window).bind 'resize', -> updateSlider()
	$(".slider .indicator .bubble").click (e) ->
		e.preventDefault()
		scheduleSlideChange()
		setCurrentSlide $(this).closest('.slider'), $(this).index()

iframe = $('#spilhuset')[0]
player = $f(iframe)

showVideo = ->
	$('.header-container .header').fadeOut()
	$('.header-container .video-overlay').fadeOut()
	$('.header-container .navigation').fadeOut()
	$('#spilhuset').fadeIn()

	player.api 'play'

hideVideo = (id) ->
	$('.header-container .header').fadeIn()
	$('.header-container .video-overlay').fadeIn()
	$('.header-container .navigation').fadeIn()
	$('#spilhuset').fadeOut()

	player.element.src = player.element.src

player.addEvent 'ready', ->
	player.addEvent 'pause', hideVideo
	player.addEvent 'finished', hideVideo

toggleDescription = (box) ->
	$ele = $('.descriptions .model.' + box)
	$button = $(".pricing .model."+box+" .learn-more")
	if $ele.hasClass 'open'
		$ele.removeClass 'open'
		delay 200, ->
			$button.html 'Learn more'
	else
		$ele.addClass 'open'
		delay 200, ->
			$button.html 'Close'

stickyMenu = ->
	$navigation = $(".navigation")
	origin = 0
	if $navigation.hasClass 'topstick'
		origin = 0
	if $(window).scrollTop() > origin
		$navigation.addClass "sticky"
	else
		$navigation.removeClass "sticky"

Modernizr.addTest 'firefox', ->
	return !!navigator.userAgent.match /firefox/i

menuItems = $('.navigation a.scrollbased')
scrollItems = menuItems.map ->
	item = $($(this).attr('href'))
	return item if item.length

menuItems.click (e) ->
	e.preventDefault()
	
	href = $(this).attr('href')
	if href == "#"
		offsetTop = 0
	else
		offsetTop = $(href).offset().top

	scrollTo offsetTop

scrollTo = (offset, cb = null) ->
	s = "html body"
	s = "html" if Modernizr.firefox
	$(s).stop().animate {scrollTop: offset}, "slow", "swing", cb

$(window).scroll -> 
	stickyMenu()

$(document).ready ->
	stickyMenu()
	initSlider()

	if !Modernizr.touch
		headerContainer = $('.header-container .video-overlay')
		bv = new $.BigVideo {container: headerContainer, controls: false, forceAutoplay: false, doLoop: true}
		bv.init()
		bv.show [
			type: 'video/mp4', src: '/header_movie.m4v', {ambient: true, doLoop: true}
			type: 'video/webm', src: '/header_movie.webm', {ambient: true, doLoop: true}
		]

	bv.getPlayer().on 'loadedmetadata', () ->
		headerContainer.css 'opacity', 1

	$(".play").click (e) ->
		e.preventDefault()
		showVideo()

	$('.scrollandplay').click (e) ->
		e.preventDefault()
		scrollTo 0, ->
			showVideo()


	$('.pricing .model .learn-more').click (e) ->
		e.preventDefault()
		$this = $(this)
		$parent = $this.parent('.model')

		if $parent.hasClass 'flexible'
			toggleDescription 'flexible'
		else if $parent.hasClass 'fulltime'
			toggleDescription 'fulltime'
		else if $parent.hasClass 'office'
			toggleDescription 'office'

	mapLeaveHandler = (e) ->
		$this = $(this)

		$this.on 'click', mapClickHandler	
		$this.off 'mouseleave', mapLeaveHandler
		$this.find('iframe').css 'pointer-events', 'none'
			
	mapClickHandler = (e) ->
		$this = $(this)

		$this.off 'click', mapClickHandler
		$this.find('iframe').css 'pointer-events', 'auto'
		$this.on 'mouseleave', mapLeaveHandler

	$('.map-container').on 'click', mapClickHandler
