delay = (ms, func) -> setTimeout func, ms

sendEvent = (category, action, label = "", value = undefined) ->
	ga('send', 'event', category, action, label, value)

Retina.configure {retinaImageSuffix: "_2x"}