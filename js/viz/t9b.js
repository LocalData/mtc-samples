/*globals
jQuery, L, geocities, allBlue, allOrange, altColors, Highcharts, turf, cartodb,
regionPromise, countyPromise, cityPromise, _
*/
(function($) {
    $(function(){
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
        var time = TIME_SLIDER_VALUES[9];

        var RELIABILTY_MIN_ZOOM = 5;

        var SELECTED_SEGMENT_STYLE = {
            fillColor: "#d9b305",
            color: "#40315a",
            weight: 3,
            opacity: 1,
            fillOpacity: 1
        };
        var colors = allBlue;
        var COLOR_SCALE = [
          '#3d9cc8',
          '#88b5c4',
          '#d9b305',
          '#ea9e77',
          '#ec7429'
        ];

        var BREAKS = [
            0,
            0.25,
            0.5,
            1.0,
            1.5
        ];

        var reliabilityMap;
        var reliabilityStyle = _.template($('#reliability-template').html());
        var reliabilityLayer;
        var selectedSegmentLayer = L.geoJson();
        var selectedSegmentData;
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
            $('#timesliderheading').html('Time of day - ' + time.time);
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


        function makeMapFullScreen(event) {
            event.preventDefault();
            $('.make-map-fullscreen').hide();
            $('.reduce-map-size').show();
            var center = reliabilityMap.getCenter();

            var $container = $('#mapt9b');
            $container.toggleClass('fullscreen-map-container');

            // Move the legend
            $('.info.legend').show();
            $('#mapt9b .info.legend').hide();
            $('#mapt9b').height(625);
            $("#T9-B-info").height(625);

            // Calculate thew new offset
            var offset = $('#mapt9b').offset();
            var leftOffset = offset.left;

            // Get any existing left offset
            var left = $container.css('left');
            left = _.trim(left, 'px');
            left = parseInt(left, 10);
            console.log('left', left);
            if (left) {
                console.log("We need add subtract", left);
                leftOffset -= left;
            }

            // Set the new offiset
            $container.css('left', '-' + leftOffset + 'px');

            // Set the new width
            var fullWidth = window.innerWidth; // - 30;
            $container.width(fullWidth);

            console.log("Resizing?", offset, leftOffset, fullWidth);

            // Resize the map if the window resizes
            window.addEventListener('resize', makeMapFullScreen);
            reliabilityMap._onResize();

            reliabilityMap.panTo(center);
            console.log("Panned to ", center);
        }

        function disableFullScreen(event) {
            event.preventDefault();
            $('.make-map-fullscreen').show();
            $('.reduce-map-size').hide();

            var center = reliabilityMap.getCenter();

            // Move the legend
            $('.info.legend').hide();
            $('#mapt9b .info.legend').show();
            $('#mapt9b').height(550);
            $("#T9-B-info").height('auto');

            window.removeEventListener('resize', makeMapFullScreen);

            var $container = $('#mapt9b');
            $container.removeClass('fullscreen-map-container');
            $container.css('left', 'auto');
            $container.css('width', '100%');

            reliabilityMap._onResize();
            reliabilityMap.panTo(center);
            console.log("Panned to ", center);
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

        function chart() {
          if(!selectedSegmentData) {
            return;
          }
          var series = [];
          _.each(TIME_SLIDER_VALUES, function(t) {
            series.push(Number(selectedSegmentData[t.value]));
          });

          var options = {
            chart: {
              renderTo: 'corridor-chart',
              type: 'line',
              marginTop: 40
            },
            title: {
              text: ''
            },
            series: [{
              name: 'BTI',
              data: series
            }],
            exporting: {
              enabled: true
            },
            legend: {
              enabled: false
            },
            yAxis: {
              title: {
                text: 'Buffer Time Index'
              },
              max: 2.5,
              min: 0
            },
            xAxis: {
              categories: _.pluck(TIME_SLIDER_VALUES, 'time'),
              plotBands: [{
                from: time.id - 1.5,
                to: time.id - 0.5,
                color: '#eff4f5'
              }]
            },
            colors: [allBlue[3]],
            plotOptions: {
              line: {
                animation: false
              }
            },
            tooltip: {
              shared: true,
              crosshairs: false,
              pointFormat: '<div style="color:{series.color};padding:0">{series.name}: <b>{point.y:.1f}</b><br/></div>'
            }
          };

          console.log("Charting using", series);

          var corridorChart = new Highcharts.Chart(options);
        }

        function updateSidebar() {
          console.log("Update", selectedSegmentData);
          if(!selectedSegmentData) {
            return;
          }

          var data = selectedSegmentData;
          data.longDirection = DIRECTIONS[data.direction];
          data.bti = data[time.value].toFixed(2);
          data.time = time.time;

          $('.corridor-info-text').html(template(data));
          chart();
        }

        function handleFeatureClick(event, latlng, pos, data, layerIndex) {
            selectedSegmentData = data;
            updateSidebar();

            // Handle selecting the shape
            var shapePromise = sql.execute("SELECT ST_AsGeoJSON(the_geom) as shape, cartodb_id FROM reliability_cleaned WHERE year=2014 AND id = '" + data.id + "'");
            shapePromise.done(highlightShape);

            // Get data needed to create the chart
            // var reliabilityPromise = sql.execute("select id, year, bti_ampeak, bti_pmpeak, direction FROM reliability_cleaned WHERE id = '" + data.id + "' ORDER BY year ASC");
            // reliabilityPromise.done(chart);
        }

        function setupInteraction() {
            function update(e) {
                time = _.find(TIME_SLIDER_VALUES, { id: parseInt(e.value, 10) });
                console.log(time);

                updateTitle();
                updateSidebar();

                reliabilityLayer.set({
                    sql: "SELECT * FROM reliability_cleaned where year = 2014",
                    cartocss: reliabilityStyle({
                        time: time.value,
                        colors: COLOR_SCALE
                    })
                });
            }

            var slider = $("#t9btimeslider").kendoSlider({
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
            $('.make-map-fullscreen').click(makeMapFullScreen);
            $('.reduce-map-size').click(disableFullScreen);

            reliabilityLayer = layer.getSubLayer(0);

            // Add cursor interaction
            reliabilityLayer.setInteraction(true);
            cartodb.vis.Vis.addCursorInteraction(reliabilityMap, reliabilityLayer);

            // Show the tract when cursor is l
            reliabilityLayer.on('featureClick', handleFeatureClick);
        }

        function clearSelectedElement() {
          $('.corridor-info-text').html('');
          reliabilityMap.removeLayer(selectedSegmentLayer);
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

            reliabilityMap.on('click', clearSelectedElement);

            cartodb.createLayer(reliabilityMap, {
              user_name: CARTODB_USER,
              cartodb_logo: false,
              type: 'cartodb',
              sublayers: [{
                sql: "SELECT * FROM reliability_cleaned where year = 2014",
                cartocss: reliabilityStyle({
                    time: time.value,
                    colors: COLOR_SCALE
                }),
                interactivity: 'cartodb_id, id, corridor, direction, endpoint1, endpoint2, bti_12am, bti_1am, bti_2am, bti_3am, bti_4am, bti_5am, bti_6am, bti_7am, bti_8am, bti_9am, bti_10am, bti_11am, bti_12pm, bti_1pm, bti_2pm, bti_3pm, bti_4pm, bti_5pm, bti_6pm, bti_7pm, bti_8pm, bti_9pm, bti_10pm, bti_11pm'
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

                $(div).append("<h5>Travel Time Reliability (BTI)</h5>");
                $(div).append("<p>Amount of buffer time needed on a trip</p>");

                // loop through our density intervals and generate a label
                // with a colored square for each interval
                var i;
                for (i = 0; i < BREAKS.length; i++) {
                    var s = '<div class="legend-row"><div class="legend-color" style="background:' + COLOR_SCALE[i] + ';">&nbsp; </div><div class="legend-text">';

                    if (i === 0) {
                        s += BREAKS[i].toLocaleString() + ' - ' + BREAKS[i+1].toLocaleString() + ' (very reliable)';
                    }

                    if (i !== BREAKS.length - 1 && i !== 0) {
                        s += (BREAKS[i]).toLocaleString() + ' - ' + BREAKS[i+1].toLocaleString();
                    }

                    if (i === BREAKS.length - 1) {
                        s += (BREAKS[i]).toLocaleString() + '+ (very unreliable)';
                    }

                    $(div).append(s);
                }

                $('.info.legend').html($(div).html());

                return div;
            };
            legendControl.addTo(reliabilityMap);
        }

        setupmap();
    });
})(jQuery);
