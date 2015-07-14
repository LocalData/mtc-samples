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
        var map;
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


            L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';
            map = L.mapbox.map('map', 'postcode.kh28fdpk', {
                infoControl: true,
                attributionControl: false,
                scrollWheelZoom: false,
                center: [37.783367, -122.062378]
            });
            L.control.scale().addTo(map);


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
