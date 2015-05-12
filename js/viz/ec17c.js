/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/
(function($) {
    /*
    Airports - Boardings

    C
    Line graph showing the passenger boardings through the combined airports in
    each metro area. Years should be shown on the x-axis with passengers shown
    on the y-axis. No button bar needed. Legend should be shown below
    ("Los Angeles: __ enplanements" for example). Hovering over the line should
    show the data for all metros in that year.

    Y-axis: Boardings (in millions)
    Metro Comparison for Airport Activity - Passengers

    MISC

    TODO

    REQUESTS

    */

    $(function(){
        var i;
        var metroData;

        var CHART_BASE_TITLE = 'Metro Comparison for Airport Activity - Passengers';

        var yearnames;
        var CHART_ID = '#ec-c-chart';

        var FOCUS_KEY = 'Enplanements';
        var GEO_KEY = 'Metro';
        var Y_AXIS = 'Annual Boardings';

        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });


        function chart(series) {
            var tooltip = {
                formatter: function() {
                    var points = _.sortBy(this.points, 'y').reverse();
                    var s = '<table>';

                    // Year header
                    s += '<tr><td><span style="font-size:10px">' + points[0].key + '</span></td><td></td></tr>';

                    // Show each TEU
                    _.each(points, function(p) {
                        s += '<tr><td><strong style="color:' + p.series.color + '">';
                        s += p.series.name + ':';
                        s += '</strong></td><td> <strong>';
                        s += (p.y / 1000000).toFixed(1);
                        s += ' million boardings</strong></tr>';
                    });

                    s += '</table>';
                    return s;
                },
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
                    categories: yearnames,
                    tickmarkPlacement: 'on'
                },
                yAxis: {
                    title: {
                        text: Y_AXIS
                    },
                    // labels: {
                    //     format: mode.format
                    // },
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
            var series = [];
            var groups = _.groupBy(metroData, GEO_KEY);
            var orderedCities = _.keys(groups).sort();

            _.each(orderedCities, function(name) {
                var data = groups[name];
                var lineWidth = 1.5;
                if (name === 'Bay Area') {
                    lineWidth = 3.5;
                }

                series.push({
                    name: name,
                    data: _.pluck(data, FOCUS_KEY),
                    lineWidth: lineWidth
                });
            });

            console.log("Got series", series, groups);
            return series;
        }


        function setup() {
            chart(getSeries());
        }


        function round(n) {
            if (n === null) {
                return n;
            }

            return Math.round(n/100) * 100;
        }


        function roundMillion(n) {
            if (n === null) {
                return n;
            }

            return Math.round(n/100000) * 100000;
        }


        function percent(n) {
            return n * 100;
        }


        function setupNumbers(d) {
            // var i;
            // for(i = 0; i < d.length; i++) {
            //     // d[i][FOCUS_KEY] = roundMillion(d[i][FOCUS_KEY]);
            // }
            return d;
        }


        function getYears(data) {
            return _.chain(data).pluck('Year').uniq().value().sort();
        }


        // Get the data ready to visualize
        function prepData(data) {
            metroData = setupNumbers(data);
            yearnames = getYears(metroData);

            // Once we have the data, set up the visualizations
            setup();
        }

        var metroPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/17/metro"
        });

        $.when(metroPromise).done(prepData);
    });
})(jQuery);
