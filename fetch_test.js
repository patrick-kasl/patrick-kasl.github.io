var GtfsRealtimeBindings = require('./node_modules/gtfs-realtime-bindings');
var fetch = require('./node_modules/cross-fetch');

const route_color_to_plot_color_json = '{"Blue":"#0063a7", "Green":"#01ab52", "Orange":"#f78320"}';
const route_color_to_plot_color = JSON.parse(route_color_to_plot_color_json);

const color_to_route_id_json = '{"Blue": 510, "Green":530, "Orange":520}';
const color_to_route_id = JSON.parse(color_to_route_id_json);


var trips;
var shapes;
var stop_names;
var stop_id_to_name;
var updated_time;
var arrival_time_out;
var hmtl_holder;
var direction = 0;
var direction_name = 'North';
var route_color = "Blue";

mapboxgl.accessToken = 'pk.eyJ1IjoicGthc2wiLCJhIjoiY2xkOWswampzMDl0bTNubW0zaGZwa3JudSJ9.rfPdeEe_uLSGhWcRZbbhpA';
var map = new mapboxgl.Map({
    container: 'map',
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/pkasl/cldhqqkmp000z01pf374os34v',
    center: [-117.138044, 32.716734],
    zoom: 10
});

function changeRoute(choice) {
    route_color = choice;
    map.getSource('route').setData(
        {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': shapes[route_color]['lat_lon']
            }
        }
    );

    map.setPaintProperty(
        'route',
        'line-color',
        route_color_to_plot_color[route_color]
    );

    const mapbox_features = getLocation(route_color);

    map.getSource('trolley_locations').setData(
        {
            'type': 'FeatureCollection',
            'properties': {},
            'features': mapbox_features,
        }
    );

    if (route_color == "Blue") {
        document.getElementById("first_direction").innerHTML = "North";
        document.getElementById("second_direction").innerHTML = "South";
    } else {
        document.getElementById("first_direction").innerHTML = "East";
        document.getElementById("second_direction").innerHTML = "West";
    };

    document.getElementById("direction_name_table").innerHTML = tableTitleDirection(route_color, direction);
};

// This allows the function to be used by the button in HTML
window.changeRoute = changeRoute;

function tableTitleDirection(route_color, direction){
    var titleDirection;
    
    if (route_color == "Blue") {
        if (direction == 0){
            titleDirection = "North";
            //document.getElementById("direction_name_table").innerHTML = "North";
        }

        if (direction == 1){
            titleDirection = "South";
            //document.getElementById("direction_name_table").innerHTML = "South";
        }
    } else {
        if (direction == 0){
            titleDirection = "East";
            //document.getElementById("direction_name_table").innerHTML = "East";
        }

        if (direction == 1){
            titleDirection = "West";
            //document.getElementById("direction_name_table").innerHTML = "West";
        }
    };
    return titleDirection;
};

function changeDirection(choice) {
    direction = choice;

    document.getElementById("direction_name_table").innerHTML = tableTitleDirection(route_color, direction);

    arrival_time_out  = mts_predicted_arrival_times(route_color);
    const table_body = document.getElementById("table_body");
    table_body.innerHTML = tableHTML(arrival_time_out, direction);

};

// This allows the function to be used by the button in HTML
window.changeDirection = changeDirection;


function tableHTML(arrival_time_out, direction){

    hmtl_holder = [];
    console.log(arrival_time_out);

    stop_names.stops[route_color].forEach(function (stop) {
        hmtl_holder.push(`<tr>`);
        hmtl_holder.push(`<th scope="row" style = "font-size: 0.85em;">${stop}</th>`);
        //table_body.innerHTML += ;
        
        let temp = arrival_time_out[direction].get(stop);
        for (let i=0;i<=2;i++){
            hmtl_holder.push(`<td>${temp[i]}</td>`);
            //table_body.innerHTML += `<td>${temp[i]}</td>`;
        };
        hmtl_holder.push(`</tr>`);
    });

    return hmtl_holder.join('');
};



