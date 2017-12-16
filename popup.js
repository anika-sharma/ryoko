function initMap() {
    //Initialize map, style and position
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 48.2082,
            lng: 16.3738
        },
        zoom: 2,
        mapTypeId: 'roadmap',
        styles: [{
                "featureType": "landscape.natural",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#fee4a8"
                }]
            },
            {
                "featureType": "landscape.natural.terrain",
                "elementType": "geometry.fill",
                "stylers": [{
                    "color": "#fed876"
                }]
            },
            {
                "featureType": "water",
                "elementType": "geometry.fill",
                "stylers": [{
                        "color": "#93e3fd"
                    },
                    {
                        "weight": 1
                    }
                ]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#001d57"
                }]
            }
        ]
    });

    //Set variables
    var markers = [],
        marker = {},
        geocoder = new google.maps.Geocoder,
        infowindow = new google.maps.InfoWindow({
            content: ''
        }),
        content = document.createElement('div'),
        button;

    //Check if user has saved locations
    if (localStorage.getItem('locations')) {
        markers = JSON.parse(localStorage.getItem('locations'));

        //Generate markers on map
        markers.map(function(data) {
            marker = new google.maps.Marker({
                id: data.id,
                map: map,
                icon: 'images/marker.png',
                title: data.title,
                animation: google.maps.Animation.DROP,
                position: {
                    lat: data.coordinates[0],
                    lng: data.coordinates[1]
                }
            });

            //Set marker click event listener
            (function(marker) {
                google.maps.event.addListener(marker, 'click', function(e) {
                    //Info window content
                    content.innerHTML = '<h3>' + data.title + '</h3>';
                    button = content.appendChild(document.createElement('button'));
                    button.type = 'button';
                    button.innerText = 'Remove';
                    //Remove Marker 
                    google.maps.event.addDomListener(button, 'click', function() {
                        removeMarker(marker);
                    });
                    //Set content info window
                    infowindow.setContent(content);
                    //Set position of info window
                    infowindow.setPosition({
                        lat: data.coordinates[0],
                        lng: data.coordinates[1]
                    });
                    infowindow.open(map);
                });
            })(marker);

        });

    } else {
        //Set default marker on map
        marker = new google.maps.Marker({
            map: map,
            icon: 'images/marker.png',
            position: {
                lat: 48.2082,
                lng: 16.3738
            }
        });
    }

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP].push(input);

    //On Search
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();

        if (places.length === 0) {
            return;
        }

        //Get icon, name and location
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                return;
            }

            //Center to search query
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            if (place.geometry.viewport) {
                // Only geocodes have viewport
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }

        });

        map.fitBounds(bounds);

    });

    //Add marker 
    map.addListener('click', function(e) {

        //Set coordinates
        var latlng = {
            lat: parseFloat(e.latLng.lat()),
            lng: parseFloat(e.latLng.lng())
        };

        //Retrieve place information using coordinates
        geocoder.geocode({
            'location': latlng
        }, function(results, status) {
            if (status === 'OK') {
                //Create new marker
                marker = new google.maps.Marker({
                    id: results[0].place_id,
                    position: e.latLng,
                    icon: 'images/marker.png',
                    map: map
                });

                //Set marker click event listener
                google.maps.event.addListener(marker, 'click', function() {
                    //Info Window Content
                    content.innerHTML = '<h3>' + results[0].formatted_address + '</h3>';
                    button = content.appendChild(document.createElement('button'));
                    button.type = 'button';
                    button.innerText = 'Remove';
                    //Remove Marker
                    google.maps.event.addDomListener(button, 'click', function() {
                        removeMarker(marker);
                    });
                    //Set info window content
                    infowindow.setContent(content);
                    //Set info window position
                    infowindow.setPosition(latlng);
                    infowindow.open(map);
                });
            }
            //Add new marker
            markers.push({
                "id": marker.id,
                "title": results[0].formatted_address,
                "coordinates": [marker.position.lat(), marker.position.lng()]
            });

            localStorage.setItem('locations', JSON.stringify(markers));

        });

    });
    //On click delete marker
    var removeMarker = function(deleteMarker) {
        //Remove marker from map
        deleteMarker.setMap(null);
        //Close info window
        infowindow.close(deleteMarker);
        //Remove marker from array
        var pos = markers.indexOf(deleteMarker.id);
        markers.splice(pos, 1);

        //Reset local storage
        localStorage.setItem('locations', JSON.stringify(markers));
    };
}
