var GtfsRealtimeBindings = require('./node_modules/gtfs-realtime-bindings');
var fetch = require('./node_modules/cross-fetch');
var DataFrame = require('dataframe-js').DataFrame;

var latitude = [];
var longitude = [];
var symbols = [];

var directions = [];

var direction_classes = ['North', 'South'];

const colors_json = '{"North": "red", "South":"blue"}';
const colors = JSON.parse(colors_json);


var trips;
var shapes;
var mapbox_features = [];

// 
function trolley_geojson(lon, lat, direction) {
  
  if (direction == 'North'){
    console.log(direction);
    return {
      // feature for Mapbox DC
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': [lon,lat]
        },
      'properties': {
        'direction': direction
      }
    };
  } else if (direction == 'South') {
    return {
      // feature for Mapbox DC
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': [lon,lat]
        },
      'properties': {
        'direction': direction
      }
    };
  }
  
}

d3.json("./trips_test.json", function(data){
    trips = data;

  d3.json("./blue_line_shape.json", function(data){
    shapes = data;
    console.log(shapes);

(async () => {

try {
    const response = await fetch("https://realtime.sdmts.com/api/api/gtfs_realtime/vehicle-positions-for-agency/MTS.pb?key=e2f3da8d-2ea3-40cf-9e30-0b937f0e3817", {
    
    });
    
    const buffer = await response.arrayBuffer();
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
    new Uint8Array(buffer)
    );

    feed.entity.forEach(function(entity) {
        if (entity.vehicle.trip != null){
            if (entity.vehicle.trip.routeId == '510'){

              latitude.push(entity.vehicle.position.latitude);
              longitude.push(entity.vehicle.position.longitude);
              symbols.push("rail-light");
              directions.push(trips[entity.vehicle.trip.tripId].direction_name);
              mapbox_features.push(trolley_geojson(entity.vehicle.position.longitude, entity.vehicle.position.latitude, trips[entity.vehicle.trip.tripId].direction_name));
            }
        }
    });
   
}
catch (error) {
    console.log(error);
    process.exit(1);
}
})(); 


var mapbox_js_shape = [];

//Get the route line points in the right structure
for (let i = 0; i < shapes['0'].length; i++){
  mapbox_js_shape.push([shapes[1][i], shapes[0][i]]);
}

mapboxgl.accessToken = 'pk.eyJ1IjoicGthc2wiLCJhIjoiY2xkOWswampzMDl0bTNubW0zaGZwa3JudSJ9.rfPdeEe_uLSGhWcRZbbhpA';
const map = new mapboxgl.Map({
  container: 'map',
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: 'mapbox://styles/pkasl/cldhqqkmp000z01pf374os34v',
  center: [-117.138044, 32.716734],
  zoom: 10
});
 
map.on('load', () => {
  map.addSource('route', {
    'type': 'geojson',
    'data': {
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'LineString',
        'coordinates': mapbox_js_shape
      }
    }
  });
  map.addLayer({
    'id': 'route',
    'type': 'line',
    'source': 'route',
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': {
      'line-color': '#0063a7',
      'line-width': 4
    }
  });
  map.addSource('trolley_locations', {
    'type': 'geojson',
    'data': {
      'type': 'FeatureCollection',
      'properties': {},
      'features': mapbox_features,
      }
    });

  map.addLayer({
    'id': 'trolley_locations',
    'type': 'circle',
    'source': 'trolley_locations',
    'paint': {
      'circle-radius': 7,
      'circle-stroke-width': 1,
      'circle-color': [
        'match',
        ['get', 'direction'],
        'North', '#02ffc4',
        'South', '#dd02ff',
        /*else */ '#ccc'
        ],
      
      'circle-stroke-color': 'white'
    }
  });
});

});
});
