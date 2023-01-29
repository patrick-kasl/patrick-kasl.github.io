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
              mapbox_features.push(
                  {
                    // feature for Mapbox DC
                    'type': 'Feature',
                    'geometry': {
                      'type': 'Point',
                      'coordinates': [
                        entity.vehicle.position.longitude,
                        entity.vehicle.position.latitude]
                      },
                    'properties': {
                      'title': 'Mapbox DC'
                    }
                  },
              );

            }
        }
    });
   
}
catch (error) {
    console.log(error);
    process.exit(1);
}
const df = new DataFrame({
  Direction: directions,
  lat: latitude, 
  lon: longitude,
  symbol: symbols
}, ['Direction', 'lat', 'lon', 'symbol']);

var data = [];

var blue_line_shape = {
     type: 'linemapbox',
     lat: shapes[1],
     lon: shapes[2],
     mode: 'lines',
     line:{
      width: 2,
      color: 'blue'
  }
  };

data.push(blue_line_shape);
/*
for (let i = 0; i < direction_classes.length; i++){
  data.push(
    {
      type: 'scattermapbox',
      name: direction_classes[i],
      lat: df.filter(row => row.get('Direction') == direction_classes[i]).select('lat').toArray().flat(),
      lon: df.filter(row => row.get('Direction') == direction_classes[i]).select('lon').toArray().flat(),
      mode:'markers',
       marker: {
         size:20
       },
   }
  );
}
*/
direction_classes.map(function(classes) {
  //lati = df.filter(row => row.get('Direction') == classes).get('lat').to_array();
  //long = df.filter(row => row.get('Direction') == classes).get('long').to_array();
  return {
     type: 'scattermapbox',
     name: classes,
     lat: df.filter(row => row.get('Direction') == classes).select('lat').toArray().flat(),
     lon: df.filter(row => row.get('Direction') == classes).select('lon').toArray().flat(),
     mode:'markers',
      marker: {
        size:20
      },
  };
});

/*
for (let i = 0; i < symbols_plot.length; i++){
  data.push(symbols_plot[i]);
}
*/

console.log(data);

  var layout = {
    title: 'Current Blue Line Trolley Locations',
    font: {
      color: 'white'
    },
    autosize: false,
    width: 800,
    height: 1000,
    hovermode: "closest",
    showlegend: true,
    mapbox: {
      style: 'dark',
      bearing: 0,
      center: {
        lat: 32.716734,
        lon: -117.138044
      },
      pitch: 0,
      zoom: 10,

    },
    paper_bgcolor: '#11191f',
    plot_bgcolor: '#11191f',
    annotations: [{
        x: 0,
        y: -0.02,
        xref: 'paper',
        yref: 'paper',
      text: 'Source: <a href="https://www.sdmts.com/business-center/app-developers/real-time-data" style="color: rgb(255,255,255)">San Diego MTS</a>',
      showarrow: false
    }]
  };
  
  Plotly.setPlotConfig({
    mapboxAccessToken: "pk.eyJ1IjoicGthc2wiLCJhIjoiY2xkOWswampzMDl0bTNubW0zaGZwa3JudSJ9.rfPdeEe_uLSGhWcRZbbhpA"
  });
  
  Plotly.newPlot("myDiv", data, layout);

})(); 


var mapbox_js_shape = [];

console.log(shapes['0'].length)
for (let i = 0; i < shapes['0'].length; i++){
  console.log(i)
  //console.log([shapes['1'][i.toString()], shapes['0'][i]])
  mapbox_js_shape.push([shapes[1][i], shapes[0][i]]);
}


var mapbox_js_shape = [];

console.log(shapes['0'].length)
for (let i = 0; i < shapes['0'].length; i++){
  console.log(i)
  //console.log([shapes['1'][i.toString()], shapes['0'][i]])
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
      'circle-color': 'orange',
      'circle-stroke-color': 'white'
    }
  });
});

});
});
