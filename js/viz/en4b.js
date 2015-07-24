/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science,
Promise, regionPromise, countyPromise, cityPromise: true
*/
(function($) {
    /*
    Fatalities

    Map showing fatalities across the region - when at a higher level of zoom,
    a heat map should be shown, while at a lower zoom level the individual points
    can be presented to the user. 2012 year should be displayed for sure;
    please investigate the feasibility of showing multiple historical years as
    well (preferably all at once to create a more accurate distribution). Use
    per-capita-ization based on population to avoid the "high population" bias
    issue, but clip out unpopulated areas to avoid a "small denominator" issue.

    Develop heat map based on census tract population. Color code points based
    on mode of transport (car, bike, etc.) of victim. User should be able to
    click on a point or a zone and get more information about the incident or
    the risk in the given zone.

    A

    MISC

    TODO

    REQUESTS

    */

    $(function(){
        //var CHART_BASE_TITLE = 'Historical Trend for Labor Force Participation by Age Group';
        var MAP_TITLE = 'Fatalities from Crashes';
        var CHART_ID = '#en-b-chart';
        var Y_AXIS = '';

        // The raw data uses numbers to refer to months
        var MONTHS = {
            1: 'January',
            2: 'February',
            3: 'March',
            4: 'April',
            5: 'May',
            6: 'June',
            7: 'July',
            8: 'August',
            9: 'September',
            10: 'October',
            11: 'November',
            12: 'December'
        };

        var CITY_KEY = 'City';
        var CITY_FEATURE_KEY = 'NAME';
        var COUNTY_KEY = 'County';
        var TRACT_KEY = 'Tract';

        var MIN_YEAR = 2000;
        var BIKE_KEY = 'BICCOL';
        var BIKE_COLOR = altColors[0];

        var PED_KEY = 'PEDCOL';
        var PED_COLOR = altColors[1];

        var CAR_KEY = 'MCCOL';
        var TRUCK_KEY = 'TRUCKCOL';
        var VEHICLE_COLOR = altColors[3];

        var TRACT_MIN_ZOOM = 8;
        var TRACT_MAX_ZOOM = 13;
        var POINT_MIN_ZOOM = 13;

        // Red-oranges
        var COLORS = [
            '#EA9E77',
            '#E19063',
            '#EC7429',
            '#BD5D21',
            '#843F1D'
        ];

        // Quintiles (rounded slightly)
        var BREAKS = [
            0,
            0.00017679,
            0.00022139,
            0.00028969,
            0.00043022
        ];

        var map;
        var activeLayer = {};
        var tractLayer, pointLayer;
        var year = 2012;

        var cartoCSSTemplate = _.template($('#template-carto').html());
        var mapLegendTemplate = _.template($('#template-map-legend').html());

        var point_styles = {
            radius: 7,
            fillColor: "#ff7800",
            color: "#fff",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.65
        };

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


        // Set up the tract legend
        var tractLegendControl = new L.control({
            position: 'bottomright'
        });
        tractLegendControl.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            $(div).addClass("col-lg-12");
            $(div).append("<h5>Fatalities from Crashes Per Capita<br></h5>");

            // loop through our density intervals and generate a label
            // with a colored square for each interval
            var i;
            for (i = 0; i < BREAKS.length; i++) {
                var s = '<div class="legend-row"><div class="legend-color" style="background:' + COLORS[i] + ';">&nbsp; </div><div class="legend-text">';

                if (i === 0) {
                    s += BREAKS[i].toLocaleString() + ' - ' + BREAKS[i+1].toLocaleString();
                }

                if (i !== BREAKS.length - 1 && i !== 0) {
                    s += BREAKS[i].toLocaleString() + ' - ' + BREAKS[i+1].toLocaleString();
                }

                if (i === BREAKS.length - 1) {
                    s += BREAKS[i].toLocaleString() + '+</div>';
                }

                $(div).append(s);
            }

            return div;
        };


        // Set up the point legend
        var pointLegendControl = new L.control({
            position: 'bottomright'
        });
        pointLegendControl.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            $(div).addClass("col-lg-12");
            // $(div).append("<h5>Mode of transportation<br></h5>");

            var s = '<div class="legend-row"><div class="legend-color" style="background:' + PED_COLOR + ';">&nbsp; </div><div class="legend-text">Pedestrian</div>';
            s += '<div class="legend-row"><div class="legend-color" style="background:' + BIKE_COLOR + ';">&nbsp; </div><div class="legend-text">Bicyclist</div>';
            s += '<div class="legend-row"><div class="legend-color" style="background:' + VEHICLE_COLOR + ';">&nbsp; </div><div class="legend-text">Unclassified</div>';

            $(div).append(s);
            return div;
        };


        // Hide / show a specific legend based on zoom
        function setupLegend() {
            try {
                tractLegendControl.removeFrom(map);
            } catch(error) {
                // noop
            }

            try {
                pointLegendControl.removeFrom(map);
            } catch(error) {
                // noop
            }

            if (map.getZoom() >= POINT_MIN_ZOOM) {
                pointLegendControl.addTo(map);
            } else {
                tractLegendControl.addTo(map);
            }
        }


        function interaction(event, feature) {
            var p = feature.properties;
            console.log("Map clicked", p);

            $('#en-b-title').html(mapLegendTemplate({
                data: feature.properties,
                months: MONTHS
            }));

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


        function setupInteraction(feature, layer) {
            layer.on('click', function(event) {
                interaction(event, feature);
            });
        }


        function getStyle(feature) {
            var color, u;
            var properties = feature.properties;

            if (properties.PEDCOL) {
                color = PED_COLOR;
            }

            if (properties.BICCOL) {
                color = BIKE_COLOR;
            }

            if (!properties.PEDCOL && !properties.BICCOL) {
                color = VEHICLE_COLOR;
            }

            var opacity = 0.9;
            // This would show the radius based on # of injured + killed
            // var radius = (properties.INJURED + properties.KILLED) * 2;  //10;
            var radius = 4;

            return {
              color: '#fff',
              fillColor: color,
              fillOpacity: opacity,
              radius: radius
            };
        }


        function pointToLayer(feature, latlng) {
            var style = getStyle(feature);

            return L.circleMarker(latlng, style);
        }


        function tractsLoaded(layer) {
            tractLayer = layer; //.getSubLayer(0);

            // Listen for zoom changes and remove the layer if we are
            // zoomed far enough in.
            map.on('zoomend', function (event) {
                setupLegend();

                var zoom = event.target.getZoom();
                if (zoom >= TRACT_MAX_ZOOM) {
                    map.removeLayer(tractLayer);
                } else if (!map.hasLayer(tractLayer)) {
                    tractLayer.addTo(map);
                }
            });

            function update(e) {
                year = e.value;

                // Update the map title
                $('#map_title').html(year + ' ' + MAP_TITLE);

                // Update the tract layer
                tractLayer.getSubLayer(0).set({
                    sql: "SELECT * FROM ec_tracts",
                    cartocss: cartoCSSTemplate({ year: year })
                });

                // Update the point layer
                pointLayer.setWhere('KILLED > 0 AND YEAR_=' + year);
            }
        }


        function setupTracts() {
            // Add the tract layer
            var cdbTracts = cartodb.createLayer(map, {
              user_name: 'mtc',
              cartodb_logo: false,
              type: 'cartodb',
              sublayers: [{
                sql: "SELECT * FROM ec_tracts",
                cartocss: cartoCSSTemplate({ year: year })
              }]
            })
            .addTo(map)
            .done(tractsLoaded);
        }


        function setupPoints() {
            pointLayer = L.esri.featureLayer('http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/EN4_9_Safety/FeatureServer/0', {
                cacheLayers: false,
                radius: 25,
                max: 2500000,
                onEachFeature: setupInteraction,
                fields: [
                    'OBJECTID',
                    'CITY',
                    'COUNTY',
                    'STATE',
                    BIKE_KEY,
                    PED_KEY,
                    CAR_KEY,
                    TRUCK_KEY,
                    'ETOH',
                    'PRIMARYRD',
                    'SECONDRD',
                    'CRASHSEV',
                    'VIOLCAT',
                    'KILLED',
                    'INJURED',
                    'YEAR_',
                    'MONTH_',
                    'PEDKILL',
                    'PEDINJ',
                    'BICKILL',
                    'BICINJ',
                    'MCKILL',
                    'MCINJURE'
                ],
                pointToLayer: pointToLayer,
                minZoom: POINT_MIN_ZOOM,
                where: 'KILLED > 0 AND YEAR_ >= ' + MIN_YEAR

            }).addTo(map);
        }


        function setupMap() {
            // $('#map_title').html(year + ' ' + MAP_TITLE);

            map = L.map('map', {
                infoControl: true,
                attributionControl: false,
                scrollWheelZoom: false,
                center: [37.804364,-122.271114], // [37.783367, -122.062378],
                zoom: 10,
                minZoom: 8
            });

            var baseLayer = L.tileLayer('http://a.tiles.mapbox.com/v3/postcode.mna0lfce/{z}/{x}/{y}.png');
            baseLayer.addTo(map);

            L.control.scale().addTo(map);

            setupPoints();
            setupTracts();

            setupLegend();
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
