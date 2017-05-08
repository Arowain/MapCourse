var map;
// blank array for all the listing markers.
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
        title: 'Rock Garden of Chandigarh',
        location: {
            lat: 30.753491,
            lng: 76.805420
        }
    },
    {
        title: 'Open Hand Monument',
        location: {
            lat: 30.758974,
            lng: 76.807348
        }
    },
    {
        title: 'Zakir Hussain Rose Garden',
        location: {
            lat: 30.746114,
            lng: 76.781967
        }
    },
    {
        title: 'Japanese Garden, Chandigarh',
        location: {
            lat: 30.703572,
            lng: 76.781572
        }
    },
    {
        title: 'Garden of Springs, Chandigarh',
        location: {
            lat: 30.724399,
            lng: 76.734749
        }
    }
];

//for styles in map
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
                color: '#ff0000'
            }]
        },
        {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#ff0000'
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

//function for initialisation of map
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 30.740095,
            lng: 76.781634
        },
        zoom: 13,
        styles: styles,
        mapTypeControl: true
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

        //adding event Listeners to markers
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

//function to change the marker
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

//fill information in infoWindow
function populateInfoWindow(marker, infowindow) {
    bounce(marker);

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


//function to bounce the marker
function bounce(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);
    }, 730);
}

//function to open infoWindow if marker is clicked
function pointMarker(data) {

    if (infoWindow.marker != data.location) {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].title == data.title) {
                populateInfoWindow(markers[i], infoWindow);
                break;
            }
        }
    }
}

//function for fetching wikipedia article using ajax
function fetchArticle(marker){
    var wikiurl = 'https://en.wikipedia.org/w/api.php';
    wikiurl += '?' + $.param({
        'format': 'json',
        'action': 'query',
        'prop': 'revisions',
        'titles': marker.title,
        'rvprop': 'content',
        'rvsection' : '0',
        'rvparse' : '1',
        'callback': 'wikiCallback'
    });

    var wikiRequestTimeout = setTimeout(function(){
        ViewModel.showError(true);
        ViewModel.error('failed to get wikipedia resources');
    },8000);

    $.ajax({
        url: wikiurl,
        dataType: "jsonp",
        crossDomain: true,
        success: function(response){
            var obj;
            var pages = response['query']['pages'];
            for(var f in pages)
            {
                obj = f;
                break;
            }
            var result = response['query']['pages'][obj]['revisions']['0']['*'];
            infoWindow.setContent(result);
            clearTimeout(wikiRequestTimeout);
        }
    });
}

//function for fetching weather informations
function showWeather() {
    if (ViewModel.showLocalWeather() == true)
        ViewModel.showLocalWeather(false);
    else
        ViewModel.showLocalWeather(true);

    $.ajax({
        url: "http://api.wunderground.com/api/16feff206f177697/conditions/q/+" + 30.740095 + "," + 76.781634 + ".json",
        dataType: 'json',
        async: true
    }).done(function(data) {
        if (data) {
            articles = data.current_observation;
            content = 'Weather: ' + articles.weather + '<br>';
            content += 'Temperature: ' + articles.temperature_string;
            ViewModel.weather(content);
            ViewModel.imagePath(articles.icon_url);
        } else {
            ViewModel.weather('Response not available!');
        }
    }).fail(function(response, status, data) {
        ViewModel.imagePath('https://cdn4.iconfinder.com/data/icons/basic-interface-overcolor/512/forbidden-128.png');
        ViewModel.showError(true);
        ViewModel.error('failed to get wikipedia resources');
    });

}


var ViewModel = {
    error: ko.observable(''),
    showError: ko.observable(false),
    showList: ko.observable(true),
    list: ko.observableArray([]),
    query: ko.observable(''),
    showLocalWeather: ko.observable(false),
    imagePath: ko.observable(""),
    weather: ko.observable(""),

    //function to show markers
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

    //function to hide markers
    hideMarkings : function(){
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    },

    //Search function for live search
    search: function(value) {
        ViewModel.showList(false);
        ViewModel.list.removeAll();
        if (value == '') {
            ViewModel.showList(true);
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
    }
};

ViewModel.query.subscribe(ViewModel.search);
ko.applyBindings(ViewModel);


googleapiError = () => {
    ViewModel.showError(true);
    ViewModel.error('Sorry! Maps not able to load');

};