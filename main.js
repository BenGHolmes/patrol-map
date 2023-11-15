runs = [
	{
		name: "Knob Hill",

	}
]

var c = document.getElementById("map");
var ctx = c.getContext("2d");
var maxMobileCanvasSize = 16777216

// Load image
var img = new Image()
img.src = "assets/public-map.png"
naturalPixels = img.naturalWidth * img.naturalHeight;
scale = maxMobileCanvasSize / naturalPixels

img.onload = function() {
	drawImage()
	initPanzoom()

	block(runs[0])
}

function drawImage() {
	c.width = img.naturalWidth * scale
	c.height = img.naturalHeight * scale
	ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, c.width, c.height)
}

function initPanzoom() {
	minScale = calcMinScale()

	const panzoom = Panzoom(c, {
		maxScale: 5,
		minScale: 0.05,
		contain: 'outside',
		pinchSpeed: 1,
		startScale: 0.05,
		canvas: true,
	})

	c.parentElement.addEventListener('wheel', panzoom.zoomWithWheel)
}

function calcMinScale() {
	containerWidth = document.getElementById("map-container").clientWidth
	containerHeight = document.getElementById("map-container").clientHeight
	imgWidth = document.getElementById("map").naturalWidth
	imgHeight = document.getElementById("map").naturalHeight

	return Math.max(containerWidth / imgWidth, containerHeight / imgHeight)
}

function block(run) {
	ctx.beginPath()
	ctx.fillRect(494*scale, 3294*scale, 57*scale, 145*scale)
	ctx.stroke()
}
