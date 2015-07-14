/*globals
jQuery, L, geocities, econColors, altColors, Highcharts, turf, chroma,
regionPromise, countyPromise, cityPromise, _
*/
(function($) {
    /*
    Map showing fatalities across the region - when at a higher level of zoom,
    a heat map should be shown, while at a lower zoom level the individual
    points can be presented to the user. 2012 year should be displayed for sure;
    please investigate the feasibility of showing multiple historical years as
    well (preferably all at once to create a more accurate distribution). Use
    per-capita-ization based on population to avoid the "high population" bias
    issue, but clip out unpopulated areas to avoid a "small denominator" issue.

    Develop heat map based on census tract population. Color code points based
    on mode of transport (car, bike, etc.) of victim. User should be able to
    click on a point or a zone and get more information about the incident or
    the risk in the given zone.

    MISC

    TODO

    REQUESTS

    */

    $(function(){
        //var CHART_BASE_TITLE = 'Historical Trend for Labor Force Participation by Age Group';
        var MAP_TITLE = '2012 Injuries from Crashes';
        var CHART_ID = '#en-b-chart';
        var Y_AXIS = '';

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

        var BIKE_KEY = 'BICCOL';
        var BIKE_COLOR = altColors[0];

        var PED_KEY = 'PEDCOL';
        var PED_COLOR = altColors[1];

        var CAR_KEY = 'MCCOL';
        var TRUCK_KEY = 'TRUCKCOL';
        var VEHICLE_COLOR = altColors[3];

        var TRACT_MIN_ZOOM = 8;
        var TRACT_MAX_ZOOM = 11;
        var POINT_MIN_ZOOM = 12;

        var map;
        var activeLayer = {};
        var tractLayer;
        var pointLayer;

        var template = _.template($('#map-legend-template').html());

        var point_styles = {
            radius: 5,
            fillColor: "#ff7800",
            color: "#fff",
            weight: 1,
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

        var MIN = 49000;
        var MAX = 5000000;
        // var SCALE = chroma.scale([COLORS[0], COLORS[COLORS.length - 1]]);
        // console.log(SCALE(0), SCALE(0.5), SCALE(1));
        COLORS.push('#682b61'); // gold: #ebbd2f

        // Quintiles (rounded slightly)
        var BREAKS = [
            0,
            300000,
            440000,
            610000,
            865000,
            1500000
        ];

        BREAKS = [
            0,
            300000,
            600000,
            900000,
            1200000,
            1500000
        ];


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

            $('#en-b-title').html(template({
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

            //if (properties.INJURED >= 1) {
            //    color = COLORS[3];
            //}

            //if (properties.KILLED >= 1) {
            //    color = COLORS[5];
            //}

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


        function getTractStyle(feature) {
            console.log("Using tract style");
            var color, u;
            var properties = feature.properties;

            if (properties.Injured_per_cap >= 1) {
                color = COLORS[3];
            }

            var opacity = 0.9;
            var fillColor = COLORS[3];

            return {
              color: '#fff',
              fillColor: fillColor,
              fillOpacity: opacity
            };
        }


        function pointToLayer(feature, latlng) {
            var style = getStyle(feature);

            return L.circleMarker(latlng, style);
        }


        function setupTracts() {
            // Get the tract data
            tractLayer = L.esri.featureLayer('http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/EN4_9_Safety_Tracts/FeatureServer/1', {
                cacheLayers: false,
                onEachFeature: setupInteraction,
                simplifyFactor: 0.2,
                precision: 5,
                fields: ['TRACT', 'OBJECTID', 'COUNTYFP', 'Injured_per_cap'],
                minZoom: TRACT_MIN_ZOOM,
                maxZoom: TRACT_MAX_ZOOM,
                style: getTractStyle
            }).addTo(map);
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
                where: 'INJURED > 0'

            }).addTo(map);
        }


        function setupMap() {
            $('#map_title').html(MAP_TITLE); // + ' - ' + activeYear);

            L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';
            map = L.mapbox.map('map', 'postcode.kh28fdpk', {
                infoControl: true,
                attributionControl: false,
                scrollWheelZoom: false,
                center: [37.804364,-122.271114], // [37.783367, -122.062378],
                zoom: 13,
                minZoom: 8
            });
            L.control.scale().addTo(map);
            map.addControl(L.mapbox.geocoderControl('mapbox.places'), {
                autocomplete: true
            });

            setupPoints();
            setupTracts();

            /*
            // Add the legend
            TODO once we have breaks set
            var legendControl = new L.mapbox.legendControl();
            legendControl.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend');
                $(div).addClass("col-lg-12");
                $(div).append("<h5>Median Home Prices<br> (inflation-adjusted)</h5>");

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
            legendControl.addTo(map);
            */
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