function trolley_geojson(lon, lat, direction) {

    //console.log(direction);
    return {
        // feature for Mapbox DC
        'type': 'Feature',
        'geometry': {
            'type': 'Point',
            'coordinates': [lon, lat]
        },
        'properties': {
            'direction': direction
        }
    };
};

async function mts_predicted_arrival_times(route_color) {

    try {
        const response = await fetch("https://realtime.sdmts.com/api/api/gtfs_realtime/trip-updates-for-agency/MTS.pb?key=e2f3da8d-2ea3-40cf-9e30-0b937f0e3817", {});

        const buffer = await response.arrayBuffer();
        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
            new Uint8Array(buffer)
        );

        // These will store the predicted times from the most recent feed of trip updates
        let stop_times_direction_one = new Map();
        let stop_times_direction_two = new Map();

        
        stop_names.stops[route_color].forEach(function (stop) {
            stop_times_direction_one.set(stop, []);
            stop_times_direction_two.set(stop, []);
        });
        
        feed.entity.forEach(function (entity) {
            if (entity.tripUpdate.trip != null) {
                if (entity.tripUpdate.trip.routeId == color_to_route_id[route_color]) {
                    if (route_color == "Blue") {
                        if (trips[entity.tripUpdate.trip.tripId].direction_name == 'North') {
                            entity.tripUpdate.stopTimeUpdate.forEach(function (stop_time_update) {
                                let test = stop_times_direction_one.get(stop_id_to_name[stop_time_update.stopId]);
                                test.push(Math.round((stop_time_update.arrival.time*1000 - Date.now())/(1000*60)));
                            });
                        }
                        if (trips[entity.tripUpdate.trip.tripId].direction_name == 'South') {
                            entity.tripUpdate.stopTimeUpdate.forEach(function (stop_time_update) {
                                let test = stop_times_direction_two.get(stop_id_to_name[stop_time_update.stopId]);
                                test.push(Math.round((stop_time_update.arrival.time*1000 - Date.now())/(1000*60)));
                            });
                        }
                    } else {
                        if (trips[entity.tripUpdate.trip.tripId].direction_name == 'West') {
                            entity.tripUpdate.stopTimeUpdate.forEach(function (stop_time_update) {
                                let test = stop_times_direction_one.get(stop_id_to_name[stop_time_update.stopId]);
                                test.push(Math.round((stop_time_update.arrival.time*1000 - Date.now())/(1000*60)));
                            });
                        }
                        if (trips[entity.tripUpdate.trip.tripId].direction_name == 'East') {
                            entity.tripUpdate.stopTimeUpdate.forEach(function (stop_time_update) {
                                let test = stop_times_direction_two.get(stop_id_to_name[stop_time_update.stopId]);
                                test.push(Math.round((stop_time_update.arrival.time*1000 - Date.now())/(1000*60)));
                            });
                        }

                    }
                }

            }
        
        });

        stop_names.stops[route_color].forEach(function (stop) {
            stop_times_direction_one.set(stop, stop_times_direction_one.get(stop).sort(function(a, b){return a-b}));
            stop_times_direction_one.set(stop, stop_times_direction_one.get(stop).filter( x => x > -0 ));
            stop_times_direction_one.set(stop, stop_times_direction_one.get(stop).filter( function( item, index, inputArray ) {return inputArray.indexOf(item) == index}));

            stop_times_direction_two.set(stop, stop_times_direction_two.get(stop).sort(function(a, b){return a-b}));
            stop_times_direction_two.set(stop, stop_times_direction_two.get(stop).filter( x => x > -0 ));
            stop_times_direction_two.set(stop, stop_times_direction_two.get(stop).filter( function( item, index, inputArray ) {return inputArray.indexOf(item) == index}));
        });

        stop_names.stops[route_color].forEach(function (stop) {
            let test = stop_times_direction_one.get(stop);
            test.push('*');
            test.push('*');
            test.push('*'); 
            
            let test_2 = stop_times_direction_two.get(stop);
            test_2.push('*');
            test_2.push('*');
            test_2.push('*'); 

        });

        
        return [stop_times_direction_one, stop_times_direction_two];
    }
    catch (error) {
        console.log(error);
        //process.exit(1);
    }
};

