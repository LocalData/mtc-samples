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
        var CHART_ID = '#en-b-chart';
        var CHART_TITLE = 'Share of Population Below<br> 200% of Poverty Level';
        var MAP_TITLE = 'Share of Population Below<br> 200% of Poverty Level';

        var YEARNAMES = [1980, 1990, 2000, 2010, 2013];
        var DASH_FORMAT = 'ShortDash';
        var COUNTY_KEY = 'GeoName';
        var COUNTY_KEY_2 = 'County';
        var CITY_KEY = 'City';
        var FOCUS_YEAR = 2013;
        var FOCUS_KEY = 'PovPCT200';

        var CARTO_FOCUS_KEY = 'ec11_povpct200'; // carto lowercases fields
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


        function formatter() {
            if (this.value === 'Bay Area') {
                return '<span style="font-weight:800;color:#000;">' + this.value + '</span>';
            }
            return this.value;
        }


        function graph(series, options) {
            $(CHART_ID).highcharts({
                chart: {
                    defaultSeriesType: 'bar',
                    marginLeft: 100
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
                        text: CHART_TITLE
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

                    // pointFormatter: function() {
                    //     if (this.y === 2001) {
                    //         return '<b>&gt;$2,000</b>';
                    //     }
//
                    //     return '<b>$' + this.y.toLocaleString() + '</b>';
                    // }
                },
                colors: econColors
            });
        }


        function leaderboard(data) {
            data = _.sortBy(data, FOCUS_KEY);
            var bottom5 = data.slice(0,5);
            var top5 = _.takeRight(data, 5).reverse();

            var bottomText = "<div class='col-lg-6'><h4>Lowest Poverty Rates</h4>";
            _.each(bottom5, function(city, i) {
                bottomText += "<h6>" + (i+1) + '. ' + city[CITY_KEY] + ": " + city[FOCUS_KEY].toFixed(1) + "%</h6>";
            });
            bottomText += '</div>';
            $("#en-b-bottom-cities").html(bottomText);

            var topText = "<div class='col-lg-6'><h4>Higest Poverty Rates</h4><h6>";
            _.each(top5, function(city, i) {
                topText += "<h6>" + (i+1) + '. ' + city[CITY_KEY] + ": " + city[FOCUS_KEY].toFixed(1) + "%</h6>";
            });
            topText += '</div>';
            $("#en-b-top-cities").html(topText);
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
                GeoName: countyName
            });

            // Get the region data
            var region2013 = _.find(regionData, {
                'Year': FOCUS_YEAR
            });

            // Start setting up the series
            var series = {
                name: '',
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
                    'City': city
                });
                series.data.push(city2013[FOCUS_KEY]);
                categories.push(city);
            }

            series.data.push(county2013[FOCUS_KEY]);
            series.data.push(region2013[FOCUS_KEY]);
            categories.push(countyName + ' County');
            categories.push('Bay Area');


            var title = '<strong class="economy">';
            title += (data[CARTO_FOCUS_KEY] * 100).toFixed(1); //.toLocaleString();
            title += '%</strong> of the population in Census Tract <strong class="economy">';
            title += data.tract + '</strong>';
            title += ' in 2013 was below 200% of the poverty level.';


            $('#en-b-title').html(title);

            graph([series], {
                categories: categories
            });
        }


        function setupMap() {
            var joinedFeatures = [];
            var breaks = [0, 11, 18, 26, 39];

            // Breaks now set in CartoDB
            // TODO get breaks automatically from Carto
            cartodb.createVis('map', 'https://mtc.cartodb.com/viz/b82f42ca-0560-11e5-89ba-0e018d66dc29/public_map')
              .done(function(vis, layers) {
                // Change the logo's z-index to fix overlaps
                $('.cartodb-logo').css('z-index', 999);

                // layer 0 is the base layer, layer 1 is cartodb layer
                layers[1].setInteraction(true);

                // Handle clicks
                layers[1].on('featureClick', function(e, latlng, pos, data, layerNumber) {
                    // Get data for the selected area
                    var mapPromise = sql.execute("SELECT tract, county, geoid10, ec11_povpct200 FROM ec_tracts WHERE cartodb_id = {{id}}", { id: data.cartodb_id });

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
                    $(div).append("<h5>" + MAP_TITLE + "</h5>");

                    var colors = _.clone(econColors).reverse();

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
            leaderboard(_.filter(cityData, {'Year': FOCUS_YEAR}));
            setupMap();
        }


        function percent(n) {
            return n * 100;
        }


        function setupNumbers(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                d[i][FOCUS_KEY] = percent(d[i][FOCUS_KEY]);
            }
            return d;
        }


        // Get the data ready to visualize
        // function prepData(region, county, city) {
        //     regionData = setupNumbers(_.clone(region[0], true));
        //     countyData = setupNumbers(_.clone(county[0], true));
        //     cityData = setupNumbers(_.clone(city[0], true));
//
        //     // Once we have the data, set up the visualizations
        // }
//
        // $.when(regionPromise, countyPromise, cityPromise).done(prepData);
        //
        setup();

    });
})(jQuery);
