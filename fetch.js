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
})(); 
