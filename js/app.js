var map;
// Create a new blank array for all the listing markers.
var markers = [];
var infoWindow;
var locations = [{
        title: 'Sukhna Lake',
        location: {
            lat: 30.736100,
            lng: 76.819196
        }
    },
    {
        title: 'Rock Garden',
        location: {
            lat: 30.753491,
            lng: 76.805420
        }
    },
    {
        title: 'Leisure Valley',
        location: {
            lat: 30.752808,
            lng: 76.792073
        }
    },
    {
        title: 'Rose Garden',
        location: {
            lat: 30.746114,
            lng: 76.781967
        }
    },
    {
        title: 'Nehru Park',
        location: {
            lat: 30.733661,
            lng: 76.772423
        }
    }
];
var styles = [
        {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{
                color: '#006600'
            }]
        },
        {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#6b9a76'
            }]
        },
        {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{
                color: '#000000'
            }]
        },
        {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{
                color: '#212a37'
            }]
        },
        {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#9ca5b3'
            }]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{
                color: '#746855'
            }]
        },
        {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{
                color: '#1f2835'
            }]
        },
        {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#f3d19c'
            }]
        },
        {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{
                color: '#2f3948'
            }]
        },
        {
            featureType: 'transit.station',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#d59563'
            }]
        },
        {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{
                color: '#99ccff'
            }]
        },
        {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#515c6d'
            }]
        },
        {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{
                color: '#17263c'
            }]
        }
];
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 30.740095,
            lng: 76.781634
        },
        zoom: 14,
        styles: styles,
        mapTypeControl: false
    });
    infoWindow = new google.maps.InfoWindow();
    var defaultIcon = editMarker('ff3300');
    var highlightedIcon = editMarker('0000ff');
    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
        var marker = new google.maps.Marker({
            map:map,
            position: locations[i].location,
            title: locations[i].title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
        });
        markers.push(marker);
        ViewModel.showMarkings();
        marker.addListener('click', function() {
            populateInfoWindow(this, infoWindow);

        });
        marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });
    }
}
function editMarker(color) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + color +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}


function populateInfoWindow(marker, infowindow) {
    toggleBounce(marker);

    if (infowindow.marker != marker) {

        infowindow.setContent('');
        infowindow.marker = marker;
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
            marker.setAnimation(null);
        });
        fetchArticle(marker);
        // Open the infowindow on the correct marker.
        if (infowindow) {
            infowindow.close();
        }
        infowindow.open(map, marker);
    }
}

function fetchArticle(marker){
    var wikiurl = 'https://en.wikipedia.org/w/api.php'
    wikiurl += '?' + $.param({
        'format': 'json',
        'action': 'query',
        'info': 'images',
        'titles': marker.title,
        'callback': 'wikiCallback'
    });

    var wikiRequestTimeout = setTimeout(function(){
        ViewModel.showError(true);
        ViewModel.error('failed to get wikipedia resources');
    },8000);

    $.ajax({
        url: wikiurl,
        dataType: "jsonp",
        //jsonp: callback
        success: function(response){
            var img = response[1][1][0];
            var tag = "<img src=\"https://en.wikipedia.org/wiki/" + marker.title + "#/media/" + img + "\">";
                infoWindow.setContent(tag);
            clearTimeout(wikiRequestTimeout);
        }
    });
    infoWindow.setContent(marker.title);
}

function toggleBounce(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);
    }, 730);
}


function highlightMarker(data) {

    if (infoWindow.marker != data.location) {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].title == data.title) {
                populateInfoWindow(markers[i], infoWindow);
                break;
            }
        }
    }
}

function showWeather() {
    if (ViewModel.showWeatherConditions() == true)
        ViewModel.showWeatherConditions(false);
    else
        ViewModel.showWeatherConditions(true);

    $.ajax({
        url: "http://api.wunderground.com/api/16feff206f177697/conditions/q/+" + 30.740095 + "," + 76.781634 + ".json",
        dataType: 'json',
        async: true
    }).done(function(data) {
        if (data) {
            articles = data.current_observation;
            content = 'Weather: ' + articles.weather + '<br>';
            content += 'Temperature: ' + articles.temperature_string;
            ViewModel.myWeather(content);
            ViewModel.imageWeatherPath(articles.icon_url);
        } else {
            ViewModel.myWeather('Response not available!');
        }
    }).fail(function(response, status, data) {
        ViewModel.imageWeatherPath('https://cdn4.iconfinder.com/data/icons/basic-interface-overcolor/512/forbidden-128.png');
        ViewModel.myWeather('Failed to Load Weather today');
    });

}


var ViewModel = {
    error: ko.observable(''),
    showError: ko.observable(false),
    showMarkings: function(){
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
            bounds.extend(markers[i].position);
    }
    google.maps.event.addDomListener(window, 'resize', function() {
        map.fitBounds(bounds);
    });
    },
    hideMarkings : function(){
        for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    },
    showMyList: ko.observable(true),
    list: ko.observableArray([]),
    query: ko.observable(''),
    //Search function for live search
    search: function(value) {
        ViewModel.showMyList(false);
        ViewModel.list.removeAll();
        if (value == '') {
            ViewModel.showMyList(true);
            for (var i = 0; i < markers.length; i++) {
                markers[i].setVisible(true);
            }
            return;
        }
        for (var i = 0; i < markers.length; i++) {
            markers[i].setVisible(false);
        }
        for (var location in locations) {

            if (locations[location].title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                ViewModel.list.push(locations[location]);

                var key = locations[location].location;
                for (var j = 0; j < markers.length; j++) {
                    if (markers[j].position.lat().toFixed(3) == key.lat.toFixed(3)) {
                        if (markers[j].position.lng().toFixed(3) == key.lng.toFixed(3)) {
                            markers[j].setVisible(true);
                        }
                    }

                }

            }
        }
    },
    showWeatherConditions: ko.observable(false),
    imageWeatherPath: ko.observable(""),
    myWeather: ko.observable("")
};

ViewModel.query.subscribe(ViewModel.search);
ko.applyBindings(ViewModel);

googleapiError = () => {
    ViewModel.showError(true);
    ViewModel.error('Sorry! Maps not able to load');

};