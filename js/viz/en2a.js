/*globals
jQuery, L, cartodb, geocities, econColors, allBlue, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/
(function($) {
    /*
    Particulate Matter

    A
    Simple line graph showing ozone concentrations at worst location,
    1-yr average, and 3-year rolling average (refer to slide deck for example -
    note that 3-yr average should be visually emphasized over 1-yr given the
    1-yr noise). No button bar or drop-down menus needed. X-axis should
    be years and Y-axis should be ozone concentrations. When hovering over
    line graph, it should display the three data points for the given year -
    for example: "Worst Location: XXX ppb   Annual: YY ppb   3-Year Average:
    ZZ ppb". Legend should show the three line colors with appropriate labels.

    Y-axis: 8-Hour Maximum Ozone Concentration (ppb)
    Historical Trend for Ozone Concentrations - Bay Area

    MISC

    TODO

    REQUESTS

    */

    $(function(){
        var i;
        var data;

        var CHART_ID = '#en-a-chart';
        var CHART_BASE_TITLE = 'Historical Trend for Ozone Concentrations - Bay Area';
        var Y_LABEL = ' 8-Hour Maximum Ozone Concentration (ppb)';

        var AVG_3YR_LABEL = '3-Year Average';
        var AVG_3YR_KEY = 'Ozone_Max4_Daily_8HR_ppb_Annual_3YR';

        var AVG_LABEL = 'Annual Average';
        var AVG_KEY = 'Ozone_Max4_Daily_8HR_ppb_Annual_1YR';

        var TOP_LABEL = 'Worst Location';
        var TOP_KEY = 'Ozone_Max4_Daily_8HR_ppb_WorstLocation_1YR';

        var YEAR_KEY = 'Year';
        var minYear;
        var maxYear;
        var yearNames = [];
        var DASH_FORMAT = 'ShortDash';

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


        function graph(series) {
            var tooltip = {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f} ppb</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            };

            var options = {
                chart: {
                    type: 'line'
                },
                title: {
                    text: CHART_BASE_TITLE
                },
                xAxis: {
                    categories: yearNames,
                    tickmarkPlacement: 'on'
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: Y_LABEL
                    },
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
                series: series
            };

            $(CHART_ID).highcharts(options);
        }


        function getSeries() {
            var series = [{
                name: TOP_LABEL,
                data: _.pluck(data, TOP_KEY),
                lineWidth: 1.5,
                marker: {
                    radius: 3
                }
            }, {
                name: AVG_LABEL,
                data: _.pluck(data, AVG_KEY),
                lineWidth: 1.5,
                marker: {
                    radius: 3
                }
            }, {
                name: AVG_3YR_LABEL,
                data: _.pluck(data, AVG_3YR_KEY),
                lineWidth: 3
            }];
            return series;
        }


        function setup() {
            graph(getSeries());
        }


        function round(n) {
            if (n === null) {
                return n;
            }

            return Math.round(n/100) * 100;
        }


        function roundThousands(n) {
            if (n === null) {
                return n;
            }

            return Math.round(n/1000);
        }


        function percent(n) {
            return n * 100;
        }


        // Get the data ready to visualize
        function prepData(rawData) {
            data = rawData;

            var years = _.pluck(data, YEAR_KEY);
            maxYear = _.max(years);
            minYear = _.min(years);
            for (i = minYear; i <= maxYear; i++) {
                yearNames.push(i);
            }

            // Once we have the data, set up the visualizations
            setup();
        }


        var dataPromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/en/2/region"
        });


        $.when(dataPromise).done(prepData);
    });
})(jQuery);
