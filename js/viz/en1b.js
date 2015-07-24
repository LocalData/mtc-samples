/*globals
jQuery, L, geocities, altColors, econColors, allGray, Highcharts, turf, chroma,
regionPromise, countyPromise, cityPromise, _
*/
(function($) {
    /*
    Labor force participation

    B
    Side panel should show fixed (non-moving) mini-map of the region with
    color-code points for each sensor station. The rest of the interactive
    would be a line graph, for which the user can activate one or more of the
    sensors using the map dots and see the trend. Button bar above the graph
    allows the user to switch between Annual Average Fine Particulate Concentrations
    and 98th Percentile Daily Fine Particulate Concentrations.

    Instead of legend, perhaps the color could match the color of the dot (??).
    Hovering over the line graph would show the data (e.g. Livermore: XX μg/m3).


    Y-axis: Fine Particulate Concentration (μg/m3)
    Particulate Matter Concentrations - "Geography"

    MISC

    TODO

    REQUESTS

    */

    $(function(){
        //var CHART_BASE_TITLE = 'Historical Trend for Labor Force Participation by Age Group';

        // Constants
        var CHART_ID = '#en-b-chart';
        var Y_AXIS = '';
        var GEO_KEY = 'Sensor_Location';
        var YEAR_KEY = 'Year';
        var CHART_BASE_TITLE = 'Sensor Data for Fine Particulates';
        var AVG_LABEL = 'Annual Average Fine Particulates';
        var TOP_LABEL = '98th Percentile Day Fine Particulates';
        var AVG_KEY = 'PM2#5_AnnualAvg_ugm3_1YR';
        var TOP_KEY = 'PM2#5_daily98percentile_ugm3_1YR';
        var DESELECTED_COLOR = allGray[2];

        // Replace the gray and other desaturated colors.
        var colors = _.without(altColors, '#6B7078', '#65598A', '#2C2C2C');

        var i;
        var map;
        var maxYear, minYear;
        var yearNames = [];

        var locations, sensorData;
        var selectedGeography = [];

        var pointStyle = {
            radius: 6,
            fillColor: DESELECTED_COLOR, // "#ff7800", - orange
            color: "#fff",
            weight: 1.5,
            opacity: 1,
            fillOpacity: 1
        };

        var selectedStyle = {
            radius: 6,
            weight: 1.5,
            opacity: 1,
            fillOpacity: 1
        };

        function fillInYears(data, key) {
            var filledData = [];

            // Group the data we have by year for quick access
            var yearsWithData = _.groupBy(data, YEAR_KEY);

            _.each(yearNames, function(year) {
                var d = {};
                d[YEAR_KEY] = year;

                // If we have data for this year, fill it in
                // Otherwise, add a null value.
                if (_.has(yearsWithData, year)) {
                    d[key] = yearsWithData[year][0][key];
                } else {
                    d[key] = null;
                }

                filledData.push(d);
            });
            return filledData;
        }

        function getSeries(key, label) {
            var series = [];

            _.each(selectedGeography, function(geo) {
                var data = _.filter(sensorData, {
                    Sensor: geo[GEO_KEY]
                });

                series.push({
                    name: geo[GEO_KEY],
                    data: _.pluck(fillInYears(data, key), key),
                    color: geo.color,
                    animation: false
                });
            });

            return series;
        }

        var MODE_ANNUAL = {
            title: CHART_BASE_TITLE,
            label: AVG_LABEL,
            key: AVG_KEY,
            yAxis: 'Annual Average<br> Fine Particulate Concentration (&#181;g/m<sup>3</sup>)',
            format: "{value:,.1f}",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f} &#181;g/m<sup>3</sup></b></td></tr>'
        };
        var MODE_TOP = {
            title: CHART_BASE_TITLE,
            label: TOP_LABEL,
            key: TOP_KEY,
            yAxis: 'Annual Average<br> Fine Particulate Concentration (&#181;g/m<sup>3</sup>)',
            format: "{value:,.1f}",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f} &#181;g/m<sup>3</sup></b></td></tr>'
        };

        var activeMode = MODE_ANNUAL;


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


        function chart() {
            var selectedGeographyData = _.filter(sensorData, {
                Sensor: selectedGeography[GEO_KEY]
            });

            var tooltip = {
                headerFormat: '<span style="font-size:10px">{point.key} ' + activeMode.label + '</span><table>',
                pointFormat: activeMode.pointFormat,
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            };

            var options = {
                chart: {
                    type: 'line'
                },
                title: {
                    text: activeMode.title
                },
                xAxis: {
                    categories: yearNames,
                    tickmarkPlacement: 'on',
                    labels: {
                        step: 2
                    }
                },
                yAxis: {
                    title: {
                        text: activeMode.yAxis,
                        useHTML: true,
                        margin: 25
                    },
                    min: 0,
                    max: activeMode.max,
                    endOnTick: false,
                    reversedStacks: true,
                    stackLabels: {
                        enabled: false
                    }
                },
                legend: {
                    enabled: true
                },
                colors: colors,
                plotOptions: {
                    line: {
                         events: {
                            legendItemClick: function () {
                                return false;
                            }
                        }
                    }
                },
                tooltip: tooltip,
                series: getSeries(activeMode.key, activeMode.label)
            };

            $(CHART_ID).highcharts(options);

            // Don't explicitly set step size on smaller screens
            if (window.innerWidth < 650) {
                delete options.xAxis.labels.step;
            }
        }


        function interaction(event, feature) {
            console.log("Feature", event, feature);
            if (_.find(selectedGeography, feature.properties)) {
                pointStyle.fillColor = DESELECTED_COLOR; // feature.properties.color;
                event.target.setStyle(pointStyle);
                _.remove(selectedGeography, feature.properties);
            } else {
                selectedStyle.fillColor = feature.properties.color;
                event.target.setStyle(selectedStyle);
                selectedGeography.push(feature.properties);
            }

            chart();
        }


        var layersToStartSelected = [];
        function setupInteraction(feature, layer) {
            // Listen for click events on all layers
            layer.on('click', function(event) {
                interaction(event, feature);
            });

            // We pick a few layers to be selected from the start
            if (feature.properties[GEO_KEY] === 'Point Reyes' ||
                feature.properties[GEO_KEY] === 'Redwood City' ||
                feature.properties[GEO_KEY] === 'Livermore') {
                layersToStartSelected.push(layer);
            }
        }


        function pointToLayer(feature, latlng) {
            // pointStyle.fillColor = feature.properties.color;

            return L.circleMarker(latlng, pointStyle);
        }


        function setupMap() {
            // $('#map_title').html(MAP_TITLE + ' - ' + activeYear);

            // Regular terrain map: postcode.mna0lfce
            // Desaturated: postcode.4d9dd5cd
            // Default base map: postcode.kh28fdpk

            L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';
            map = L.mapbox.map('map', 'postcode.kh28fdpk', {
                infoControl: false,
                zoomControl: false,
                attributionControl: false,
                scrollWheelZoom: false,
                dragging: false,
                touchZoom: false,
                doubleClickZoom: false,
                center: [37.783367, -122.062378]
            });
            L.control.scale().addTo(map);

            var sensorLayer = L.geoJson(undefined, {
                pointToLayer: pointToLayer,
                onEachFeature: setupInteraction
            }).addTo(map);

            _.each(locations, function(location) {
                var geojson = {
                    type: 'Feature',
                    'geometry': {
                        type: 'Point',
                        coordinates: [location.Long, location.Lat]
                    },
                    properties: location
                };

                sensorLayer.addData(geojson);
            });

            map.fitBounds(sensorLayer.getBounds());

            // Start with layers selected.
            _.each(layersToStartSelected, function(layer) {
                interaction({
                    target: layer
                }, layer.feature);
            });
        }


        function setup() {
            setupMap();

            $('#en-b-annual').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                activeMode = MODE_ANNUAL;
                chart();

                $(this).display();
            });
            $('#en-b-top').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                activeMode = MODE_TOP;
                chart();

                $(this).display();
            });
        }


        function percent(n) {
            return n * 100;
        }


        function setupColors(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                d[i].color = colors[i];
            }
            return d;
        }

        // Get the data ready to visualize
        function prepData(rawLocations, rawSensorData) {
            sensorData = rawSensorData[0];
            locations = setupColors(rawLocations[0]);

            var years = _.pluck(sensorData, 'Year');
            maxYear = _.max(years);
            minYear = _.min(years);
            for (i = minYear; i <= maxYear; i++) {
                yearNames.push(i);
            }

            // Get the max values for the two data modes
            MODE_TOP.max = _.max(sensorData, MODE_TOP.key)[MODE_TOP.key];
            MODE_ANNUAL.max = _.max(sensorData, MODE_ANNUAL.key)[MODE_ANNUAL.key];

            // Once we have the data, set up the visualizations
            setup();
        }

        var locationsPromise = $.ajax({
            dataType: 'json',
            url: 'http://vitalsigns-production.elasticbeanstalk.com/en/1/sensorlocations'
        });

        var sensorPromise = $.ajax({
            dataType: 'json',
            url: 'http://vitalsigns-production.elasticbeanstalk.com/en/1/sensors'
        });

        $.when(locationsPromise, sensorPromise).done(prepData);
    });
})(jQuery);
