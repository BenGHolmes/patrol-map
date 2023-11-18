const maxMobileCanvasSize = 16777216
const maps = {
	"Public": {
		image: "assets/public-map.png",
		runs: "annotation/output/public-map.json",
		zoom: true,
	},
	"Complex 1": {
		image: "assets/complex-1.png",
		runs: "annotation/output/complex-1.json"
	},
	"Complex 2": {
		image: "assets/complex-2.png",
		runs: "annotation/output/complex-2.json"
	},
	"Complex 3": {
		image: "assets/complex-3.png",
		runs: "annotation/output/complex-3.json"
	},
	"Complex 4A": {
		image: "assets/complex-4a.png",
		runs: "annotation/output/complex-4a.json"
	},
	"Complex 4B": {
		image: "assets/complex-4b.png",
		runs: "annotation/output/complex-4b.json"
	},
	"Complex 5": {
		image: "assets/complex-5.png",
		runs: "annotation/output/complex-5.json"
	}
}

const nextMap = {
	"Public": "Complex 1",
	"Complex 1": "Complex 2",
	"Complex 2": "Complex 3",
	"Complex 3": "Complex 4A",
	"Complex 4A": "Complex 4B",
	"Complex 4B": "Complex 5",
	"Complex 5": "Complex 1",
}

var currentMapName
var currentMap
var currentMapRuns
var currentBlockedRun
var panzoom
var canvas
var ctx
var guessInput
var result
var counter
var scale

// Debugging
const showAll = false;

const initPanzoom = () => 
	new Promise((resolve, reject) => {
		panzoom = Panzoom(canvas, {
			maxScale: 5,
			minScale: 0.001,
			contain: 'outside',
			pinchSpeed: 1,
			startScale: 0.001,
			canvas: true,
		})
	
		canvas.parentElement.addEventListener('wheel', panzoom.zoomWithWheel)

		resolve()
	});

const drawMap = (src) => 
	new Promise((resolve, reject) => {
		var img = new Image()

		img.onload = function() {	
			// Calculate max image scale that will stil work on iOS
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas#maximum_canvas_size
			scale = getImageScale(img)

			// Resize the canvas to max size, same aspect ratio as image
			canvas.width = img.naturalWidth * scale
			canvas.height = img.naturalHeight * scale

			// Draw the image
			ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, canvas.width, canvas.height)

			// Zoom all the way out
			panzoom.zoom(0.001)

			resolve()
		}	

		img.src = src
	});

window.onload = () => {
	canvas = document.getElementById("map");
	ctx = canvas.getContext("2d");
	
	guessInput = document.getElementById("guess")
	result = document.getElementById("result")
	counter = document.getElementById("counter")
	
	initPanzoom()
		.then(() => {
			loadMap("Public")

			guessInput.addEventListener('keydown', (event) => {
				if (event.key === 'Enter') {
					let guess = guessInput.value;
					guessInput.value = '';

					if (matches(guess, currentBlockedRun.names)) {
						result.classList.add("correct")
						result.classList.remove("hidden")
						runCount += 1
						counter.textContent = `${runCount}/${nRuns}`
					} else {
						result.classList.add("wrong")
						result.classList.remove("hidden")
						currentMapRuns.unshift(currentBlockedRun) // Add run back if we get it wrong
					}

					result.textContent = currentBlockedRun.names.join(" / ")

					setTimeout(() => {
						result.textContent = ''
						result.classList.remove("correct")
						result.classList.remove("wrong")
						result.classList.add("hidden")

						drawMap(currentMap.image).then(() => {
							if (currentMapRuns.length == 0) {
								loadMap(nextMap[currentMapName])
							}
							currentBlockedRun = currentMapRuns.pop()
							blockCurrentRun()
							if (currentMap.zoom) {
								zoomToCurrentRun()
							}
						})
					}, 1000)	
				}
			});
		})
}

function zoomToCurrentRun() {
	// FIXME: get this working for complex maps as well. Only works for public map right now.
	// actually only works for public map on my laptop. I definitely didn't understand the
	// scaling and just got lucky.
	panzoom.zoom(1.2)
	
	setTimeout(() => {
		let scaledRunTop = currentBlockedRun.boxes[0].top * scale
		let scaledRunLeft = currentBlockedRun.boxes[0].left * scale

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

function blockCurrentRun() {
	for (let i=0; i<currentBlockedRun.boxes.length; i++) {
		let box = currentBlockedRun.boxes[i]
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

function matches(guess, names) {
	for (let i=0; i<names.length; i++) {
		let name = names[i]

		let guessChars = guess.replace(/\W/g, '').toLowerCase()
		let nameChars = name.replace(/\W/g, '').toLowerCase()

		let guessCounts = countChars(guessChars)
		let nameCounts = countChars(nameChars)

		let strikes = 0

		nameCounts.forEach( (value, key, map) => {
			let guessCount = 0
			if (guessCounts.has(key)) {
				guessCount = guessCounts.get(key)
			}

			strikes += Math.abs(value - guessCount)
		});

		let allowedStrikes = Math.floor(nameChars.length * 0.2)

		if (strikes <= allowedStrikes) {
			return true
		}
	}
	
	return false
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

function loadMap(mapName) {
	if (mapName == currentMapName) {
		return
	}

	if (currentMapName) {
		document.getElementById(currentMapName).classList.remove("active")
	}
	document.getElementById(mapName).classList.add("active")
	
	currentMapName = mapName
	currentMap = maps[mapName]

	let runPromise = fetch(currentMap.runs).then(response => {return response.json();})
	
	drawMap(currentMap.image)
		.then(() => {
			runPromise.then(runs => {
				if (showAll) {
					for (let i=0; i<runs.length; i++) {
						block(runs[i])
					}

					return // Exit early for debugging
				}

				let nRuns = runs.length;
				let runCount = 0;
				counter.textContent = `${runCount}/${nRuns}`

				currentMapRuns = shuffle(runs)
				currentBlockedRun = runs.pop()
				blockCurrentRun()
				if (currentMap.zoom) {
					zoomToCurrentRun()
				}
			})
			
		})
}

function loadPublicMap() {loadMap("Public")}

function loadComplex1Map() {loadMap("Complex 1")}

function loadComplex2Map() {loadMap("Complex 2")}

function loadComplex3Map() {loadMap("Complex 3")}

function loadComplex4aMap() {loadMap("Complex 4A")}

function loadComplex4bMap() {loadMap("Complex 4B")}

function loadComplex5Map() {loadMap("Complex 5")}