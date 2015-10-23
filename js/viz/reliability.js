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
        //var CHART_BASE_TITLE = 'Historical Trend for Labor Force Participation by Age Group';
        var MAP_TITLE = 'Site ';
        var CENTER = [37.871593,-122.272747];
        var CHART_ID = '#b-chart';
        var Y_AXIS = '';

        var CARTODB_USER = 'localdata';
        var sql = new cartodb.SQL({user: CARTODB_USER});

        var DIRECTIONS = {
            'NB': 'Northbound',
            'SB': 'Southbound',
            'EB': 'Eastbound',
            'WB': 'Westbound'
        };

        var TIME_SLIDER_VALUES = [{
          id: 1,
          value: "bti_12am",
          time: "12am"
        }, {
          id: 2,
          value: "bti_1am",
          time: "1am"
        }, {
          id: 3,
          value: "bti_2am",
          time: "2am"
        }, {
          id: 4,
          value: "bti_3am",
          time: "3am"
        }, {
          id: 5,
          value: "bti_4am",
          time: "4am"
        }, {
          id: 6,
          value: "bti_5am",
          time: "5am"
        }, {
          id: 7,
          value: "bti_6am",
          time: "6am"
        }, {
          id: 8,
          value: "bti_7am",
          time: "7am"
        }, {
          id: 9,
          value: "bti_8am",
          time: "8am"
        }, {
          id: 10,
          value: "bti_9am",
          time: "9am"
        }, {
          id: 11,
          value: "bti_10am",
          time: "10am"
        }, {
          id: 12,
          value: "bti_11am",
          time: "11am"
        }, {
          id: 13,
          value: "bti_12pm",
          time: "12pm"
        }, {
          id: 14,
          value: "bti_1pm",
          time: "1pm"
        }, {
          id: 15,
          value: "bti_2pm",
          time: "2pm"
        }, {
          id: 16,
          value: "bti_3pm",
          time: "3pm"
        }, {
          id: 17,
          value: "bti_4pm",
          time: "4pm"
        }, {
          id: 18,
          value: "bti_5pm",
          time: "5pm"
        }, {
          id: 19,
          value: "bti_6pm",
          time: "6pm"
        }, {
          id: 20,
          value: "bti_7pm",
          time: "7pm"
        }, {
          id: 21,
          value: "bti_8pm",
          time: "8pm"
        }, {
          id: 22,
          value: "bti_9pm",
          time: "9pm"
        }, {
          id: 23,
          value: "bti_10pm",
          time: "10pm"
        }, {
          id: 24,
          value: "bti_11pm",
          time: "11pm"
        }];

        var RELIABILTY_MIN_ZOOM = 5;

        var SELECTED_SEGMENT_STYLE = {
            radius: 5,
            fillColor: "#d9b305",
            color: "#ffff22",
            weight: 5,
            opacity: 1,
            fillOpacity: 1
        };
        var colors = allBlue;
        var BREAKS = [
            0,
            860,
            3120,
            6143,
            10710
        ];


        /* Global values for this viz */
        var reliabilityMap;
        var reliabilityStyle = _.template($('#reliability-template').html());
        var reliabilityLayer;
        var selectedSegmentLayer = L.geoJson();
        var time = 9;

        var template = _.template($('#map-legend-template').html());

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

            reliabilityMap.removeLayer(selectedSegmentLayer);
            selectedSegmentLayer = L.geoJson(shapes, {
                style: SELECTED_SEGMENT_STYLE
            });
            reliabilityMap.addLayer(selectedSegmentLayer);
        }

        function chart(data) {
            console.log("Got query data", data);
            data = data.rows;

            var amPeak = {
                name: 'AM Peak Buffer Time Index',
                data: _.pluck(data, 'bti_ampeak')
            };
            var pmPeak = {
                name: 'PM Peak Buffer Time Index',
                data: _.pluck(data, 'bti_pmpeak')
            };
            var years = _.pluck(data, 'year');


            var options = {
              chart: {
                renderTo: 'corridor-chart',
                defaultSeriesType: 'column'
              },
              series: [
                amPeak,
                pmPeak
              ],
              exporting: {
                enabled: true
              },
              legend: {
                enabled: false
              },
              yAxis: {
                title: {
                  text: 'Peak Period Buffer Time Index'
                }
              },
              xAxis: {
                categories: years
              },

              title: {
                text: ''
              },
              colors: [
                colors[2],
                colors[4]
              ],
              tooltip: {
                shared: true,
                crosshairs: false,
                pointFormat: '<div style="color:{series.color};padding:0">{series.name}: <b>{point.y:.1f}</b><br/></div>'
              }
            };

            console.log("using options", years);

            chart = new Highcharts.Chart(options);
        }

        function handleFeatureClick(event, latlng, pos, data, layerIndex) {
            console.log("Clicked congested segment", data);
            data.longDirection = DIRECTIONS[data.direction];
            $('#corridor-info-text').html(template(data));

            // Get data needed to create the chart
            var reliabilityPromise = sql.execute("select id, year, bti_ampeak, bti_pmpeak, direction FROM reliability_new WHERE id = '" + data.id + "' ORDER BY year ASC");
            reliabilityPromise.done(chart);
        }

        function setupInteraction() {
            function update(e) {
                time = _.find(TIME_SLIDER_VALUES, { id: parseInt(e.value, 10) });
                console.log("Changing time to", time, e.value);

                // Update the map title
                updateTitle();

                reliabilityLayer.set({
                    sql: "SELECT * FROM reliability_new where year = 2014",
                    cartocss: reliabilityStyle({
                        time: time.value
                    })
                });
            }

            var slider = $("#t9btimeslider").kendoSlider({
                min: 1,
                max: 24,
                tickPlacement: "none",
                change: update,
                slide: update,
                value: time,
                tooltip: {
                    template: function(e) {
                        return TIME_SLIDER_VALUES[e.value].time;
                    }
                }
            });
        }

        function layersLoaded(layer) {
            console.log("Layers loaded", layer);
            reliabilityLayer = layer.getSubLayer(0);

            // Add cursor interaction
            reliabilityLayer.setInteraction(true);
            cartodb.vis.Vis.addCursorInteraction(reliabilityMap, reliabilityLayer);

            // Show the tract when cursor is l
            reliabilityLayer.on('featureClick', handleFeatureClick);
        }

        function setupmap() {
            updateTitle();

            reliabilityMap = L.map('mapt9b', {
                center: CENTER,
                zoom: 9,
                minZoom: 8,
                fullscreen: true,
                scrollWheelZoom: false
            });

            // Standard basemap: postcode.kh28fdpk
            // Terrain basemap: postcode.mna0lfce
            var baseLayer = L.tileLayer('http://a.tiles.mapbox.com/v3/postcode.kh28fdpk/{z}/{x}/{y}.png')
                             .addTo(reliabilityMap);

            L.control.scale().addTo(reliabilityMap);
            reliabilityMap.addLayer(selectedSegmentLayer);

            console.log("Creating cartodb layer");
            cartodb.createLayer(reliabilityMap, {
              user_name: CARTODB_USER,
              cartodb_logo: false,
              type: 'cartodb',
              sublayers: [{
                sql: "SELECT * FROM reliability_new where year = 2014",
                cartocss: reliabilityStyle({
                    time: 'bti_5pm'
                }),
                interactivity: 'cartodb_id, id, corridor, direction, endpoint1, endpoint2'
              }]
            })
            .addTo(reliabilityMap)
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
            legendControl.addTo(reliabilityMap);
        }

        setupmap();
    });
})(jQuery);
