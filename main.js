// FIXME: Bugs
// 	- On hard reload, sometimes starts very zoomed in. Think it tries to calculate 
//		minScale before img has finished loading, so the minScale is very large and it
// 		just permanently stays zoomed at a scale of 5.
// 	- Sometimes displays white screen on load, but starts working correctly once
// 		user zooms or pans at all.
// 	- On mobile the zooming is really far off. Doesn't zoom into the correct spot
// 		instead it will zoom in centered on somewhere else on the map

runs = [
	{
		name: "Knob Hill",
		left: 488,
		top: 3288,
		width: 65,
		height: 160,
		rotationDeg: 0,
	}
]

const elem = document.getElementById('panzoom')
box = document.getElementById("box")
minScale = calcMinScale()

const panzoom = Panzoom(elem, {
	maxScale: 5,
	minScale: minScale,
	contain: 'outside',
	pinchSpeed: 1,
	startScale: minScale,
	canvas: true,
})
	
elem.parentElement.addEventListener('wheel', panzoom.zoomWithWheel)
block(runs[0])

function calcMinScale() {
	containerWidth = document.getElementById("map-container").clientWidth
	containerHeight = document.getElementById("map-container").clientHeight
	imgWidth = document.getElementById("map").naturalWidth
	imgHeight = document.getElementById("map").naturalHeight

	console.log(containerWidth, containerHeight)
	console.log(imgWidth, imgHeight)

	return Math.max(containerWidth / imgWidth, containerHeight / imgHeight)
}

function block(run) {
	console.log("running")
	console.log(box)

	box.classList.remove("hidden")
	box.setAttribute("left", `${run.left * minScale}px`)
	box.setAttribute("top", `${run.top * minScale}px`)
	box.setAttribute("width", `${run.width * minScale}px`)
	box.setAttribute("height", `${run.height * minScale}px`)
	box.setAttribute("transform", `rotate(${run.rotationDeg}deg)`)
}

function unblock() {
	box.classList.add("hidden")
}
