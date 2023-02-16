var GtfsRealtimeBindings = require('./node_modules/gtfs-realtime-bindings');
var fetch = require('./node_modules/cross-fetch');


const route_color_to_plot_color_json = '{"Blue":"#0063a7", "Green":"#01ab52", "Orange":"#f78320"}';
const route_color_to_plot_color = JSON.parse(route_color_to_plot_color_json);

const color_to_route_id_json = '{"Blue": 510, "Green":530, "Orange":520}';
const color_to_route_id = JSON.parse(color_to_route_id_json);


var trips;
var shapes;
var updated_time;
var route_color = "Blue";

function choose(choice) {
    route_color = choice;
};
// This allows the function to be used by the button in HTML
window.choose = choose;

function trolley_geojson(lon, lat, direction) {

    console.log(direction);
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
        console.log(updated_time);
        document.getElementById("last_updated").innerHTML = updated_time.toLocaleString();
        
        if (route_color == "Blue"){
            const dir_1 = "North";
            document.getElementById("first_direction").innerHTML = dir_1;
            document.getElementById("second_direction").innerHTML = "South";
        } else {
            document.getElementById("first_direction").innerHTML = "East";
            document.getElementById("second_direction").innerHTML = "West";
        };
        
        return mapbox_features;
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }
};



d3.json("./trips_test.json", function (data) {
    trips = data;

    d3.json("./all_lines_shape.json", function (data) {
        //d3.json("./blue_line_shape.json", function (data) {
        shapes = data;

        mapboxgl.accessToken = 'pk.eyJ1IjoicGthc2wiLCJhIjoiY2xkOWswampzMDl0bTNubW0zaGZwa3JudSJ9.rfPdeEe_uLSGhWcRZbbhpA';
        const map = new mapboxgl.Map({
            container: 'map',
            // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
            style: 'mapbox://styles/pkasl/cldhqqkmp000z01pf374os34v',
            center: [-117.138044, 32.716734],
            zoom: 10
        });

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

            //document.getElementById('blueButton').onclick = getLocation('520')

            // Update the source from the API every 2 seconds.
            const updateSource = setInterval(async () => {
                const mapbox_features = await getLocation(route_color);

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

                map.getSource('trolley_locations').setData(
                    {
                        'type': 'FeatureCollection',
                        'properties': {},
                        'features': mapbox_features,
                    }
                );
                
            }, 1000);

        });
    });
});
