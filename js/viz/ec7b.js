/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, turf, chroma,
Promise, regionPromise, countyPromise, cityPromise: true
*/
(function($) {
    /*
    Labor force participation

    Chloropleth map showing cities color-coded by 200% poverty rate in 2013.
    When city is clicked in the map, a bar graph appears in the info panel
    showing the city 200% poverty rate compared to the county and the region for
    2013 (can hover to see details); graph should use consistent scale throughout.
    The panel also include a top 5 list of cities with highest 200% poverty and
    a bottom 5 list with cities with the lowest 200% poverty. No need for button
    bar or dropdowns.

    A

    MISC

    TODO

    REQUESTS

    */

    $(function(){
        //var CHART_BASE_TITLE = 'Historical Trend for Labor Force Participation by Age Group';
        var MAP_TITLE = 'Home Prices by Year';
        var CHART_ID = '#ec-b-chart';
        var Y_AXIS = '';

        var CITY_KEY = 'City';
        var CITY_FEATURE_KEY = 'NAME';
        var COUNTY_KEY = 'County';
        var TRACT_KEY = 'Tract';

        var FOCUS_KEY = 'MedPrice_IA';
        var FEATURE_FOCUS_KEY = 'price_IA';
        var CITY_MODE = 'cities';
        var POINT_MODE = 'points';
        var TRACT_MODE = 'tracts';

        var map;
        var maxYear;
        var minYear;
        var activeLayer = {};
        var activeMode;
        var activeYear = 2014;
        var cityYearData;
        var tractData = {}; // Store tract data by year as we get it.
        var chartOptions = {};

        var point_styles = {
            radius: 5,
            fillColor: "#ff7800",
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        var COLORS = _.clone(econColors).reverse();
        var MIN = 49000;
        var MAX = 5000000;
        var SCALE = chroma.scale([COLORS[0], COLORS[COLORS.length - 1]]);
        console.log(SCALE(0), SCALE(0.5), SCALE(1));
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


        // We tract active layers keyed by year then mode
        // For example: activeLayer[2001]['Tract']
        // We need to do this because if you change modes or years while an ESRI
        // feature layer is loading, it will apply that old data to the new layer
        // once it finally loads.
        //
        // This isn't foolproof but will reduce occurances of that bug.
        //
        // TODO:
        // - Fix issue where switching back and forth between two zooms
        // (eg tract<-> point) quickly will cause data to double-load :-/
        // Maybe each layer needs to get a unique ID?
        function setActiveLayer(layer) {
            console.log("Set active layer", layer);
            if (!_.has(activeLayer, activeYear)) {
                activeLayer[activeYear] = {};
            }

            activeLayer[activeYear][activeMode] = layer;
        }


        function getRemoveActiveLayer(year, mode) {
            return function() {
                activeLayer[year][mode].on('load', function(event) {
                    console.log("Removing layer after load", year, mode, event);
                    _.each(event.target._layers, function(l) {
                        map.removeLayer(l);
                    });
                    delete activeLayer[year][mode];
                });

                map.removeLayer(activeLayer[year][mode]);
            };
        }


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


        function graph(series, options) {
            $(CHART_ID).highcharts({
                chart: {
                    defaultSeriesType: 'bar'
                },
                series: series,
                plotOptions: {
                    series: {
                        animation: false
                    }
                },
                exporting: {
                    enabled: true
                },
                legend: {
                    enabled: false
                },
                yAxis: {
                    title: {
                        text: Y_AXIS
                    },
                    startOnTick: false,
                    endOnTick: false,
                    labels: {
                        format: "${value:,.0f}"
                    },
                    max: 1500000
                },
                xAxis: {
                    categories: options.categories
                },
                title: {
                    text: series[0].name
                },
                tooltip: {
                    shared: true,
                    crosshairs: false,
                    pointFormat: '<b>${point.y:,.0f}</b>'
                },
                colors: econColors
            });
        }


        function getColor(price) {
            var color = 'red';
//
            // var val = (price - MIN) / (MAX - MIN);
            // if (price > MAX) {
            //     console.log("Maxed out", price);
            //     val = 1;
            // }

            //color = SCALE(val).hex();
            // console.log("Got val", val, color, price, MIN, MAX);

            if (price > BREAKS[5]) {
                color = COLORS[5];
            } else if (price > BREAKS[4]) {
                color = COLORS[4];
            } else if (price > BREAKS[3]) {
                color = COLORS[3];
            } else if (price > BREAKS[2]) {
                color = COLORS[2];
            } else if (price > BREAKS[1]) {
                color = COLORS[1];
            } else if (price > BREAKS[0]) {
                color = COLORS[0];
            }

            return color;
        }


        function style(feature) {
            var color, u;

            // If this is a city feature, get the data we need for the selected year.
            if (feature.properties.NAME) {
                if (cityYearData[feature.properties.NAME]) {
                    u = cityYearData[feature.properties.NAME][FOCUS_KEY];
                }
            }

            // If this is a tract feature, we may need to fetch the data.
            if (feature.properties.TRACT) {
                if (tractData[activeYear][feature.properties.TRACT]) {
                    u = tractData[activeYear][feature.properties.TRACT][FOCUS_KEY];
                }
            }

            if (!u) {
                // console.log("Missing data for", feature.properties);
            }

            color = getColor(u);

            var opacity = 0.8;
            var weight = 0.5;
            var fillColor = color;

            if(!u) {
                color = '#fff';
                fillColor = 'transparent';
                opacity = 0;
            }

            return {
              color: color,
              fillColor: fillColor,
              fillOpacity: opacity,
              weight: weight
            };
        }


        function getCityAtPoint(latlng) {
            var i;
            var point = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [latlng.lng, latlng.lat]
                }
            };

            // Search geocities until we find the city at the selected point.
            for (i = 0; i < geocities.features.length; i++) {
                if (turf.inside(point, geocities.features[i])) {
                    return geocities.features[i].properties;
                }
            }
        }


        function getSeries() {
            var data = [];
            var categories = [];

            if (!chartOptions.county) {
                return;
            }

            if (chartOptions.point) {
                data.push(chartOptions.point);
                categories.push('This sale');
            }

            if (chartOptions.tract) {
                data.push(tractData[activeYear][chartOptions.tract][FOCUS_KEY]);
                categories.push('Tract ' + chartOptions.tract);
            }

            if (chartOptions.city) {
                data.push(_.find(cityYearData, { City: chartOptions.city })[FOCUS_KEY]);
                categories.push(chartOptions.city);
            }

            if (chartOptions.county) {
                data.push(_.find(countyData, { Year: activeYear, County: chartOptions.county })[FOCUS_KEY]);
                categories.push(chartOptions.county + ' County');
            }

            data.push(_.find(regionData, { Year: activeYear })[FOCUS_KEY]);
            categories.push('Bay Area');

            var series = {
                name: activeYear + ' Median Home Prices',
                data: data
            };

            graph([series], {
                categories: categories
            });
        }


        function interaction(event, feature) {
            var p = feature.properties;
            chartOptions = {};
            console.log(p);

            // This is a point click
            // Point clicks give
            // CityName: "San Francisco"
            // GEOID10: "06075015900" -- remove first zero to get county
            // OBJECTID: 602201
            // county: "San Francisco"
            // price_IA: 467172.222375
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

                p = getCityAtPoint(event.latlng);
            }

            // This is has city data...
            if (_.has(p, 'NAME')) {
                chartOptions.city = p.NAME;
                chartOptions.county = p.NAME_1;
            }

            getSeries();
        }


        function setupInteraction(feature, layer) {
            layer.on('click', function(event) {
                interaction(event, feature);
            });
        }


        function pointToLayer(feature, latlng) {
            var color = getColor(feature.properties[FEATURE_FOCUS_KEY]);
            point_styles.color = color;
            point_styles.fillColor = color;

            return L.circleMarker(latlng, point_styles);
        }


        function showCities() {
            console.log("Showing cities");

            activeMode = CITY_MODE;

            var layer = L.geoJson(geocities, {
                onEachFeature: setupInteraction,
                style: style
            }).addTo(map);
            setActiveLayer(layer);
        }


        function showTracts() {
            console.log("Showing tracts");

            activeMode = TRACT_MODE;

            if (activeLayer[activeYear] && activeLayer[activeYear][activeMode]) {
                console.log("Danger: adding active data when we already have layer");
            }

            // Get the tract data
            var layer = L.esri.featureLayer('http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/LU_Features/FeatureServer/1', {
                onEachFeature: setupInteraction,
                simplifyFactor: 0.2,
                precision: 5,
                fields: ['TRACT', 'OBJECTID', 'COUNTYFP'],
                style: style
            }).addTo(map);
            setActiveLayer(layer);
        }


        function showPoints() {
            console.log("Showing points");

            activeMode = POINT_MODE;

            var layer = L.esri.featureLayer('http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/EC7/FeatureServer/0', {
                onEachFeature: setupInteraction,
                fields: ['price_IA', 'GEOID10', 'CityName', 'county', 'OBJECTID'], //'OBJECTID'
                pointToLayer: pointToLayer,
                where: 'year=' + activeYear
            }).addTo(map);
            setActiveLayer(layer);
        }


        function zoomDispatcher(event) {
            var zoom = event.target.getZoom();

            if (zoom >= 14 && activeMode !== POINT_MODE) {
                getRemoveActiveLayer(activeYear, activeMode)();
                showPoints();
                return;
            }

            if (14 > zoom && zoom >= 11 && activeMode !== TRACT_MODE) {
                getRemoveActiveLayer(activeYear, activeMode)();
                showTracts();
                return;
            }

            if (11 > zoom && zoom >= 5 && activeMode !== CITY_MODE) {
                getRemoveActiveLayer(activeYear, activeMode)();
                showCities();
            }
        }


        function dispatch() {
            if (activeMode === POINT_MODE) {
                showPoints();
            }

            if (activeMode === TRACT_MODE) {
                showTracts();
            }

            if (activeMode === CITY_MODE) {
                showCities();
            }
        }


        // Most of the data for the year should have loaded by the time the user
        // selects a different year, but just in case, we can fetch it on demand.
        function getTractYearData() {
            var tractPromise = $.ajax({
                dataType: "json",
                url: "http://54.149.29.2/ec/7/tract/" + activeYear
            });

            tractPromise.done(function(tractDataForYear) {
                tractDataForYear = prepTracts(tractDataForYear);
                tractData[activeYear] = _.indexBy(tractDataForYear, TRACT_KEY);
                dispatch();

                // Show the chart if we're supposed to
                if (!_.isEmpty(chartOptions)) {
                    getSeries();
                }
            });
        }


        function sliderSelectYear(e) {
            getRemoveActiveLayer(activeYear, activeMode)();

            activeYear = e.value;


            $('#map_title').html(MAP_TITLE + ' - ' + activeYear);

            cityYearData = _.indexBy(_.filter(cityData, {'Year': activeYear }), CITY_KEY);

            if (_.has(tractData, activeYear)) {
                dispatch();
                // Show the chart if we're supposed to
                if (!_.isEmpty(chartOptions)) {
                    getSeries();
                }
            } else {
                getTractYearData();
            }
        }


        function setupMap() {
            $('#map_title').html(MAP_TITLE + ' - ' + activeYear);

            L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';
            map = L.mapbox.map('map', 'postcode.kh28fdpk', {
                infoControl: true,
                attributionControl: false,
                scrollWheelZoom: false,
                center: [37.783367, -122.062378],
                zoom: 9,
                minZoom: 8
            });
            L.control.scale().addTo(map);
            map.addControl(L.mapbox.geocoderControl('mapbox.places'), {
                autocomplete: true
            });

            showCities();

            map.on('zoomend', zoomDispatcher);

            // Set up the slider
            var slider = $("#ec-b-year-select").kendoSlider({
                min: minYear,
                max: maxYear,
                tickPlacement: 'none',
                change: sliderSelectYear,
                value: activeYear
            }).data("kendoSlider");


            // Add the legend
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
        }


        function setup() {
            var cityYear = _.filter(cityData, {'Year': activeYear});
            cityYearData = _.indexBy(cityYear, CITY_KEY);
            setupMap();
        }


        function percent(n) {
            return n * 100;
        }



        function setupNumbers(d) {
            var i;
            // for(i = 0; i < d.length; i++) {
            //     d[i][FOCUS_KEY] = percent(d[i][FOCUS_KEY]);
            // }
            return d;
        }

        // Get the data ready to visualize
        function prepData(region, county, city, tract) {
            regionData = setupNumbers(_.clone(region[0], true));
            countyData = setupNumbers(_.clone(county[0], true));
            cityData = setupNumbers(_.clone(city[0], true));

            var years = _.pluck(regionData, 'Year');
            maxYear = _.max(years);
            minYear = _.min(years);

            // Start loading the tract data by year in the background.
            // Can be disabled to increase performance.
            // _.each(years, function(year) {
            //     var tractPromise = $.ajax({
            //         dataType: "json",
            //         url: "http://54.149.29.2/ec/7/tract/" + year
            //     });
            //     tractPromise.done(function(tractDataForYear) {
            //         tractDataForYear = prepTracts(tractDataForYear);
            //         tractData[year] = _.indexBy(tractDataForYear, TRACT_KEY);
            //     });
            // });

            // We've split up the tract data by year
            // Just get the selected year to start
            tractData[activeYear] = _.indexBy(prepTracts(tract[0]), TRACT_KEY);

            // Once we have the data, set up the visualizations
            setup();
        }

        var tractPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/7/tract/" + activeYear
        });

        $.when(regionPromise, countyPromise, cityPromise, tractPromise).done(prepData);
    });
})(jQuery);
