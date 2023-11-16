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
	var result = document.getElementById("result")
	var counter = document.getElementById("counter")
	
	initPanzoom(canvas)
		.then(panzoom => {
			let runPromise = fetch("./annotation/output/public-map.json").then(response => {return response.json();})
	
			drawMap(canvas, ctx, panzoom, "assets/public-map.png")
				.then(scale => {
					runPromise.then(runs => {
						let nRuns = runs.length;
						let runCount = 0;
						counter.textContent = `${runCount}/${nRuns}`

						runs = shuffle(runs)
						let run = runs.pop()
						block(ctx, run, scale)
						zoomToRun(run, canvas, scale, panzoom)
	
						guessInput.addEventListener('keydown', (event) => {
							if (event.key === 'Enter') {
								let guess = guessInput.value;
								guessInput.value = '';

								if (matches(guess, run.name)) {
									result.classList.add("correct")
									result.classList.remove("hidden")
									runCount += 1
									counter.textContent = `${runCount}/${nRuns}`
								} else {
									result.classList.add("wrong")
									result.classList.remove("hidden")
									runs.unshift(run) // Add run back if we get it wrong
								}

								result.textContent = run.name

								setTimeout(() => {
									result.textContent = ''
									result.classList.remove("correct")
									result.classList.remove("wrong")
									result.classList.add("hidden")
	
									drawMap(canvas, ctx, panzoom, "assets/public-map.png").then(scale => {
										if (runs.length == 0) {
											alert("Done!")
										}
										run = runs.pop()
										block(ctx, run, scale)
										zoomToRun(run, canvas, scale, panzoom)
									})
								}, 1000)	
							}
						});
					})
					
				})
		})
}

function zoomToRun(run, canvas, scale, panzoom) {
	panzoom.zoom(1.2)
	setTimeout(() => {
		let scaledRunTop = run.boxes[0].top * scale
		let scaledRunLeft = run.boxes[0].left * scale

		let panX = canvas.width / 2 / 1.2 - scaledRunLeft * 1.2
		let panY = canvas.height / 2 / 1.2 - scaledRunTop * 1.2

		panzoom.pan(panX, panY)
	}, 50)
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

function clearResult(result) {
	result.textContent = ''
	result.classList.remove("correct")
	result.classList.remove("wrong")
	result.classList.add("hidden")
}

function matches(guess, name) {
	guessChars = guess.replace(/\W/g, '').toLowerCase()
	nameChars = name.replace(/\W/g, '').toLowerCase()

	guessCounts = countChars(guessChars)
	nameCounts = countChars(nameChars)

	let strikes = 0

	nameCounts.forEach( (value, key, map) => {
		if (guessCounts.has(key)) {
			guessCount = guessCounts.get(key)
		} else {
			guessCount = 0
		}

		strikes += Math.abs(value - guessCount)
	});

	allowedStrikes = Math.floor(nameChars.length * 0.2)

	return strikes <= allowedStrikes
}

function countChars(word) {
	let map = new Map()
	for (let i=0; i<word.length; i++) {
		if (map.has(word[i])) {
			map.set(word[i], map.get(word[i])+1)
		} else {
			map.set(word[i],1)
		}
	}

	return map
}

function randInt(max) {
	return Math.floor(Math.random() * max);
}

// https://stackoverflow.com/a/2450976
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}