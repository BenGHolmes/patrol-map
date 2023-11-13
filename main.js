// FIXME: Bugs
// 	- On hard reload, sometimes starts very zoomed in. Think it tries to calculate 
//		minScale before img has finished loading, so the minScale is very large and it
// 		just permanently stays zoomed at a scale of 5.

const img = document.getElementById('map')
minScale = calcMinScale()

console.log(minScale)

const panzoom = Panzoom(img, {
	maxScale: 5,
	minScale: minScale,
	contain: 'outside',
	pinchSpeed: 1,
	startScale: minScale,
})
	
img.parentElement.addEventListener('wheel', panzoom.zoomWithWheel)

function calcMinScale() {
	containerWidth = document.getElementById("map-container").clientWidth
	containerHeight = document.getElementById("map-container").clientHeight
	imgWidth = document.getElementById("map").naturalWidth
	imgHeight = document.getElementById("map").naturalHeight

	return Math.max(containerWidth / imgWidth, containerHeight / imgHeight)
}
