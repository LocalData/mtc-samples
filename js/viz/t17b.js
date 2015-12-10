/*globals
jQuery, L, geocities, allBlue, allOrange, altColors, Highcharts, turf, cartodb,
regionPromise, countyPromise, cityPromise, _
*/
(function($) {
    $(function(){
        // Condition, County, Segment, Type
        var CENTER = [37.871593,-122.272747];
        var Y_AXIS = '';

        var CARTODB_USER = 'localdata';
        var sql = new cartodb.SQL({user: CARTODB_USER});

        var SELECTED_SEGMENT_STYLE = {
            fillColor: "#d9b305",
            color: "#40315a",
            weight: 3,
            opacity: 1,
            fillOpacity: 1
        };
        var colors = {
            'Distressed': {
              bg: '#e60000',
              color: "#fff"
            },
            'Good/Excellent': {
              bg: '#38a800',
              color: 'white'
            },
            'Maintenance': {
              bg: '#ffaa00',
              color: 'black'
            },
            'No MSL': {
              bg: '#ffff00',
              color: 'black'
            }
        };

        var countyinfo = [{
          "Name": "Alameda",
          "Code": "ALA"
        }, {
          "Name": "Contra Costa",
          "Code": "CC"
        }, {
          "Name": "Marin",
          "Code": "MRN"
        }, {
          "Name": "Napa",
          "Code": "NAP"
        }, {
          "Name": "San Francisco",
          "Code": "SF"
        }, {
          "Name": "San Mateo",
          "Code": "SM"
        }, {
          "Name": "Santa Clara",
          "Code": "SCL"
        }, {
          "Name": "Solano",
          "Code": "SOL"
        }, {
          "Name": "Sonoma",
          "Code": "SON"
        }];

        var conditionMap;
        var conditionStyle = _.template($('#pavement-condition-template').html())();
        var conditionLayer;
        var selectedSegmentLayer = L.geoJson();
        var selectedSegmentData;
        var template = _.template($('#map-legend-template').html());
        var i;

        function makeMapFullScreen(event) {
            event.preventDefault();
            $('.make-map-fullscreen').hide();
            $('.reduce-map-size').show();
            var center = conditionMap.getCenter();

            var $container = $('#mapt17b');
            $container.toggleClass('fullscreen-map-container');

            // Move the legend
            $('.info.legend').show();
            $('#mapt17b .info.legend').hide();
            $('#mapt17b').height(625);
            $("#T17-B-info").height(625);

            // Calculate thew new offset
            var offset = $('#mapt17b').offset();
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
            conditionMap._onResize();

            conditionMap.panTo(center);
            console.log("Panned to ", center);
        }

        function disableFullScreen(event) {
            event.preventDefault();
            $('.make-map-fullscreen').show();
            $('.reduce-map-size').hide();

            var center = conditionMap.getCenter();

            // Move the legend
            $('.info.legend').hide();
            $('#mapt17b .info.legend').show();
            $('#mapt17b').height(550);
            $("#T17-B-info").height('auto');

            window.removeEventListener('resize', makeMapFullScreen);

            var $container = $('#mapt17b');
            $container.removeCtlass('fullscreen-map-container');
            $container.css('left', 'auto');
            $container.css('width', '100%');

            conditionMap._onResize();
            conditionMap.panTo(center);
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

            conditionMap.removeLayer(selectedSegmentLayer);
            selectedSegmentLayer = L.geoJson(shapes, {
                style: SELECTED_SEGMENT_STYLE
            });
            conditionMap.addLayer(selectedSegmentLayer);
        }

        function updateSidebar() {
          console.log("Update", selectedSegmentData);
          if(!selectedSegmentData) {
            return;
          }

          selectedSegmentData.color = colors[selectedSegmentData.condition].color;
          selectedSegmentData.bg = colors[selectedSegmentData.condition].bg;

          if (selectedSegmentData.condition === 'Maintenance') {
            selectedSegmentData.condition = 'At Risk';
          }

          selectedSegmentData.county = _.find(countyinfo, { Code: selectedSegmentData.county }).Name;
          $('.corridor-info-text').html(template(selectedSegmentData));
        }

        function handleFeatureClick(event, latlng, pos, data, layerIndex) {
            selectedSegmentData = data;
            updateSidebar();

            // Handle selecting the shape
            var shapePromise = sql.execute("SELECT ST_AsGeoJSON(the_geom) as shape, cartodb_id FROM t17_hwy_pavement_condition WHERE cartodb_id = '" + data.cartodb_id + "'");
            shapePromise.done(highlightShape);
        }

        function layersLoaded(layer) {
            console.log("Layers loaded");
            $('.make-map-fullscreen').click(makeMapFullScreen);
            $('.reduce-map-size').click(disableFullScreen);

            conditionLayer = layer.getSubLayer(0);
            console.log(conditionLayer);

            // Add cursor interaction
            conditionLayer.setInteraction(true);
            cartodb.vis.Vis.addCursorInteraction(conditionMap, conditionLayer);

            // Show the tract when cursor is l
            conditionLayer.on('featureClick', handleFeatureClick);
        }

        function setupmap() {
            conditionMap = L.map('mapt17b', {
                center: CENTER,
                zoom: 9,
                minZoom: 8,
                fullscreen: true,
                scrollWheelZoom: false
            });

            // Standard basemap: postcode.kh28fdpk
            // Terrain basemap: postcode.mna0lfce
            var baseLayer = L.tileLayer('http://a.tiles.mapbox.com/v3/postcode.kh28fdpk/{z}/{x}/{y}.png')
                             .addTo(conditionMap);

            L.control.scale().addTo(conditionMap);
            conditionMap.addLayer(selectedSegmentLayer);

            cartodb.createLayer(conditionMap, {
              user_name: CARTODB_USER,
              cartodb_logo: false,
              type: 'cartodb',
              sublayers: [{
                sql: "SELECT * FROM t17_hwy_pavement_condition",
                cartocss: conditionStyle,
                interactivity: 'cartodb_id, caltrans_i, county, type, condition, direction'
              }]
            })
            .addTo(conditionMap)
            .done(layersLoaded);


            // Add the legend
            var legendControl = new L.control({
                position: 'bottomright'
            });

            legendControl.onAdd = function (map) {
              var div = L.DomUtil.create('div', 'info legend');
              $(div).addClass("col-lg-12");

              $(div).append("<h5>Highway pavement condition</h5>");
              // $(div).append("<p>Amount of buffer time needed on a trip</p>");

              var s = '';
              s += '<div class="legend-row"><div class="legend-color" style="background:#e60000;">&nbsp; </div><div class="legend-text">Distressed</div></div>';
              s += '<div class="legend-row"><div class="legend-color" style="background:#ffaa00;">&nbsp; </div><div class="legend-text">At Risk</div></div>';
              s += '<div class="legend-row"><div class="legend-color" style="background:#ffff00;">&nbsp; </div><div class="legend-text">No Minimum Service Life</div></div>';
              s += '<div class="legend-row"><div class="legend-color" style="background:#38a800;">&nbsp; </div><div class="legend-text">Good/Excellent</div></div>';
              $(div).append(s);

              $('.info.legend').html($(div).html());

              return div;
            };
            // We have the legend in the sidebar for now.
            // Leaving this code in case the position changes.
            // legendControl.addTo(conditionMap);
        }

        setupmap();
    });
})(jQuery);
