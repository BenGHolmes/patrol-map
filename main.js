const elem = document.getElementById('map')
console.log(elem)
const panzoom = Panzoom(elem, {
  maxScale: 5,
	minScale: 1,
	contain: 'outside',
})
panzoom.pan(10, 10)
panzoom.zoom(2, { animate: true })

// Panning and pinch zooming are bound automatically (unless disablePan is true).
// There are several available methods for zooming
// that can be bound on button clicks or mousewheel.
elem.parentElement.addEventListener('wheel', panzoom.zoomWithWheel)
