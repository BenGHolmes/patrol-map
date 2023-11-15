var c = document.getElementById("map");
var ctx = c.getContext("2d");
var maxMobileCanvasSize = 16777216
var scale

// Load image
var img = new Image()
img.src = "assets/public-map.png"

img.onload = function() {
	naturalPixels = img.naturalWidth * img.naturalHeight;
	scale = maxMobileCanvasSize / naturalPixels

	drawImage()
	initPanzoom()

	fetch("./annotation/output/public-map.json")
	.then(response => {
		return response.json();
	}).then(runs => {
		for (let i=0; i < runs.length; i++) {
			block(runs[i])
		}
	});	
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
	for (let i=0; i<run.boxes.length; i++) {
		box = run.boxes[i]
		ctx.save()
		ctx.beginPath()
		ctx.translate(box.left*scale, box.top*scale)
		ctx.rotate(-box.rotationDeg * Math.PI / 180)
		ctx.fillRect(0, 0, box.width*scale, box.height*scale)
		ctx.stroke()
		ctx.restore()
	}
}
