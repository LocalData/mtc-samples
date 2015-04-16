/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science,
regionPromise, countyPromise, cityPromise, metroPromise: true
*/
(function($) {
    /*
    Poverty

    C
    Line graph showing the 200% poverty trends for major metro areas. When
    hovering over lines, show 200% poverty rates for all metros in year user is
    hovering over. X-axis should be year, Y-axis should be 200% poverty rate.
    User should be able to turn on or off metro areas in graph. No dropdowns or
    button bars needed.

    X-axis: Share of Population Below 200% of Poverty Level
    Metro Comparison for Poverty Rate

    MISC

    TODO

    REQUESTS

    */

   $(function(){
        var CHART_ID = '#ec-c-chart';
        var CHART_BASE_TITLE = 'Metro Comparison for Poverty Rate';
        var DASH_FORMAT = 'ShortDash';
        var FOCUS_FIELD = 'PovPCT200';

        var i;
        var metroData;
        var selectedGeography = 'Bay Area';

        var ACTIVE_YEARS = [1980, 1990, 2000, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
        var MAXYEAR = 2013;
        var YEARNAMES = [];
        for (i = ACTIVE_YEARS[0]; i <= MAXYEAR; i++) {
            YEARNAMES.push(i);
        }

        var DASH = 'ShortDash';
        var COLOR_PAIRS = [
            altColors[0],
            altColors[0],
            altColors[1],
            altColors[1],
            altColors[2],
            altColors[2]
        ];

        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });

        function formatter() {
            if (this.value === 'Bay Area') {
                return '<span style="font-weight:800;color:#000;">' + this.value + '</span>';
            } else {
                return this.value;
            }
        }

        function graph(id, series) {
            var colors;

            var tooltip = {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            };

            var categories = _.pluck(metroData, 'Name');

            var options = {
                chart: {
                    defaultSeriesType: 'bar'
                },
                title: {
                    text: CHART_BASE_TITLE
                },
                xAxis: {
                    categories: categories,
                    labels: {
                        formatter: formatter
                    }
                },
                yAxis: {
                    title: {
                        text: 'Share of Population Below 200% of Poverty Level'
                    },
                    max: 100,
                    startOnTick: false,
                    endOnTick: false,
                    labels: {
                        format: "{value:,.0f}%"
                    }
                },
                legend: {
                    enabled: false,
                    reversed: true
                },
                plotOptions: {
                    bar: {
                        colorByPoint: true,
                        colors: altColors
                    }
                },
                tooltip: tooltip,
                colors: altColors,
                series: series
            };

            $(id).highcharts(options);
        }

        // We need to fill in the years after 1970s without data with blanks so
        // that the graph maintains its scale.
        function fillInBlanks(data) {
            var blanked = [];

            i = 0;
            var year;
            for(year = YEARNAMES[0]; year <= YEARNAMES[YEARNAMES.length-1]; year++) {
                if (_.includes(ACTIVE_YEARS, year)) {
                    blanked.push(data[i]);
                    i++;
                } else {
                    blanked.push(null);
                }
            }

            return blanked;
        }

        function getSeries(data, geography) {
            console.log("setting up series", data);
            var series = [];
            series = [{
                name: 'Below 200% of Poverty Level',
                data: _.pluck(metroData, FOCUS_FIELD)
            }];
            return series;
        }

        function setup() {
            graph('#ec-c-chart', getSeries(metroData, 'Regional'));
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
                d[i][FOCUS_FIELD] = percent(d[i][FOCUS_FIELD]);
            }
            return d;
        }

        // Get the data ready to visualize
        function prepData(metro) {
            metroData = setupNumbers(metro);
            metroData = _.sortBy(metroData, FOCUS_FIELD).reverse();

            // Once we have the data, set up the visualizations
            setup();
        }


        $.when(metroPromise).done(prepData);
    });
})(jQuery);
