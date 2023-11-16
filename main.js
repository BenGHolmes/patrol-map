var c = document.getElementById("map");
var ctx = c.getContext("2d");
var maxMobileCanvasSize = 16777216

var guessInput = document.getElementById("guess")
var panzoom_init_done = false

blockRandomRun()

guessInput.addEventListener('keydown', (event) => {
	if (event.key === 'Enter') {
		blockRandomRun()
	}
});

function blockRandomRun() {
	// ctx.clearRect(0, 0, c.width, c.height);
	// ctx.beginPath()
	var img = new Image()

	img.onload = function() {	
		drawImage(img)
		initPanzoom()

		fetch("./annotation/output/public-map.json")
		.then(response => {
			return response.json();
		}).then(runs => {
			idx = randInt(runs.length)
			block(img, runs[idx])
		});
	}	
	
	img.src = "assets/public-map.png"
}

function drawImage(img) {
	scale = getImageScale(img)
	console.log(img.naturalWidth, img.naturalHeight, scale)

	c.width = img.naturalWidth * scale
	c.height = img.naturalHeight * scale

	console.log(c.width, c.height)

	ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, c.width, c.height)
}

function initPanzoom() {
	if (panzoom_init_done) {
		return
	}

	panzoom_init_done = true

	minScale = calcMinScale()
	
	console.log(minScale)

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

function getImageScale(img) {
	naturalPixels = img.naturalWidth * img.naturalHeight;
	scale = maxMobileCanvasSize / naturalPixels

	return scale;
}

function calcMinScale() {
	containerWidth = document.getElementById("map-container").clientWidth
	containerHeight = document.getElementById("map-container").clientHeight
	imgWidth = c.width
	imgHeight = c.height

	return Math.max(containerWidth / imgWidth, containerHeight / imgHeight)
}

function block(img, run) {
	scale = getImageScale(img)

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

function randInt(max) {
	return Math.floor(Math.random() * max);
}