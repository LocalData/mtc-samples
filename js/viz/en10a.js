/*globals
jQuery, L, cartodb, geocities, allGreen, allBlue, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/
(function($) {
    /*
    Bay fill

    A
    Bar graph should show the annual change in the Bay surface, while an
    overlaid line graph shows the cumulative change. No button bar or dropdowns.
    X-axis should be years and Y-axis should be change in Bay surface area.
    Hovering over the data should show the change in Bay acreage for the
    selected year as well as the cumulative change for that year back to the
    beginning of records in 1969 (e.g. "Annual Change = +XX acres
    Change since 1969 = +XXX acres")

    http://vitalsigns-production.elasticbeanstalk.com/en/10/region
    Y-axis: Bay Acreage Change

    Line with label: "Cumulative Change since 1969"; Bar swatch: "Annual Change"

    MISC

    TODO

    REQUESTS

    */

    $(function(){
        var i, data;

        var CHART_ID = '#en-a-chart';
        var CHART_BASE_TITLE = 'Historical Trend for San Francisco Bay Acreage';
        var Y_LABEL = 'San Francisco Bay Acreage';
        //var Y_ANNUAL_LABEL = 'Bay Acreage Annual Change';
        var FOCUS_KEY = 'Acres_Chg_Bay_Surface';
        var ANNUAL_LABEL = 'Annual Change';
        var CUMULATIVE_KEY = 'Cumulative_Chg_since1969';
        var CUMULATIVE_LABEL = 'Cumulative Change since 1969';

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

        /* -- EC-8 A (Regional rent graph) -----------------------------------*/
        function formatter() {
            if (this.value === 'Bay Area') {
                return '<span style="font-weight:800;color:#000;">' + this.value + '</span>';
            }
            return this.value;
        }


        function graph(series) {
            var tooltip = {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormatter: function() {
                    var val = parseFloat(this.y.toFixed(0)).toLocaleString();
                    if (this.y > 0) {
                        val = '+' + val;
                    }

                    var s = '<tr><td style="color:' + this.series.color + ';padding:0">';
                    s += this.series.name + ': </td>';
                    s += '<td style="padding:0"><b>' + val + ' acres</b></td></tr>';
                    return s;
                },
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            };

            var options = {
                chart: {
                },
                title: {
                    text: CHART_BASE_TITLE
                },
                xAxis: {
                    categories: yearNames,
                    tickmarkPlacement: 'on',
                    title: {
                        text: 'Year'
                    },
                    labels: {
                        step: 5
                    }
                },
                yAxis: [{
                    title: {
                        text: Y_LABEL
                    },
                    startOnTick: false,
                    endOnTick: false,
                    min: -1000
                }
                //, {
                //    title: {
                //        text: Y_ANNUAL_LABEL
                //    },
                //    endOnTick: false,
                //    opposite: true,
                //    max: 4000
                //}
                ],
                colors: allGreen,
                // plotOptions: {
                //     area: {
                //         stacking: 'normal',
                //         lineColor: '#ffffff',
                //         lineWidth: 1,
                //         marker: {
                //             lineWidth: 1,
                //             lineColor: '#ffffff'
                //         }
                //     }
                // },
                tooltip: tooltip,
                series: series
            };

            // Don't explicitly set step size on smaller screens
            if (window.innerWidth < 650) {
                delete options.xAxis.labels.step;
            }

            $(CHART_ID).highcharts(options);
        }


        function getSeries() {
            var series = [{
                type: 'column',
                //yAxis: 1,
                name: ANNUAL_LABEL,
                data: _.pluck(data, FOCUS_KEY),
                color: allGreen[1]
            }, {
                type: 'spline',
                name: CUMULATIVE_LABEL,
                data: _.pluck(data, CUMULATIVE_KEY),
                color: allGreen[3]
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


        function setupNumbers(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                 d[i][FOCUS_KEY] = roundThousands(d[i][FOCUS_KEY]);
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(raw) {
            data = raw;

            // Get the min and max year
            var years = _.pluck(data, YEAR_KEY);
            maxYear = _.max(years);
            minYear = _.min(years);
            for (i = minYear; i <= maxYear; i++) {
                yearNames.push(i);
            }

            // Once we have the data, set up the visualizations
            setup();
        }


        var promise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/en/10/region"
        });


        $.when(promise).done(prepData);
    });
})(jQuery);
