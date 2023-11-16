const maxMobileCanvasSize = 16777216

const initPanzoom = (canvas) => 
	new Promise((resolve, reject) => {
		const panzoom = Panzoom(canvas, {
			maxScale: 5,
			minScale: 0.001,
			contain: 'outside',
			pinchSpeed: 1,
			startScale: 0.001,
			canvas: true,
		})
	
		canvas.parentElement.addEventListener('wheel', panzoom.zoomWithWheel)

		resolve(panzoom)
	});

const drawMap = (canvas, ctx, panzoom, src) => 
	new Promise((resolve, reject) => {
		var img = new Image()

		img.onload = function() {	
			// Calculate max image scale that will stil work on iOS
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas#maximum_canvas_size
			let scale = getImageScale(img)

			// Resize the canvas to max size, same aspect ratio as image
			canvas.width = img.naturalWidth * scale
			canvas.height = img.naturalHeight * scale

			// Draw the image
			ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, canvas.width, canvas.height)

			// Zoom all the way out
			panzoom.zoom(0.001)

			resolve(scale)
		}	

		img.src = src
	});

window.onload = () => {
	var canvas = document.getElementById("map");
	var ctx = canvas.getContext("2d");
	
	var guessInput = document.getElementById("guess")
	
	initPanzoom(canvas)
		.then(panzoom => {
			let runPromise = fetch("./annotation/output/public-map.json").then(response => {return response.json();})
	
			drawMap(canvas, ctx, panzoom, "assets/public-map.png")
				.then(scale => {
					runPromise.then(runs => {
						blockRandomRun(ctx, runs, scale)
	
						guessInput.addEventListener('keydown', (event) => {
							if (event.key === 'Enter') {
								let guess = guessInput.value;
								guessInput.value = '';
								console.log(guess)

								drawMap(canvas, ctx, panzoom, "assets/public-map.png").then(scale => {
									blockRandomRun(ctx, runs, scale)
								})
							}
						});
					})
					
				})
		})
}


function blockRandomRun(ctx, runs, scale) {
	idx = randInt(runs.length)
	block(ctx, runs[idx], scale)
}

function getImageScale(img) {
	naturalPixels = img.naturalWidth * img.naturalHeight;
	scale = maxMobileCanvasSize / naturalPixels

	return scale;
}

function block(ctx, run, scale) {
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