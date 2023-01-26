var GtfsRealtimeBindings = require('./node_modules/gtfs-realtime-bindings');
var fetch = require('./node_modules/cross-fetch');

var latitude_arr = [];
var longitude_arr = [];

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
                latitude_arr.push(entity.vehicle.position.latitude);
                longitude_arr.push(entity.vehicle.position.longitude);
                //console.log(entity.vehicle);
            }
        }
    });
console.log(latitude_arr);
console.log(longitude_arr);
}
catch (error) {
    console.log(error);
    process.exit(1);
}

var data = [
    {
      type: "scattermapbox",
      lat: latitude_arr,
      lon: longitude_arr,
      mode: "markers",
      marker: {
        size: 14
      },
      //text: ["Montreal"]
    }
  ];
  
  var layout = {
    autosize: true,
    hovermode: "closest",
    mapbox: {
      bearing: 0,
      center: {
        lat: 32.716734,
        lon: -117.138044
      },
      pitch: 0,
      zoom: 10
    }
  };
  
  Plotly.setPlotConfig({
    mapboxAccessToken: "pk.eyJ1IjoicGthc2wiLCJhIjoiY2xkOWswampzMDl0bTNubW0zaGZwa3JudSJ9.rfPdeEe_uLSGhWcRZbbhpA"
  });
  
  Plotly.newPlot("myDiv", data, layout);

})(); 