async function getLocation(route_color) {
    try {
        const response = await fetch("https://realtime.sdmts.com/api/api/gtfs_realtime/vehicle-positions-for-agency/MTS.pb?key=e2f3da8d-2ea3-40cf-9e30-0b937f0e3817", {});

        const buffer = await response.arrayBuffer();
        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
            new Uint8Array(buffer)
        );

        var mapbox_features = [];
        feed.entity.forEach(function (entity) {
            if (entity.vehicle.trip != null) {
                if (entity.vehicle.trip.routeId == color_to_route_id[route_color]) {
                    mapbox_features.push(trolley_geojson(entity.vehicle.position.longitude, entity.vehicle.position.latitude, trips[entity.vehicle.trip.tripId].direction_name));
                }
            }
        });
        updated_time = new Date(feed.header.timestamp * 1000);
        // We're at an eight hour offset from UTC: 8*60*60
        //(updated_time);
        document.getElementById("last_updated").innerHTML = updated_time.toLocaleString();

        return mapbox_features;
    }
    catch (error) {
        console.log(error);
        //process.exit(1);
    }
};



d3.json("./trips_test.json", function (data) {
    trips = data;

    d3.json("./all_lines_shape.json", function (data) {
        shapes = data;

        d3.json("./stop_names.json", function (data) {
            stop_names = data;

            d3.json("./stop_id_to_name_mapping.json", function (data) {
                stop_id_to_name = data;

                if (route_color == "Blue") {
                    document.getElementById("first_direction").innerHTML = "North";
                    document.getElementById("second_direction").innerHTML = "South";
                } else {
                    document.getElementById("first_direction").innerHTML = "East";
                    document.getElementById("second_direction").innerHTML = "West";
                };

                document.getElementById("direction_name_table").innerHTML = tableTitleDirection(route_color, direction);

                map.on('load', async () => {
                    // Get the locations of all Vehicle positions.

                    // Add a Blue line for the Blue line route
                    // This won't change on refresh
                    map.addSource('route', {
                        'type': 'geojson',
                        'data': {
                            'type': 'Feature',
                            'properties': {},
                            'geometry': {
                                'type': 'LineString',
                                'coordinates': shapes[route_color]['lat_lon']
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
                            'line-color': route_color_to_plot_color[route_color],
                            'line-width': 5
                        }
                    });
                    // Add the Blue Line Trolley locations as a source.

                    const mapbox_features = await getLocation(route_color);

                    arrival_time_out  = await mts_predicted_arrival_times(route_color, direction);
                    const table_body = document.getElementById("table_body");
                    table_body.innerHTML = tableHTML(arrival_time_out, direction);
                    
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
                                'East', '#02ffc4',
                                'West', '#dd02ff',
                /*else */ '#ccc'
                            ],

                            'circle-stroke-color': 'white'
                        }
                    });

                    // Update the source from the API every 2 seconds.
                    const updateSource = setInterval(async () => {
                        const mapbox_features = await getLocation(route_color);

                        map.getSource('trolley_locations').setData(
                            {
                                'type': 'FeatureCollection',
                                'properties': {},
                                'features': mapbox_features,
                            }
                        );

                        arrival_time_out  = await mts_predicted_arrival_times(route_color);
                        const table_body = document.getElementById("table_body");
                        table_body.innerHTML = tableHTML(arrival_time_out, direction);

                    }, 2000);

                });
            });
        });
    });
});
