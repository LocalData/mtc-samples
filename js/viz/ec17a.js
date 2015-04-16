/*globals
jQuery, L, cartodb, geocities, econColors, allBlue, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/
(function($) {
    /*
    Freight

    A
    Line graph showing the TEUs moved through the Port of Oakland. Years should
    be shown on the x-axis with volume on the y-axis. No drop-down menus,
    button bar, or legend is required. Hovering over the line should show the
    data (Year placed above "Port of Oakland Container Volume: __ units")

    Y-axis: Container Volume (in thousands of TEUs)
    Historical Trend for Freight Activity - Port of Oakland

    MISC

    TODO

    REQUESTS
    - Legends are a bit confusing; maybe use straight TEUs

    */

    $(function(){
        var i;
        var portData;

        var CHART_ID = '#ec-a-chart';
        var CHART_BASE_TITLE = 'Historical Trend for Freight Activity - Port of Oakland';
        var Y_LABEL = 'Container Volume (in thousands of TEUs)';
        var FOCUS_KEY = 'TEU';

        var IMPORT_LABEL = 'Imports';
        var EXPORT_LABEL = 'Exports';

        var IMPORT = 'Import';
        var EXPORT = 'Export';

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
            } else {
                return this.value;
            }
        }


        function graph(series) {
            var tooltip = {
                // headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                // pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                // '<td style="padding:0"><b>{point.y:,.0f} TEUs</b></td></tr>',
                // footerFormat: '</table>',
                formatter: function() {
                    var points = this.points;
                    var s = '<table>';
                    var sum = 0;

                    // Year header
                    s += '<tr><td><span style="font-size:10px">' + points[0].key + '</span></td><td></td></tr>';

                    // Show each TEU
                    _.each(points, function(p) {
                        s += '<tr><td><strong style="color:' + p.series.color + '">';
                        s += p.series.name + ':';
                        s += '</strong></td><td>';
                        s += (p.y * 1000).toLocaleString();
                        s += ' units</tr>';
                        sum += p.y;
                    });

                    // Show at total at the bottom
                    s += '<tr><td><strong>Total:';
                    s += '</strong></td><td> <strong>';
                    s += (sum * 1000).toLocaleString();
                    s += ' units</strong></tr>';

                    s += '</table>';
                    return s;
                },
                shared: true,
                useHTML: true
            };

            console.log("Chart with", series);

            var options = {
                chart: {
                    type: 'area'
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
                        step: 2
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
                    area: {
                        stacking: 'normal',
                        lineColor: '#ffffff',
                        lineWidth: 1,
                        marker: {
                            lineWidth: 1,
                            lineColor: '#ffffff'
                        }
                    }
                },
                tooltip: tooltip,
                series: series
            };

            $(CHART_ID).highcharts(options);
        }


        function getSeries() {
            var importData = _.filter(portData, { Type: IMPORT, 'TEU Type': 'Full' });
            var importEmptyData = _.filter(portData, { Type: IMPORT, 'TEU Type': 'Empty' });
            var exportData = _.filter(portData, { Type: EXPORT, 'TEU Type': 'Full' });
            var exportEmptyData = _.filter(portData, { Type: EXPORT, 'TEU Type': 'Empty' });

            var series = [{
                name: IMPORT_LABEL + ' - full',
                data: _.pluck(importData, FOCUS_KEY),
                color: econColors[2]
            }, {
                name: IMPORT_LABEL + ' - empty',
                data: _.pluck(importEmptyData, FOCUS_KEY),
                color: econColors[1]
            }, {
                name: EXPORT_LABEL + ' - full',
                data: _.pluck(exportData, FOCUS_KEY),
                color: allBlue[2]
            }, {
                name: EXPORT_LABEL + ' - empty',
                data: _.pluck(exportEmptyData, FOCUS_KEY),
                color: allBlue[1]
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
        function prepData(port) {
            portData = setupNumbers(port);

            // Once we have the data, set up the visualizations
            setup();
        }


        var portPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/17/oakland"
        });


        $.when(portPromise).done(prepData);
    });
})(jQuery);
