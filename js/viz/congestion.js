/*globals
jQuery, L, geocities, allGreen, allOrange, altColors, Highcharts, turf, cartodb,
regionPromise, countyPromise, cityPromise, _
*/
(function($) {
    /*
    Overlay map that shows the various levels of sea level rise, flagging census
    tracts that would be considered impacted by SLR using 2013 population data.
    The color coding should emphasize the number of people impacted by
    displaying population density of affected zones. A slider bar should allow
    the user to choose different levels of SLR (1-6 feet), with 3 feet shown
    by default. A subtle animation might be a nice touch as the user activates
    different levels of SLR. Clicking on a zone should provide information about
    the number of people impacted if that zone is underwater. Affected airports
    should also appear as symbols or as a special color code when the SLR affects
    their property. A full-screen option should be provided for users.

    http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/EN11_SeaLevelRise/FeatureServer
    http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/EN11_SeaLevelRise/MapServer
    */

    $(function(){
        //var CHART_BASE_TITLE = 'Historical Trend for Labor Force Participation by Age Group';
        var MAP_TITLE = 'Site ';
        var CENTER = [37.871593,-122.272747];
        var CHART_ID = '#b-chart';
        var Y_AXIS = '';

        var CITY_KEY = 'City';
        var CITY_FEATURE_KEY = 'NAME';
        var COUNTY_KEY = 'County';

        var CARTODB_USER = 'localdata';

        var NUMBER_OF_RANKS = 144;
        var DIRECTIONS = {
            'NB': 'Northbound',
            'SB': 'Southbound',
            'EB': 'Eastbound',
            'WB': 'Westbound'
        };

        var SPEED_MIN_ZOOM = 5;
        var CONGESTION_STYLE = _.template($('#congestion-template').html())();
        var CENTER_STYLE = _.template($('#center-template').html())();
        var SPEED_STYLE = _.template($('#speed-template').html())();

        var sql = new cartodb.SQL({ user: 'localdata' });

        var congestionMap;
        var congestionLayer;
        var selectedSegmentLayer = L.geoJson();
        var time = "'18:00:00'";

        var template = _.template($('#map-legend-template').html());

        var SELECTED_SEGMENT_STYLE = {
            radius: 5,
            fillColor: "#d9b305",
            color: "#ffff22",
            weight: 5,
            opacity: 1,
            fillOpacity: 1
        };

        var COLORS = allGreen;

        var BREAKS = [
            0,
            860,
            3120,
            6143,
            10710
        ];

        var i;
        var regionData, countyData, cityData;

        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });


        function formatter() {
            if (this.value === 'Bay Area') {
                return '<span style="font-weight:800;color:#000;">' + this.value + '</span>';
            }
            return this.value;
        }


        function interaction(event, feature) {
            var p = feature.properties;
            console.log("Map clicked", p);

            $('#en-b-title').html(template(feature.properties));

            console.log(feature, template(feature.properties));
        }


        function updateTitle() {
            // TODO
        }

        function readableDate(date) {
            // Comes in like 18:00:00
            date = date.substring(0, 5);
            var minute = date.substring(3, 5);
            var hour = parseInt(date.substring(0,2), 10);
            var suffix;
            if (hour > 12) {
                hour -= 12;
                suffix = 'pm';
            } else {
                suffix = 'am';
            }

            return hour + ':' + minute + ' ' + suffix;
        }

        function highlightShape(data) {
            // Highlight the segments
            var shapes =  [];
            _.each(data.rows, function(row) {
                shapes.push({
                    type: 'Feature',
                    geometry: $.parseJSON(row.shape)
                });
            });

            congestionMap.removeLayer(selectedSegmentLayer);
            selectedSegmentLayer = L.geoJson(shapes, {
                style: SELECTED_SEGMENT_STYLE
            });
            congestionMap.addLayer(selectedSegmentLayer);
        }

        function updateSidebar(data) {
            // Data processing TODO:
            data = data.rows[0];
            data.starttime = readableDate(data.starttime);
            data.endtime = readableDate(data.endtime);
            data.longDirection = DIRECTIONS[data.direction];

            var rank = parseInt(data.rank, 10);
            data.rankPercent = 100 - rank / NUMBER_OF_RANKS * 100;
            data.rankPercent = data.rankPercent.toFixed(0);

            var lastDigit = data.rank[data.rank.length - 1];
            var suffix = 'th';
            if (lastDigit === '1') {
                suffix = 'st';
            }
            if (lastDigit === '2') {
                suffix = 'nd';
            }
            if (lastDigit === '3') {
                suffix = 'rd';
            }

            data.rankSuffix = suffix;

            console.log("Got query data", data);

            $('#legend').html(template(data));

            // Fetch
            var shapePromise = sql.execute("SELECT ST_AsGeoJSON(the_geom) as shape, cartodb_id, location, rank FROM congestion WHERE location = '" + data.location + "' and endtime > " + time + " and starttime < " + time, { location: data.location });
            shapePromise.done(highlightShape);
        }


        function handleFeatureClick(event, latlng, pos, data, layerIndex) {
            console.log("Clicked congested segment", data, pos );

            // Fetch
            var congestionPromise = sql.execute("SELECT ST_AsGeoJSON(the_geom) as shape, cartodb_id, delay_veh_hrs, endtime, starttime, highway, direction, location, rank FROM congestion WHERE cartodb_id = {{id}}", { id: data.cartodb_id });

            // TODO -- should use .then, but CartoDB promises don't
            // seem to play nice with that (or jquery)
            congestionPromise.done(updateSidebar);
        }

        function setupInteraction() {
            function update(e) {
                time = e.value;

                // Update the map title
                updateTitle();

                congestionLayer.set({
                    sql: "SELECT * FROM speed_segments", // WHERE time <=" + time,
                    cartocss: SPEED_STYLE
                });
            }

            var slider = $("#congestion-time-select").kendoSlider({
                min: 1,
                max: 24,
                tickPlacement: "none",
                change: update,
                slide: update,
                value: time,
                tooltip: {
                    template: function(e) {
                        return e.value + ' [am/pm]';
                    }
                }
            });
        }

        function layersLoaded(layer) {
            congestionLayer = layer.getSubLayer(2);

            // Add cursor interaction
            congestionLayer.setInteraction(true);
            cartodb.vis.Vis.addCursorInteraction(congestionMap, congestionLayer);

            // Show the tract when cursor is l
            congestionLayer.on('featureClick', handleFeatureClick);
        }

        function setupMap() {
            updateTitle();

            congestionMap = L.map('map-congestion', {
                center: CENTER,
                zoom: 9,
                minZoom: 8,
                fullscreen: true,
                scrollWheelZoom: false
            });

            // Standard basemap: postcode.kh28fdpk
            // Terrain basemap: postcode.mna0lfce
            var baseLayer = L.tileLayer('http://a.tiles.mapbox.com/v3/postcode.kh28fdpk/{z}/{x}/{y}.png')
                             .addTo(congestionMap);

            L.control.scale().addTo(congestionMap);
            congestionMap.addLayer(selectedSegmentLayer);

            // Add the layers to the two maps
            // Add the SLR map
            var cdbCongestion = cartodb.createLayer(congestionMap, {
              user_name: CARTODB_USER,
              cartodb_logo: false,
              type: 'cartodb',
              sublayers: [{
                sql: "SELECT * FROM speed_data_merged where hour_beginning = " + time,
                cartocss: SPEED_STYLE
              }, {
                sql: "SELECT * FROM speed_segments",
                cartocss: CENTER_STYLE
              }, {
                sql: "select * from congestion where endtime > " + time + " and starttime < " + time,
                cartocss: CONGESTION_STYLE,
                interactivity: 'cartodb_id'
              }]
            })
            .addTo(congestionMap)
            .done(layersLoaded);

            setupInteraction();

            // Add the legend
            var legendControl = new L.control({
                position: 'bottomright'
            });

            legendControl.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend');
                $(div).addClass("col-lg-12");
                return;
                /*
                $(div).append("<h5>Population  Density<br> of Neighborhoods at Risk</h5>");
                $(div).append("<p>Population per square mile</p>");

                // loop through our density intervals and generate a label
                // with a colored square for each interval
                var i;
                for (i = 0; i < BREAKS.length; i++) {
                    var s = '<div class="legend-row"><div class="legend-color" style="background:' + COLORS[i] + ';">&nbsp; </div><div class="legend-text">';

                    if (i === 0) {
                        s += BREAKS[i].toLocaleString() + ' - ' + BREAKS[i+1].toLocaleString();
                    }

                    if (i !== BREAKS.length - 1 && i !== 0) {
                        s += (BREAKS[i] + 1).toLocaleString() + ' - ' + BREAKS[i+1].toLocaleString();
                    }

                    if (i === BREAKS.length - 1) {
                        s += (BREAKS[i] + 1).toLocaleString() + '+';
                    }

                    $(div).append(s);
                }

                return div;
                */
            };
            legendControl.addTo(congestionMap);
        }

        setupMap();
    });
})(jQuery);
