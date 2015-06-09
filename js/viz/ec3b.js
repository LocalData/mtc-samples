/*globals jQuery, L, geocities, allGray, econColors, altColors, science,
cityPromise, countyPromise, regionPromise: true */

(function($) {
    /*

    B
    Chloropleth map showing cities color-coded by unemployment rate in 2013.
    -  When city is clicked in the map, a bar graph appears in the info panel
    showing the city unemployment rate compared to the county and the region for
    2013 (can hover to see details);
    _ graph should use consistent scale throughout.
    - The panel also include a top 5 list of cities with highest
    unemployment and a bottom 5 list with cities with the lowest unemployment.
    - No need for button bar or dropdowns.
    (T3-T4-B (interactive map),
    http://dev-mtc-vital-signs.pantheon.io/commute-time)
    http://dev-mtc-vital-signs.pantheon.io/sites/all/themes/vitalsigns/js/t3t4b-new.js?nlq112

    */

    var FOCUS_KEY = 'Unemployment_Rate';
    var FOCUS_YEAR = 2013;

    // Use econ purple as the first color
    altColors[4] = altColors[0];
    altColors[0] = econColors[1];

    var cityData, countyData, regionData, metroData;
    var selectedGeography;

    $(function() {

        // Get quantiles for generating choropleth
        function getRange(data, property) {
          var range = [];
          $.each(data, function(key, v) {
            if(v && v[property] !== null) {
              range.push(v[property]);
            }
          });
          var breaks = science.stats.quantiles(range, [0, 0.2, 0.4, 0.6, 0.8]);
          return breaks;
        }

        // Display the top 5 and lowest 5 unemployment rates
        function ec3bLeaderboard(data) {
            data = _.sortBy(data, FOCUS_KEY);
            var bottom5 = data.slice(0,5);
            var top5 = _.takeRight(data, 5).reverse();

            var topText = "<div class='col-lg-6'><h4>Highest Unemployment Rates</h4>";
            _.each(top5, function(city, i) {
                var num = i+1;
                topText += "<h6>" + num + ". " + city.Residence_Geo + ": " + city[FOCUS_KEY] + "%</h6>";
            });
            topText += '</div>';
            $("#ec3-b-top-cities").html(topText);


            var bottomText = "<div class='col-lg-6'><h4>Lowest Unemployment Rates</h4>";
            _.each(bottom5, function(city, i) {
                var num = i+1;
                bottomText += "<h6>" + num + ". " + city.Residence_Geo + ": " + city[FOCUS_KEY] + "%</h6>";
            });
            topText += '</div>';
            $("#ec3-b-bottom-cities").html(bottomText);
        }

        function ec3bBarChart(series, options) {
            // http://dev-mtc-vital-signs.pantheon.io/sites/all/themes/vitalsigns/js/t3t4b-new.js?nlq112
            $('#ec3-b-chart').highcharts({
                chart: {
                    defaultSeriesType: 'bar',
                    height: 300
                },
                series: series,
                exporting: {
                    enabled: true
                },
                legend: {
                    enabled: false
                },
                yAxis: {
                    title: {
                        text: 'Unemployment Rate (%)'
                    },
                    max:  16, // Max unemployment
                    startOnTick: false,
                    endOnTick: false
                },
                xAxis: {
                    categories: options.categories
                },
                title: {
                    text: 'Unemployment'
                },
                tooltip: {
                    shared: true,
                    crosshairs: false,
                    pointFormat: '<b>{point.y:.1f}%</b>'
                },
                colors: econColors
            });
        }

        function ec3bMapInteraction(event, feature) {
            // Create bar graph
            // showing the city unemployment rate compared to the county and the
            // region for 2013

            if (!feature.properties.unemployment) {
                console.log("No unemployment", feature.properties);
                $('#ec3-b-chart').html('');
                return;
            }

            var cityName = feature.properties.NAME;
            var countyName = feature.properties.NAME_1 + " County";
            var county2013 = _.find(countyData, {
                'Year': FOCUS_YEAR,
                Residence_Geo: countyName
            });


            var title = 'The unemployment rate of <strong class="economy">';
            title += cityName + '</strong> in 2013 was <strong class="economy">';
            title += feature.properties.unemployment.toFixed(1); //.toLocaleString();
            title += '%</strong>.';

            $('#ec-b-title').html(title);

            var series = [
            {
                name: cityName + ' Unemployment Rate',
                data: [
                    feature.properties.unemployment,
                    county2013[FOCUS_KEY],
                    regionData[regionData.length - 2]
                ]
            }];

            ec3bBarChart(series, {
                categories: [
                    cityName,
                    countyName,
                    'Bay Area'
                ]
            });
        }

        function ec3bSetupMapInteraction(feature, layer) {
            layer.on('click', function(event) {
                ec3bMapInteraction(event, feature);
            });
        }

        // Set up the interactive map
        function setup() {
            // Reference JS:
            // http://dev-mtc-vital-signs.pantheon.io/sites/all/themes/vitalsigns/js/t3t4b-new.js?nlqyte

            // Create the map
            L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';
            var map = L.mapbox.map('map', 'postcode.kh28fdpk', {
                infoControl: true,
                attributionControl: false
            });
            L.control.scale().addTo(map);

            // Prep the city data
            var focusYearData = _.filter(cityData, {'Year': FOCUS_YEAR});
            var features = [];
            var cities = [];
            _.each(geocities.features, function(feature, i) {
                var city = _.find(focusYearData, {
                    Residence_Geo: feature.properties.NAME
                });
                cities.push(city);
                if (city) {
                    feature.properties.unemployment = city[FOCUS_KEY];
                }
                features.push(feature);
            });
            geocities.features = features;


            // Display the city data based on breaks
            var colors = _.clone(econColors).reverse();
            var breaks = getRange(cities, FOCUS_KEY);

            var cityLayer = L.geoJson(geocities, {
                onEachFeature: ec3bSetupMapInteraction,
                style: function(f) {
                    var color;
                    var u = f.properties.unemployment;

                    if (u > breaks[4]) {
                        color = colors[4];
                    } else if (u > breaks[3]) {
                        color = colors[3];
                    } else if (u > breaks[2]) {
                        color = colors[2];
                    } else if (u > breaks[1]) {
                        color = colors[1];
                    } else if (u >= breaks[0]) {
                        color = colors[0];
                    }

                    var opacity = 0.9;
                    var weight = 0.5;

                    if(!u) {
                       // console.log("No unemployment data for", f.properties);
                       opacity = 0;
                       weight = 0;
                    }

                    // feature.properties.unemployment
                    return {
                      color: '#4F4F4F',
                      fillColor: color,
                      fillOpacity: opacity,
                      weight: weight
                    };
                }
            }).addTo(map);

            map.fitBounds(cityLayer.getBounds()).zoomIn();

            // Add the legend
            var legendControl = new L.mapbox.legendControl();
            legendControl.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend');
                $(div).addClass("col-lg-12");
                $(div).append("<h5>Unemployment Rate</h5>");

                // loop through our density intervals and generate a label
                // with a colored square for each interval
                var i;
                for (i = 0; i < breaks.length; i++) {
                    var s = '<div class="legend-row"><div class="legend-color" style="background:' + colors[i] + ';">&nbsp; </div><div class="legend-text">';

                    if (i === 0) {
                        s += breaks[i].toFixed(1) + '% - ' + breaks[i+1].toFixed(1) + '%';
                    }

                    if (i !== breaks.length - 1 && i !== 0) {
                        s += (breaks[i] + 0.1).toFixed(1) + '% - ' + breaks[i+1].toFixed(1) + '%';
                    }

                    if (i === breaks.length - 1) {
                        s += (breaks[i] + 0.1).toFixed(1) + '%+';
                    }

                    $(div).append(s);

                    // $(div).append('<div><div class="col-lg-1" style="background:' + colors[i] + ';">&nbsp; </div><div class="col-lg-8">' +
                    //     Math.round(breaks[i]*100)/100 + (Math.round(breaks[i + 1]*100)/100 ? '&ndash;' + Math.round(breaks[i + 1]*100)/100 + '</div>' : '+'));
                }
                // $(div).append('<div><div class="col-lg-1" style="background:' + allGray[0] + ';">&nbsp; </div><div class="col-lg-8">No data</div>');

                return div;
            };
            legendControl.addTo(map);

            // Set up the top 5 / bottom 5 employment rate lists
            ec3bLeaderboard(focusYearData);
        }

        // Get all the data needed for the interactives in one go.
        function prepData(cityRaw, countyRaw, regionRaw) {
            regionData = [];
            _.each(regionRaw[0], function(r, i) {
                regionData.push(r[FOCUS_KEY]);
            });

            cityData = cityRaw[0];
            countyData = countyRaw[0];
            setup();
        }

        $.when(cityPromise, countyPromise, regionPromise).done(prepData);
    });
})(jQuery);
