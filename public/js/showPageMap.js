
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 8, // starting zoom
    projection: 'globe' // display the map as a 3D globe
});
map.on('style.load', () => {
    map.setFog({}); // Set the default atmosphere style
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// Create a default Marker and add it to the map.
const marker1 = new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 10 })
            .setHTML(
                `<h5>${campground.title}</h5>` + `<h6 class="text-muted">${campground.location}</h6>`
            )
    )
    .addTo(map);