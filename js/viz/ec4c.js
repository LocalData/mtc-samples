/*globals jQuery, L, geocities, cartodb, econColors, altColors,
Highcharts, science, requestArray: true */

(function($) {
    /*
    C
    Line graph showing the median household income (or % growth) of the 10 major
    metro areas. X-axis should show years and Y-axis should show either $ or %
    growth. User should be able to turn on or off metro areas in graph. User
    should be able to hover over graph to see all metros' incomes for the
    selected year. Button bar allows for switch between $ and % modes.
    http:// vitalsigns-production.elasticbeanstalk.com/ec/4/metro
    http:// vitalsigns-production.elasticbeanstalk.com/ec/5/metro
    Metro Comparison for Median Household Income
    LU1-C

    */

    var i;

    var CHART_ID = '#ec-c-chart';

    var DASH = 'ShortDash';
    var COLOR_PAIRS = [
        altColors[0],
        altColors[0],
        altColors[1],
        altColors[1],
        altColors[2],
        altColors[2]
    ];

    var METRO_NAME_KEY = 'Metro Name'; // key for metro names

    var FOCUS_YEAR = 2013;
    var FOCUS_KEY = 'Median_HH_Inc_PlaceOfResidence_IA';

    // The keys in the data we'll use
    var MEDIAN_HOUSEHOLD_INCOME = 'Median_HH_Inc_PlaceOfResidence_IA';
    var MEDIAN_WORKER_INCOME = 'Median_Worker_Inc_PlaceOfEmploy_IA';
    var MEDIAN_HOUSEHOLD_INCOME_CHANGE = 'Median_HH_Inc_PlaceOfResidence_IA_PerChg1970';

    var FIRSTYEAR = 1970; // first year we have data
    var MAXYEAR = 2013; // last year we have data
    var ACTIVE_YEARS = [1970, 1980, 1990, 2000, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
    var COUNTY_ACTIVE_YEARS = [2000, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
    var YEARNAMES = [];
    for (i = 1970; i <= MAXYEAR; i++) {
        YEARNAMES.push(i);
    }
    var METRO_YEARS = [1970, 1980, 1990, 2000, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
    var YEARS_SINCE_2000 = [ 9999 ];

    var metroData;

    // Use econ purple as the first color
    altColors[4] = altColors[0];
    altColors[0] = econColors[1];


    $(function(){

        // Set explicit decimal separators
        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });


        // We need to fill in the years after 1970s without data with blanks so
        // that the graph maintains its scale.
        function fillInBlanks(data) {
            var blanked = [];

            i = 0;
            var year;
            for(year = FIRSTYEAR; year <= MAXYEAR; year++) {
                if (_.includes(ACTIVE_YEARS, year)) {
                    blanked.push(data[i]);
                    i++;
                } else {
                    blanked.push(null);
                }
            }

            return blanked;
        }


        function chartECC(mode) {
            // Group the metro data as needed
            var series = [];
            var key, label, pointFormat, title, yAxisLabel;

            var dataByMetro = _.groupBy(metroData, METRO_NAME_KEY);
            _.each(dataByMetro, function(d, metro) {
                if (mode === 'Median Income'){
                    title = 'Metro Comparison for Median Household Income';
                    label = 'Median Income (inflation-adjusted)';
                    key = FOCUS_KEY;
                    pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>${point.y:,.0f}</b></td></tr>';
                    yAxisLabel = {
                        format: "${value:,.0f}"
                    };
                } else {
                    if(metro === 'Miami' || metro === 'Washington') {
                        return;
                    }
                    title = 'Metro Comparison for Median Household Income';
                    label = '% Change in Median Income (inflation-adjusted)';
                    key = MEDIAN_HOUSEHOLD_INCOME_CHANGE;
                    pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>';
                    yAxisLabel = {
                        format: "{value:,.0f}%"
                    };
                }

                var lineWidth = 2;
                if (metro === 'Bay Area') {
                    lineWidth = 3;
                }

                series.push({
                    name: metro,
                    data: fillInBlanks(_.pluck(d, key)),
                    connectNulls: true,
                    lineWidth: lineWidth
                });


            });
            series = _.sortBy(series, METRO_NAME_KEY);

            var options = {
                chart: {
                    type: 'line'
                },
                title: {
                    text: title
                },
                xAxis: {
                    categories: YEARNAMES,
                    tickmarkPlacement: 'on',
                    labels: {
                        step: 5,
                        staggerLines: 1
                    }
                },
                yAxis: {
                    title: {
                        text: label
                    },
                    labels: yAxisLabel
                },
                tooltip: {
                    enabled: true,
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: pointFormat,
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                colors: altColors,
                series: series
            };

            // Don't explicitly set step size on smaller screens
            if (window.innerWidth < 650) {
                delete options.xAxis.labels.step;
            }

            $(CHART_ID).highcharts(options);
        }

        // Create graph EC-3, showing unemployment trend for US metro areas
        function setup() {
            chartECC("Median Income");

            $('#ec-c-median').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                chartECC("Median Income");
                $(this).display();
            });
            $('#ec-c-percent').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                chartECC("Change in Median Income since 1970 (%)");
            });
        }

        function round(n) {
            if (n === null) {
                return n;
            }

            return Math.round(n/100) * 100;
        }

        function setupNumbers(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                // Set up percents
                if (d[i][MEDIAN_HOUSEHOLD_INCOME_CHANGE] !== null) {
                    d[i][MEDIAN_HOUSEHOLD_INCOME_CHANGE] *= 100;
                }

                // Round up to nearest hundred
                d[i][FOCUS_KEY] = round(d[i][FOCUS_KEY]);

                if (_.has(d[i], MEDIAN_WORKER_INCOME)) {
                    d[i][MEDIAN_WORKER_INCOME] = round(d[i][MEDIAN_WORKER_INCOME]);
                }
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(cityRaw, countyRaw, regionRaw, countyWorkplaceData, regionWorkplaceData, tractRaw, metroRaw, metroWorkplaceRaw) {
            metroData              = setupNumbers(metroRaw[0]);
            var metroWorkplaceData = setupNumbers(metroWorkplaceRaw[0]);

            // Join 4 & 5 for simplicity
            function joinData(left, right, key) {
                var i, objectToJoin;
                for (i = 0; i < left.length; i++) {
                    objectToJoin =  _.find(right, {
                        Year: left[i].Year,
                        Workplace_Geo: left[i].Residence_Geo
                    });

                    if (objectToJoin) {
                        left[i].Median_Worker_Inc_PlaceOfEmploy_IA =
                            objectToJoin.Median_Worker_Inc_PlaceOfEmploy_IA;
                    } else {
                        left[i].Median_Worker_Inc_PlaceOfEmploy_IA = null;
                    }
                }
                return left;
            }
            joinData(metroData, metroWorkplaceData);

            setup();
        }

        $.when.apply($, requestArray).done(prepData);

    });
})(jQuery);
