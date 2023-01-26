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
d3.json("./trips_test.json", function(data){
    trips = data;

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
}, ['Direction', 'lat', 'lon']);

var data = direction_classes.map(function(classes) {
  //lati = df.filter(row => row.get('Direction') == classes).get('lat').to_array();
  //long = df.filter(row => row.get('Direction') == classes).get('long').to_array();
  return {
     type: 'scattermapbox',
     name: classes,
     lat: df.filter(row => row.get('Direction') == classes).select('lat').toArray().flat(),
     lon: df.filter(row => row.get('Direction') == classes).select('lon').toArray().flat(),
     mode:'markers',
      marker: {
        size:14
      },
  };
});

console.log(data);

  var layout = {
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
    }
  };
  
  Plotly.setPlotConfig({
    mapboxAccessToken: "pk.eyJ1IjoicGthc2wiLCJhIjoiY2xkOWswampzMDl0bTNubW0zaGZwa3JudSJ9.rfPdeEe_uLSGhWcRZbbhpA"
  });
  
  Plotly.newPlot("myDiv", data, layout);

})(); 
});

