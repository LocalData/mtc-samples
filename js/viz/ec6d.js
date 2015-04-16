/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/
(function($) {
    /*
    Labor force participation

    D
    Simple bar graph showing labor force participation rates in 2013. No
    dropdowns or button bar. X-axis should be % LFP and Y-axis should be metro
    names (with Bay Area in bold); rank order with highest LFP at top. Hovering
    over data should show data for bar selected (example: Philadelphia: XX%).

    X-axis: Labor Force Participation
    Metro Comparison for 2013 Labor Force Participation

    MISC

    TODO

    REQUESTS

    */


    $(function(){
        var CHART_ID = '#ec-d-chart';
        var CHART_BASE_TITLE = 'Metro Comparison for 2013 Labor Force Participation';
        var FOCUS_FIELD = 'LF_16xx';

        var DASH_FORMAT = 'ShortDash';

        var i;
        var metroData;

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


        function graph(series) {
            var tooltip = {
                shared: false,
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>',
                footerFormat: '</table>',

                //formatter: function() {
                //    var s = '<span style="font-size:10px">' + this.series.name + '</span><table>';
                //    _.each(this.series.data, function(d) {
                //        s += '<tr>';
                //        s += '<td style="color:' + d.color + ';padding:0">';
                //        s += d.category + ': </td><td style="padding:0"><b>';
                //        s += d.y.toFixed(1) + '%</b></td></tr>';
                //    });
                //    s += '</table';
                //    return s;
                //},
                useHTML: true
            };

            var categories = _.pluck(metroData, 'GeoName');

            var options = {
                chart: {
                    type: 'bar'
                },
                plotOptions: {
                    bar: {
                        colorByPoint: true,
                        colors: altColors
                    }
                },
                title: {
                    text: CHART_BASE_TITLE
                },
                xAxis: {
                    categories: categories,
                    labels: {
                        formatter: formatter
                    },
                    title: {
                        text: ''
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Labor Force Participation'
                    },
                    labels: {
                        format: "{value:,.0f}%"
                    }
                },
                legend: {
                    enabled: false
                },
                tooltip: tooltip,
                colors: altColors,
                series: series
            };
            $(CHART_ID).highcharts(options);
        }


        function getSeries() {
            var series = [];
            series = [{
                name: 'Labor Force Participation',
                data: _.pluck(metroData, FOCUS_FIELD)
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


        function percent(n) {
            return (n * 100);
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

        var metroPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/6/metro"
        });
        $.when(metroPromise).done(prepData);
    });
})(jQuery);
