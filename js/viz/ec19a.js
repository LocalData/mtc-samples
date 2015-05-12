/*globals
jQuery, L, cartodb, geocities, econColors, allBlue, altColors, Highcharts, science,
regionPromise, countyPromise, cityPromise: true
*/
(function($) {
    /*
    Freight
    Bidirectional bar graph, similar to commute flow approach. On the right side,
    exports (broken into vessel and air freight) and on the left side, imports.
    Colors for export types should be somewhat similar and different from imports
    to signify what is going on. Legend should indicate the three bar "chunks".
    Years will be listed vertically along the y-axis with 2005 at the top and
    2013 at the bottom. Hovering over a bar for a year should show all three
    series' data.

    http://54.149.29.2/ec/18/region2    "
    X-axis: Freight Value (in millions of dollars)
    Y-axis: Year"

    Historical Trend for Freight Value

    MISC

    TODO

    REQUESTS

    */

    $(function(){
        var i;
        var regionData;

        var CHART_BASE_TITLE = 'Historical Trend for Freight Value - Imports and Exports (International)';
        var CHART_ID = '#ec-a-chart';
        var YAXIS_LABEL = 'Freight Value (in billions of dollars)';
        var XAXIS_LABEL = '';

        var FOCUS_FIELD = 'Value';
        var TYPE_FIELD = 'Type';
        var FOCUS_FIELDS = {
            'Export Air': {
                color: econColors[1]
            },
            'Export Vessel': {
                color: econColors[2]
            },
            'Imports': {
                color: allBlue[0]
            }
        };

        var YEARS = [2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];

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


        function getAllSeries() {
            var exportVessel = _.pluck(_.filter(regionData, { Type: 'Export Vessel' }), FOCUS_FIELD);
            var exportAir = _.pluck(_.filter(regionData, { Type: 'Export Air' }), FOCUS_FIELD);
            var imports = _.pluck(_.filter(regionData, { Type: 'Imports' }), FOCUS_FIELD);

            var series = [{
                name: 'Exports - Vessel',
                data: exportVessel,
                color: econColors[3]
            },{
                name: 'Exports - Air',
                data: exportAir,
                color: econColors[2]
            },{
                name: 'Imports',
                data: imports,
                color: allBlue[1]
            }];

            return series;
        }

        function chart() {
            var series = getAllSeries();

            var tooltip = {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.0f}</b></td></tr>',
                formatter: function() {
                    var points = this.points;
                    var s = '<table>';

                    // Year header
                    s += '<tr><td><span style="font-size:10px">' + points[0].key + '</span></td><td></td></tr>';

                    // Show each TEU
                    _.each(points, function(p) {
                        var val = p.y;
                        if (val < 0) {
                            val = -val;
                        }

                        s += '<tr><td><strong style="color:' + p.series.color + '">';
                        s += p.series.name + ':';
                        s += '</strong></td><td>$';
                        s += (val / 1000000000).toFixed(1); //.toLocaleString();
                        s += ' billion</tr>';
                    });

                    s += '</table>';
                    return s;
                },
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            };

            var title = CHART_BASE_TITLE;

            var options = {
                chart: {
                    type: 'bar'
                },
                title: {
                    text: title
                },
                xAxis: {
                    categories: YEARS,
                    tickmarkPlacement: 'on',
                    title: {
                        text: XAXIS_LABEL
                    }
                },
                yAxis: {
                    title: {
                        text: YAXIS_LABEL
                    },
                    labels: {
                        step: 2,
                        format: '${value:,.0f}',
                        formatter: function() {
                            var val = this.value / 1000000000;
                            if (val < 0) {
                                return '$' + (-val).toLocaleString() + 'B';
                            }
                            return '$' + val.toLocaleString() + 'B';
                        }
                    },
                    reversedStacks: true,
                    stackLabels: {
                        enabled: false
                    }
                },
                legend: {
                    enabled: true,
                    reversed: true
                },
                colors: altColors,
                plotOptions: {
                    series: {
                        stacking: 'normal'
                    }
                },
                tooltip: tooltip,
                series: series
            };


            $(CHART_ID).highcharts(options);
        }


        function setup() {
            chart();
        }


        function round(n) {
            if (n === null) {
                return n;
            }

            return Math.round(n/100) * 100;
        }


        function roundBillion(n) {
            if (n === null) {
                return n;
            }

            return Math.round(n/1000000000);
        }


        function percent(n) {
            return n * 100;
        }


        function setupNumbers(d) {
            var i, j;
            for(i = 0; i < d.length; i++) {

                // d[i][FOCUS_FIELD] = d[i][FOCUS_FIELD];

                // Make the imports negative
                if (d[i][TYPE_FIELD] === 'Imports') {
                    d[i][FOCUS_FIELD] = -d[i][FOCUS_FIELD];
                }
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(region) {
            regionData = setupNumbers(region);

            // Once we have the data, set up the visualizations
            setup();
        }


        var regionPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/19/region"
        });
        $.when(regionPromise).done(prepData);
    });
})(jQuery);
