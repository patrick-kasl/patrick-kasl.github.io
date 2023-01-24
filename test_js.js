//var GtfsRealtimeBindings = require('./node_modules/gtfs-realtime-bindings');
import GtfsRealtimeBindings from "./node_modules/gtfs-realtime-bindings";
var request = require('request');

var requestSettings = {
    method: 'GET',
    url: 'https://realtime.sdmts.com/api/api/gtfs_realtime/vehicle-positions-for-agency/MTS.pb?key=e2f3da8d-2ea3-40cf-9e30-0b937f0e3817',
    encoding: null
};

console.log("test");
request(requestSettings, function (error, response, body) {
if (!error && response.statusCode == 200) {
    var feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);
    feed.entity.forEach(function(entity) {
    if (entity.vehicle.trip.route_id == '510') {
        console.log(entity.vehicle.trip.trip_id);
    }
    });
}
});