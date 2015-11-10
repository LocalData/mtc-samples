/*globals
jQuery, L, geocities, allBlue, allOrange, altColors, Highcharts, turf, cartodb,
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
        var CONGESTION_FAR_STYLE = _.template($('#congestion-far-template').html())();
        var CENTER_STYLE = _.template($('#center-template').html())();
        var SPEED_STYLE = _.template($('#speed-template').html())();

        var sql = new cartodb.SQL({ user: 'localdata' });

        var congestionMap;
        var congestionLayer, congestionFarLayer, speedLayer;
        var selectedSegmentLayer = L.geoJson();
        var legendControl;

        var TIME_SLIDER_VALUES = [{
          id: 1,
          value: "'00:00:00'",
          time: "12am"
        }, {
          id: 2,
          value: "'01:00:00'",
          time: "1am"
        }, {
          id: 3,
          value: "'02:00:00'",
          time: "2am"
        }, {
          id: 4,
          value: "'03:00:00'",
          time: "3am"
        }, {
          id: 5,
          value: "'04:00:00'",
          time: "4am"
        }, {
          id: 6,
          value: "'05:00:00'",
          time: "5am"
        }, {
          id: 7,
          value: "'06:00:00'",
          time: "6am"
        }, {
          id: 8,
          value: "'07:00:00'",
          time: "7am"
        }, {
          id: 9,
          value: "'08:00:00'",
          time: "8am"
        }, {
          id: 10,
          value: "'09:00:00'",
          time: "9am"
        }, {
          id: 11,
          value: "'10:00:00'",
          time: "10am"
        }, {
          id: 12,
          value: "'11:00:00'",
          time: "11am"
        }, {
          id: 13,
          value: "'12:00:00'",
          time: "12pm"
        }, {
          id: 14,
          value: "'13:00:00'",
          time: "1pm"
        }, {
          id: 15,
          value: "'14:00:00'",
          time: "2pm"
        }, {
          id: 16,
          value: "'15:00:00'",
          time: "3pm"
        }, {
          id: 17,
          value: "'16:00:00'",
          time: "4pm"
        }, {
          id: 18,
          value: "'17:00:00'",
          time: "5pm"
        }, {
          id: 19,
          value: "'18:00:00'",
          time: "6pm"
        }, {
          id: 20,
          value: "'19:00:00'",
          time: "7pm"
        }, {
          id: 21,
          value: "'20:00:00'",
          time: "8pm"
        }, {
          id: 22,
          value: "'21:00:00'",
          time: "9pm"
        }, {
          id: 23,
          value: "'22:00:00'",
          time: "10pm"
        }, {
          id: 24,
          value: "'23:00:00'",
          time: "11pm"
        }];
        var time = TIME_SLIDER_VALUES[9];

        var template = _.template($('#map-legend-template').html());

        var SELECTED_SEGMENT_STYLE = {
            radius: 5,
            fillColor: "#d9b305",
            color: "#ebf345",
            weight: 5,
            opacity: 1,
            fillOpacity: 1
        };

        var COLORS = allBlue.reverse();
        var COLOR_SCALE = [
            '#235365',
            '#2c6d8c',
            '#4ba8d3',
            '#8dbfd2',
            '#c6e2ec'
        ];
        var BREAKS = [
            0,
            26,
            38,
            50,
            61
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


        function updateTitle() {
            $('#timesliderheading').html(time.time);
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
            selectedSegmentLayer.bringToFront();
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

            $('.corridor-info-text').html(template(data));

            // Fetch
            var shapePromise = sql.execute("SELECT ST_AsGeoJSON(the_geom) as shape, cartodb_id, location, rank FROM congestion WHERE location = '" + data.location + "' and endtime > " + time.value + " and starttime < " + time.value, { location: data.location });
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
                time = _.find(TIME_SLIDER_VALUES, { id: parseInt(e.value, 10) });
                console.log(time);

                // Update the map title
                updateTitle();

                speedLayer.set({
                    sql: "SELECT * FROM speed_data_merged WHERE hour_beginning =" + time.value
                });
                congestionLayer.set({
                    sql: "select * from congestion where endtime > " + time.value + " and starttime < " + time.value
                });
                congestionFarLayer.set({
                    sql: "select * from congestion where endtime > " + time.value + " and starttime < " + time.value
                });

                // congestionLayer.setSQL("SELECT * FROM speed_data_merged WHERE hour_beginning =" + time.value);
            }

            var slider = $("#T7-B-time-slider").kendoSlider({
                min: 1,
                max: 24,
                tickPlacement: "none",
                change: update,
                slide: update,
                value: time.id,
                tooltip: {
                    template: function(e) {
                        return TIME_SLIDER_VALUES[e.value - 1].time;
                    }
                }
            });
        }

        function layersLoaded(layer) {
            speedLayer = layer.getSubLayer(1);
            congestionFarLayer = layer.getSubLayer(0);
            congestionLayer = layer.getSubLayer(3);

            // Add cursor interaction
            congestionFarLayer.setInteraction(true);
            congestionLayer.setInteraction(true);
            cartodb.vis.Vis.addCursorInteraction(congestionMap, congestionFarLayer);
            cartodb.vis.Vis.addCursorInteraction(congestionMap, congestionLayer);

            // Show the tract when cursor is l
            congestionLayer.on('featureClick', handleFeatureClick);
            congestionFarLayer.on('featureClick', handleFeatureClick);
        }

        function updateLegend() {
          // Clear out existing legend.
          var $div = $('.info.legend');
          $div.html('');
          $div.append("<h5>Congestion &amp; Travel Speeds</h5>");

          // Add the congestion header
          $div.append('<div class="legend-row"><div class="legend-color" style="background:' + allOrange[2] + ';">&nbsp; </div><div class="legend-text">Congested</div></div>');

          if (congestionMap.getZoom() < 11) {
            // If we are zoomed far out, show a basic level
            $div.append('<div class="legend-row"><div class="legend-color" style="background:#88b5c4;">&nbsp; </div><div class="legend-text">Highways</div></div>');
            $div.append('<div class="legend-row"><div class="legend-text">Zoom in to see speed details</div></div>');
          } else {

            // loop through our density intervals and generate a label
            // with a colored square for each interval
            var i;
            for (i = 0; i < BREAKS.length; i++) {
                var s = '<div class="legend-row"><div class="legend-color" style="background:' + COLOR_SCALE[i] + ';">&nbsp; </div><div class="legend-text">';

                if (i === 0) {
                    s += BREAKS[i].toLocaleString() + ' - ' + BREAKS[i+1].toLocaleString() + ' mph';
                }

                if (i !== BREAKS.length - 1 && i !== 0) {
                    s += (BREAKS[i] + 1).toLocaleString() + ' - ' + BREAKS[i+1].toLocaleString() + ' mph';
                }

                if (i === BREAKS.length - 1) {
                    s += (BREAKS[i] + 1).toLocaleString() + '+ mph';
                }

                $div.append(s);
            }
          }
        }

        function setupMap() {
            updateTitle();

            congestionMap = L.map('mapt7b', {
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

            // Make sure the selected segment stays on top
            congestionMap.on('zoomend', function() {
                if(selectedSegmentLayer) {
                    selectedSegmentLayer.bringToFront();
                }

                updateLegend();
            });

            // Add the layers to the two maps
            // Add the SLR map
            var cdbCongestion = cartodb.createLayer(congestionMap, {
              user_name: CARTODB_USER,
              cartodb_logo: false,
              type: 'cartodb',
              sublayers: [{
                sql: "select * from congestion where endtime > " + time.value + " and starttime < " + time.value,
                cartocss: CONGESTION_STYLE,
                interactivity: 'cartodb_id'
              }, {
                sql: "SELECT * FROM speed_data_merged where hour_beginning = " + time.value,
                cartocss: SPEED_STYLE
              }, {
                sql: "SELECT * FROM speed_segments",
                cartocss: CENTER_STYLE
              }, {
                sql: "select * from congestion where endtime > " + time.value + " and starttime < " + time.value,
                cartocss: CONGESTION_FAR_STYLE,
                interactivity: 'cartodb_id'
              }]
            })
            .addTo(congestionMap)
            .done(layersLoaded);

            setupInteraction();

            // Add the legend
            legendControl = new L.control({
                position: 'bottomright'
            });

            legendControl.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend');
                $(div).addClass("col-lg-12");

                $(div).append("<h5>Congestion &amp; Travel Speeds</h5>");

                // Add the congestion header
                $(div).append('<div class="legend-row"><div class="legend-color" style="background:' + allOrange[2] + ';">&nbsp; </div><div class="legend-text">Congested</div></div>');
                $(div).append('<div class="legend-row"><div class="legend-color" style="background:#88b5c4;">&nbsp; </div><div class="legend-text">Highways</div></div>');
                $(div).append('<div class="legend-row"><div class="legend-text">Zoom in to see speed details</div></div>');

                /*
                // loop through our density intervals and generate a label
                // with a colored square for each interval
                var i;
                for (i = 0; i < BREAKS.length; i++) {
                    var s = '<div class="legend-row"><div class="legend-color" style="background:' + COLOR_SCALE[i] + ';">&nbsp; </div><div class="legend-text">';

                    if (i === 0) {
                        s += BREAKS[i].toLocaleString() + ' - ' + BREAKS[i+1].toLocaleString() + ' mph';
                    }

                    if (i !== BREAKS.length - 1 && i !== 0) {
                        s += (BREAKS[i] + 1).toLocaleString() + ' - ' + BREAKS[i+1].toLocaleString() + ' mph';
                    }

                    if (i === BREAKS.length - 1) {
                        s += (BREAKS[i] + 1).toLocaleString() + '+ mph';
                    }

                    $(div).append(s);
                }*/

                return div;
            };
            legendControl.addTo(congestionMap);
        }

        setupMap();
    });
})(jQuery);
