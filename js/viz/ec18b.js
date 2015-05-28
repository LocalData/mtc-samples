/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/
(function($) {
    /*
    Freight

    A
    Line graph showing the TEUs moved through the largest US ports. Years should
    be shown on the x-axis with volumes on the y-axis. No button bar needed.
    Legend should be shown below ("Port of Los Angeles: " for example); non-top
    10 metro ports should be shown with a dashed instead of solid line. Hovering
    over the line should show the data for all ports in that year.

    Y-axis: Container Volume (in thousands of TEUs)
    Metro Comparison for Freight Activity

    MISC

    TODO

    REQUESTS
    - Legends are a bit confusing; maybe use straight TEUs

    */

    $(function(){
        var i;
        var portData;

        var CHART_ID = '#ec-c-chart';
        var CHART_BASE_TITLE = 'Metro Comparison for Seaport Activity';
        var Y_LABEL = 'Container Volume (TEUs)';

        var FOCUS_KEY = 'TEUs';
        var GEO_KEY = 'Port';

        var BOTTOM_PORTS = ['Freeport', 'Galveston', 'Palm Beach', 'Philadelphia', 'Miami', 'Port Everglades'];

        var MINYEAR = 1990;
        var MAXYEAR = 2013;
        var YEARNAMES = [];
        for (i = MINYEAR; i <= MAXYEAR; i++) {
            YEARNAMES.push(i);
        }
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
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.0f}</b></td></tr>',
                footerFormat: '</table>',
                formatter: function() {
                    // Show the largest points first
                    var points = _.sortBy(this.points, 'y').reverse();
                    var s = '<table>';
                    _.each(points, function(p) {
                        s += '<tr><td><strong style="color:' + p.series.color + '">';
                        s += p.series.name + ':';
                        s += '</strong></td><td> <strong>';
                        s += p.y.toLocaleString();
                        s += ' units</strong></tr>';
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
                    categories: YEARNAMES,
                    tickmarkPlacement: 'on',
                    title: {
                        text: 'Year'
                    },
                    labels: {
                        step: 3
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: Y_LABEL
                    },
                    // labels: {
                    //     format: mode.format
                    // },
                    reversedStacks: false,
                    stackLabels: {
                        enabled: false
                    }
                },
                legend: {
                    enabled: true,
                    symbolWidth: 25
                },
                colors: altColors,
                plotOptions: {
                },
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
            var series = [];
            var groups = _.groupBy(portData, GEO_KEY);
            _.each(groups, function(data, name) {
                var s = {
                    name: name,
                    data: _.pluck(data, FOCUS_KEY),
                    lineWidth: 1.5
                };

                // Hide smaller ports to start with
                if (_.last(_.pluck(data, FOCUS_KEY)) < 1000000) {
                    s.visible = false;
                }

                // Make smaller ports dashed / less prominent
                if (_.contains(BOTTOM_PORTS, name)) {
                    s.dashStyle = DASH_FORMAT;
                    s.lineWidth = 1;
                }

                // Make Oakland stand out
                if (name === 'Oakland') {
                    s.lineWidth = 3;
                }

                series.push(s);
            });

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
        function prepData(port) {
            portData = port;

            // Once we have the data, set up the visualizations
            setup();
        }


        var portPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/18/metro"
        });


        $.when(portPromise).done(prepData);
    });
})(jQuery);
