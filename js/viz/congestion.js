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

        var SPEED_MIN_ZOOM = 5;
        var SPEED_STYLE = _.template($('#speed-template').html())();
        console.log("Using style", SPEED_STYLE);

        var congestionMap;
        var congestionLayer;
        var activeLayer = {};
        var time = 12;

        var template = _.template($('#map-legend-template').html());

        var zone_styles = {
            radius: 5,
            fillColor: "#ff7800",
            color: "#000",
            weight: 0,
            opacity: 1,
            fillOpacity: 0.65
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
        }


        function updateTitle() {
            // TODO
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

            var slider = $("#en-b-slr-select").kendoSlider({
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

        function riseInteraction(layer) {
            congestionLayer = layer.getSubLayer(0);
            console.log("set congestionLayer", congestionLayer);
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

            // Add the layers to the two maps
            // Add the SLR map
            var cdbCongestion = cartodb.createLayer(congestionMap, {
              user_name: CARTODB_USER,
              cartodb_logo: false,
              type: 'cartodb',
              sublayers: [{
                sql: "SELECT * FROM speed_segments", // WHERE rise <=" + time,
                cartocss: SPEED_STYLE
              }]
            })
            .addTo(congestionMap)
            .done(riseInteraction);

            setupInteraction();

            // Add the legend
            var legendControl = new L.control({
                position: 'bottomright'
            });

            legendControl.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend');
                $(div).addClass("col-lg-12");
                return;

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
            };
            legendControl.addTo(congestionMap);
        }

        setupMap();
    });
})(jQuery);
