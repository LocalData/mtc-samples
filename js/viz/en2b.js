/*globals
jQuery, L, geocities, altColors, econColors, Highcharts, turf, chroma,
regionPromise, countyPromise, cityPromise, _
*/
(function($) {
    /*
    Labor force participation

    B
    Side panel should show fixed (non-moving) mini-map of the region with
    color-code points for each sensor station. The rest of the interactive would
    be a line graph, for which the user can activate one or more of the sensors
    using the map dots and see the trend. No button bar needed for ozone.

    Instead of legend, perhaps the color could match the color of the dot (??).
    Hovering over the line graph would show the data (e.g. Livermore: XX ppb).

    Y-axis: Ozone Concentration (μg/m3)
    Ozone Concentrations - "Geography"

    MISC

    TODO
    - Don't show button bar before graph displays.
    - Line color based on location selected
    - Chart title based on location selected

    REQUESTS

    */

    $(function(){
        //var CHART_BASE_TITLE = 'Historical Trend for Labor Force Participation by Age Group';
        var CHART_ID = '#en-b-chart';

        var MAP_TITLE = 'Ozone Concentrations';
        var GEO_KEY = 'Sensor_Location';
        var YEAR_KEY = 'Year';
        var Y_LABEL = '8-Hour Maximum Ozone Concentrations (ppb)';
        var X_LABEL = 'Ozone Concentrations';
        var FOCUS_KEY = 'Ozone_Max4_Daily_8HR_ppb_Annual_1YR';

        var i;
        var map;
        var maxYear, minYear;
        var yearNames = [];

        var locations, sensorData;
        var selectedGeography = [];

        var point_styles = {
            radius: 6,
            fillColor: "#ff7800",
            color: "#fff",
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


        function getSeries() {
            var series = [];
            _.each(selectedGeography, function(geo) {
                var data = _.filter(sensorData, {
                    Sensor: geo[GEO_KEY]
                });

                console.log("Sensor data", data, "from geo", geo);

                series.push({
                    name: geo[GEO_KEY],
                    data: _.pluck(fillInYears(data, FOCUS_KEY), FOCUS_KEY),
                    color: geo.color,
                    animation: false
                });
            });

            console.log("Generated series", series);
            return series;
        }


        function chart() {
            var tooltip = {
                headerFormat: '<span style="font-size:10px">{point.key} Ozone Concentrations</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f} ppb</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            };

            $(CHART_ID).highcharts({
                chart: {
                    type: 'line'
                },
                title: {
                    text: MAP_TITLE
                },
                xAxis: {
                    categories: yearNames,
                    tickmarkPlacement: 'on',
                    title: {
                        text: X_LABEL
                    }
                },
                yAxis: {
                    title: {
                        text: Y_LABEL
                    },
                    max: 150,
                    min: 0,
                    reversedStacks: true,
                    stackLabels: {
                        enabled: false
                    }
                },
                legend: {
                    enabled: true
                },
                colors: altColors,
                plotOptions: {
                },
                tooltip: tooltip,
                series: getSeries()
            });
        }


        function interaction(event, feature) {
            if (_.find(selectedGeography, feature.properties)) {
                _.remove(selectedGeography, feature.properties);
            } else {
                selectedGeography.push(feature.properties);
            }
            chart();
        }


        function setupInteraction(feature, layer) {
            layer.on('click', function(event) {
                interaction(event, feature);
            });
        }


        function pointToLayer(feature, latlng) {
            point_styles.fillColor = feature.properties.color;

            return L.circleMarker(latlng, point_styles);
        }


        function setupMap() {
            // $('#map_title').html(MAP_TITLE + ' - ' + activeYear);

            L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';
            map = L.mapbox.map('map', 'postcode.kh28fdpk', {
                infoControl: true,
                attributionControl: false,
                scrollWheelZoom: false,
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
        }


        function setup() {
            setupMap();
        }


        function percent(n) {
            return n * 100;
        }


        function setupColors(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                d[i].color = altColors[i];
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


            // Once we have the data, set up the visualizations
            setup();
        }

        var locationsPromise = $.ajax({
            dataType: 'json',
            url: 'http://vitalsigns-production.elasticbeanstalk.com/en/2/sensorlocation'
        });

        var sensorPromise = $.ajax({
            dataType: 'json',
            url: 'http://vitalsigns-production.elasticbeanstalk.com/en/2/sensors'
        });

        $.when(locationsPromise, sensorPromise).done(prepData);
    });
})(jQuery);
