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
        var MAP_TITLE = 'Sea Level Rise';
        var CENTER = [37.871593,-122.272747];
        var CHART_ID = '#en-b-chart';
        var Y_AXIS = '';

        var CITY_KEY = 'City';
        var CITY_FEATURE_KEY = 'NAME';
        var COUNTY_KEY = 'County';
        var TRACT_KEY = 'Tract';

        var TRACT_MIN_ZOOM = 2;
        var TRACT_MAX_ZOOM = 4;
        var ZONE_MIN_ZOOM = 5;

        var ZONE_STYLE = '#slr_zones { polygon-fill: #EC7429; polygon-opacity: 0.3; line-width: 0; [rise=1], [rise=2] {polygon-opacity: 0.4} [zoom<11] { polygon-opacity: 0.7 } }';
        var TRACT_STYLE = '#slr_tracts { polygon-fill: #FFFFB2; polygon-opacity: 0.8; line-color: #FFF; line-width: 0.5; line-opacity: 0.5; } ';
        TRACT_STYLE  += '#slr_tracts [ popdens_10 <= 0.02088347] { polygon-fill: #843f1d; } #slr_tracts [ popdens_10 <= 0.00282527] { polygon-fill: #bd5d21; } #slr_tracts [ popdens_10 <= 0.00135319] { polygon-fill: #ec7429; } #slr_tracts [ popdens_10 <= 0.00069837] { polygon-fill: #e19063; } #slr_tracts [ popdens_10 <= 0.00016958] { polygon-fill: #ea9e77; }';

        // Green
        // var TRACT_STYLE = '#slr_tracts { polygon-fill: #FFFFB2; polygon-opacity: 0.8; line-color: #FFF; line-width: 0.5; line-opacity: 0.5; } ';
        // TRACT_STYLE  += '#slr_tracts [ popdens_10 <= 0.02088347] { polygon-fill: #35592a; } #slr_tracts [ popdens_10 <= 0.00282527] { polygon-fill: #4e8508; } #slr_tracts [ popdens_10 <= 0.00135319] { polygon-fill: #62a60a; } #slr_tracts [ popdens_10 <= 0.00069837] { polygon-fill: #87b171; } #slr_tracts [ popdens_10 <= 0.00016958] { polygon-fill: #9dbf88; }';

        //var TRACT_STYLE = '#slr_tracts { polygon-fill: #0c8ec5; polygon-opacity: 0.8; line-width: 0;  }';
            // 4E8508 -- green
            // EC7429 -- orange
            // 0c8ec5 -- blue
            // polygon-comp-op: multiply;

        var riseMap, tractMap;
        var riseLayer, tractLayer;
        var activeLayer = {};
        var rise = 1;

        var template = _.template($('#map-legend-template').html());

        var zone_styles = {
            radius: 5,
            fillColor: "#ff7800",
            color: "#000",
            weight: 0,
            opacity: 1,
            fillOpacity: 0.65
        };

        var COLORS = altColors;

        // Red-oranges
        COLORS = [
            '#fef0d9',
            '#fdd49e',
            '#fdbb84',
            '#fc8d59',
            '#ef6548',
            '#d7301f'
        ];

        // Blue to red
        COLORS = [
            '#c4e5f2',
            '#7bafc5',
            //'#0c8ec5', // med blue
            '#ebd183',
            '#ebbd2f',
            '#c14f4f',
            '#c12929'
        ];

        COLORS = allOrange;


        function prepTracts(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                d[i][TRACT_KEY] = "0" + d[i][TRACT_KEY];
            }
            return d;
        }


        var i;
        var regionData, countyData, cityData;
        var selectedGeography = 'Bay Area';

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
            /*
            TODO once we have tract data defined
            // This is a point click
            if (_.has(p, 'price_IA')) {
                chartOptions.city = p.CityName;
                chartOptions.county = p.county;
                chartOptions.tract = p.GEOID10;
                chartOptions.point = p.price_IA;
            }

            // If this is a tract click
            // We'll get a COUNTYFP but not a county name
            if (_.has(p, 'TRACT')) {
                chartOptions.tract = p.TRACT;

                // Get the county name from the Fip
                var countyFP = parseInt(_.trimLeft(p.COUNTYFP, '0'), 10);
                chartOptions.county = _.find(countyData, { Countyfip: countyFP }).County;
            }
            */
        }


        function setupInteraction() {
            function update(e) {
                rise = e.value;

                // Update the map title
                $('#map_title').html(MAP_TITLE + ' - ' + rise + 'ft rise');

                riseLayer.set({
                    sql: "SELECT * FROM slr_zones WHERE rise <=" + rise,
                    cartocss: ZONE_STYLE
                });

                tractLayer.set({
                    sql: "SELECT * FROM slr_tracts WHERE amt ='" + rise + "ft'",
                    cartocss: TRACT_STYLE
                });
            }

            var slider = $("#en-b-slr-select").kendoSlider({
                min: 1,
                max: 6,
                tickPlacement: "none",
                change: update,
                slide: update,
                value: rise,
                tooltip: {
                    template: function(e) {
                        return e.value + ' ft';
                    }
                }
            });

            // TODO:
            // Handle map clicks
            /*layer.on('click', function(event) {
                interaction(event, feature);
            });*/

        }

        function riseInteraction(layer) {
            riseLayer = layer.getSubLayer(0);
            console.log("set riseLayer", riseLayer);
        }

        function tractInteraction(layer) {
            tractLayer = layer.getSubLayer(0);
        }

        function setupMap() {
            $('#map_title').html(MAP_TITLE + ' - ' + rise + 'ft rise');

            riseMap = L.map('map-rise', {
                center: CENTER,
                zoom: 9,
                minZoom: 8,
                fullscreen: true
            });
            tractMap = L.map('map-tracts', {
                center: CENTER,
                zoom: 9,
                minZoom: 8,
                fullscreen: true
            });

            // Usual basemap: postcode.kh28fdpk
            // Terrain: postcode.mna0lfce

            var baseLayer = L.tileLayer('http://a.tiles.mapbox.com/v3/postcode.mna0lfce/{z}/{x}/{y}.png')
                             .addTo(riseMap);
            baseLayer = L.tileLayer('http://a.tiles.mapbox.com/v3/postcode.mna0lfce/{z}/{x}/{y}.png')
                             .addTo(tractMap);

            L.control.scale().addTo(riseMap);
            L.control.scale().addTo(tractMap);

            tractMap.sync(riseMap);
            riseMap.sync(tractMap);

            // Add the layers to the two maps
            // Add the SLR map
            var cdbRise = cartodb.createLayer(riseMap, {
              user_name: 'mtc',
              cartodb_logo: false,
              type: 'cartodb',
              sublayers: [{
                // Sea level map
                sql: "SELECT * FROM slr_zones WHERE rise <=" + rise,
                cartocss: ZONE_STYLE
              }]
            })
            .addTo(riseMap)
            .done(riseInteraction);

            // Add the tract layer
            var cdbTracts = cartodb.createLayer(tractMap, {
              user_name: 'mtc',
              cartodb_logo: false,
              type: 'cartodb',
              sublayers: [{ //4E8508 -- green; EC7429-- orange
                sql: "SELECT * FROM slr_tracts WHERE amt ='" + rise + "ft'",
                cartocss: TRACT_STYLE
              }]
            })
            .addTo(tractMap)
            .done(tractInteraction);


            setupInteraction();



            // Add the legend
            // TODO once we have breaks set
            var BREAKS = [1,4,7,9,10];
            var legendControl = new L.control();
            legendControl.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend');
                $(div).addClass("col-lg-12");
                $(div).append("<h5>Population Density<br> (legend to come)</h5>");

                // loop through our density intervals and generate a label
                // with a colored square for each interval
                var i;
                for (i = 0; i < BREAKS.length; i++) {
                    var s = '<div class="legend-row"><div class="legend-color" style="background:' + COLORS[i] + ';">&nbsp; </div><div class="legend-text">';

                    if (i === 0) {
                        s += '$' + BREAKS[i].toLocaleString() + ' - $' + BREAKS[i+1].toLocaleString();
                    }

                    if (i !== BREAKS.length - 1 && i !== 0) {
                        s += '$' + (BREAKS[i] + 1).toLocaleString() + ' - $' + BREAKS[i+1].toLocaleString();
                    }

                    if (i === BREAKS.length - 1) {
                        s += '$' + (BREAKS[i] + 1).toLocaleString() + '+';
                    }

                    $(div).append(s);

                    // $(div).append('<div><div class="col-lg-1" style="background:' + colors[i] + ';">&nbsp; </div><div class="col-lg-8">' +
                    //     Math.round(breaks[i]*100)/100 + (Math.round(breaks[i + 1]*100)/100 ? '&ndash;' + Math.round(breaks[i + 1]*100)/100 + '</div>' : '+'));
                }


                return div;
            };
            legendControl.addTo(tractMap);
        }


        function setup() {
            setupMap();
        }


        function setupNumbers(d) {
            var i;
            // for(i = 0; i < d.length; i++) {
            //     d[i][FOCUS_KEY] = percent(d[i][FOCUS_KEY]);
            // }
            return d;
        }

        setup();

    });
})(jQuery);
