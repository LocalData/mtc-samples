/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science,
Promise, regionPromise, countyPromise, cityPromise: true
*/
(function($) {
    /*
    Labor force participation

    A

    MISC

    TODO

    REQUESTS

    */

    $(function(){
        //var CHART_BASE_TITLE = 'Historical Trend for Labor Force Participation by Age Group';
        var CHART_ID = '#ec-c-chart';

        var LABOR_TOTALS = {
            'NUMLF_1619': '16-19',
            'NUMLF_2024': '20-24',
            'NUMLF_2544': '25-44',
            'NUMLF_4554': '45-54',
            'NUMLF_5564': '55-64',
            'NUMLF_65xx': '65+'
        };
        var LABOR_PERCENTS = {
            'LF_16xx': '<b>All age groups</b>',
            'LF_1619': '16-19',
            'LF_2024': '20-24',
            'LF_2544': '25-44',
            'LF_4554': '45-54',
            'LF_5564': '55-64',
            'LF_65xx': '65+'
        };

        var YEARNAMES = [1980, 1990, 2000, 2010, 2013];
        var DASH_FORMAT = 'ShortDash';
        var COUNTY_KEY = 'CountyName';
        var CITY_KEY = 'GeoName';
        var FOCUS_YEAR = 2013;
        var FOCUS_KEY = 'LF_16xx';
        var CARTO_FOCUS_KEY = 'ec6_lf_16xx'; // carto lowercases fields
        var CARTO_CITY_POINT_QUERY = 'SELECT name FROM cities WHERE ST_Intersects( the_geom, ST_SetSRID(ST_POINT({{lat}}, {{lng}}) , 4326))';

        var i;
        var regionData, countyData, cityData;
        var selectedGeography = 'Bay Area';
        var sql = new cartodb.SQL({ user: 'mtc' });

        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });

        /* -- EC-8 A (Regional rent graph) -----------------------------------*/
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
                exporting: {
                    enabled: true
                },
                legend: {
                    enabled: false
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    max: 100,
                    startOnTick: false,
                    endOnTick: false,
                    labels: {
                        format: "{value:,.0f}%"
                    }
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
                    pointFormat: '<b>{point.y:,.1f}%</b>'
                },
                colors: econColors
            });
        }


        function getSeries(data) {
            var series = [];

            _.each(data, function(d) {
                var vals = [];
                _.each(LABOR_PERCENTS, function(v, k) {
                    vals.push(d[k]);
                });

                series.push({
                    name: d.Year,
                    data: vals
                });
            });
            return series;
        }


        function leaderboard(data) {
            data = _.sortBy(data, FOCUS_KEY);
            var bottom5 = data.slice(0,5);
            var top5 = _.takeRight(data, 5).reverse();

            var bottomText = "<div class='col-lg-6'><h4>Lowest Labor Force Participation</h4>";
            _.each(bottom5, function(city, i) {
                bottomText += "<h6>" + (i+1) + '. ' + city[CITY_KEY] + ": " + city[FOCUS_KEY].toLocaleString() + "%</h6>";
            });
            bottomText += '</div>';
            $("#ec-c-bottom-cities").html(bottomText);

            var topText = "<div class='col-lg-6'><h4>Highest Labor Force Participation</h4><h6>";
            _.each(top5, function(city, i) {
                topText += "<h6>" + (i+1) + '. ' + city[CITY_KEY] + ": " + city[FOCUS_KEY].toLocaleString() + "%</h6>";
            });
            topText += '</div>';
            $("#ec-c-top-cities").html(topText);
        }


        function mapInteraction(data, city) {
            data = data.rows[0];
            if (!data) {
                console.log("No data from carto", data);
                return;
            }

            // Check if we have city data
            city = city.rows[0];
            if(city) {
                city = city.name;
            }

            // Get the county data
            var countyName = data.county;
            var county2013 = _.find(countyData, {
                'Year': FOCUS_YEAR,
                CountyName: countyName
            });

            // Get the region data
            var region2013 = _.find(regionData, {
                'Year': FOCUS_YEAR
            });

            // Start setting up the series
            var series = {
                name: 'Labor Force Participation',
                data: []
            };
            var categories = [
                'Tract ' + data.tract
            ];

            series.data.push(data[CARTO_FOCUS_KEY] * 100);

            // Add the city data, if any.
            if (city) {
                var city2013 = _.find(cityData, {
                    'Year': FOCUS_YEAR,
                    'GeoName': city
                });
                series.data.push(city2013[FOCUS_KEY]);
                categories.push(city);
            }

            series.data.push(county2013[FOCUS_KEY]);
            series.data.push(region2013[FOCUS_KEY]);
            categories.push(countyName + ' County');
            categories.push('Bay Area');

            var title = 'The labor force participation of Census Tract <strong class="economy">';
            title += data.tract + '</strong> in 2013 was <strong class="economy">';
            title += (data[CARTO_FOCUS_KEY] * 100).toFixed(1); //.toLocaleString();
            title += '%</strong>.';

            $('#ec-c-title').html(title);

            graph([series], {
                categories: categories
            });
        }


        function setupMap() {
            var joinedFeatures = [];
            var breaks = [0, 55, 62, 69, 76];

            // Breaks now set in CartoDB
            // TODO get breaks automatically from Carto
            cartodb.createVis('map', 'https://mtc.cartodb.com/api/v2/viz/3a75b60e-e128-11e4-be60-0e853d047bba/viz.json')
              .done(function(vis, layers) {
                // Change the logo z to fix overlaps
                $('.cartodb-logo').css('z-index', 999);

                // layer 0 is the base layer, layer 1 is cartodb layer
                layers[1].setInteraction(true);

                // layers[1].getSubLayer(0).setInteractivity(CARTO_FIELDS);
                layers[1].on('featureClick', function(e, latlng, pos, data, layerNumber) {
                    // Get data for the selected area
                    var mapPromise = sql.execute("SELECT tract, county, geoid10, ec6_lf_16xx FROM ec_tracts WHERE cartodb_id = {{id}}", { id: data.cartodb_id });

                    // Get city data, if any
                    var cityPromise = sql.execute(CARTO_CITY_POINT_QUERY, {
                        lat: latlng[1],
                        lng: latlng[0]
                    });

                    // TODO -- should use .then, but CartoDB promises don't
                    // seem to play nice with that (or jquery)
                    mapPromise.done(function(tractResult) {
                        cityPromise.done(function(cityResult) {
                            mapInteraction(tractResult, cityResult);
                        });
                    });
                });

                // you can get the native map to work with it
                var map = vis.getNativeMap();


                var legend = L.control({position: 'bottomright'});
                legend.onAdd = function (map) {
                    var div = L.DomUtil.create('div', 'info legend');
                    var colors = _.clone(econColors, true).reverse();
                    $(div).append("<h5>2013 Labor Force Participation<br> by Neighborhood</h5>");

                    // breaks.unshift(1);
                    // loop through our density intervals and generate a label
                    // with a colored square for each interval
                    var i;
                    for (i = 0; i < breaks.length; i++) {
                        var start = Math.round(breaks[i]*100)/100;
                        var end = Math.round(breaks[i + 1]*100)/100 - 1;

                        var legendText = '<div class="legend-row"><div class="legend-color" style="background:' + colors[i] + ';">&nbsp; </div><div class="legend-text">';
                        legendText += start.toLocaleString();

                        if (Math.round(breaks[i + 1]*100)/100) {
                            // If there is a next value, display it.
                            legendText += '% &ndash; ' + end.toLocaleString() + '%</div></div>';
                        } else {
                            // Otherwise we're at the end of the legend.
                            legendText +='%+ </div></div>';
                        }
                        $(div).append(legendText);
                    }
                    return div;
                };
                legend.addTo(map);
              });
        }


        function setup() {
            // graph('#ec-a-chart', getSeries(regionData, 'Regional'));
            leaderboard(_.filter(cityData, {'Year': FOCUS_YEAR}));
            setupMap();
        }


        function round(n) {
            if (n === null) {
                return n;
            }

            return Math.round(n/100) * 100;
        }


        function percent(n) {
            return n * 100;
        }


        function setupNumbers(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                _.each(LABOR_PERCENTS, function(v, k) {
                    d[i][k] = percent(d[i][k]);
                });
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(region, county, city) {
            regionData = setupNumbers(_.clone(region[0], true));
            countyData = setupNumbers(_.clone(county[0], true));
            cityData = setupNumbers(_.clone(city[0], true));

            // Once we have the data, set up the visualizations
            setup();
        }

        $.when(regionPromise, countyPromise, cityPromise).done(prepData);
    });
})(jQuery);
