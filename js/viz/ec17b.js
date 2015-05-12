/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/
(function($) {
    /*
    Freight

    B
    Area graph showing the tons moved through the three Bay Area airports
    stacked on top of one another - should not sum to 100% like mode choice.
    Years should be shown on the x-axis with volumes on the y-axis. No drop-down
    menus, button bar required. Legend should be below with the names of the
    three airports (San Francisco (SFO), Oakland (OAK), San Jose (SJC)).
    Hovering over the line should show the data for all three airports in that
    year (Year placed above "SFO Airport Tonnage: __ units")

    Y-axis: Tons (in thousands)
    Historical Trend for Freight Activity - Major Airports


    MISC

    TODO

    REQUESTS
    - Legends are a bit confusing; maybe use straight TEUs

    */

    $(function(){
        var i;
        var portData;

        var CHART_BASE_TITLE = 'Historical Trend for Airport Activity - Freight';

        var YEARNAMES = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
        var DASH_FORMAT = 'ShortDash';
        var CHART_ID = '#ec-b-chart';

        var GEO_KEY = 'Airport';
        var FOCUS_KEY = 'Tons';
        var Y_AXIS = 'Annual Tonnage';

        var LABELS = {
            'Oakland': {
                label: 'Oakland (OAK)',
                color: altColors[1]
            },
            'San Francisco': {
                label: 'San Francisco (SFO)',
                color: econColors[0]
            },
            'San Jose': {
                label: 'San Jose (SJC)',
                color: altColors[2]
            },
            'Santa Rosa': {
                label: 'Santa Rosa (STS)',
                color: altColors[3]
            }
        };

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
                // headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                // pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                // '<td style="padding:0"><b>{point.y:,.0f}</b> tons</td></tr>',
                // footerFormat: '</table>',
                formatter: function() {
                    var points = this.points;
                    var s = '<table>';

                    // Year header
                    s += '<tr><td><span style="font-size:10px">' + points[0].key + '</span></td><td></td></tr>';

                    // Show each TEU
                    _.each(points, function(p) {
                        s += '<tr><td><strong style="color:' + p.series.color + '">';
                        s += p.series.name + ':';
                        s += '</strong></td><td> <strong>';
                        s += (p.y).toLocaleString();
                        s += ' tons</strong></tr>';
                    });

                    s += '</table>';
                    return s;
                },
                shared: true,
                useHTML: true
            };

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
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: Y_AXIS
                    },
                    // labels: {
                    //     format: mode.format
                    // },
                    // reversedStacks: false,
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
            var series = [];
            var groups = _.groupBy(portData, GEO_KEY);
            _.each(groups, function(data, name) {
                series.push({
                    name: name,
                    data: _.pluck(data, FOCUS_KEY),
                    color: data[0].color
                });
            });

            return series.reverse();
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

            return Math.round(n/1000) * 1000;
        }


        function percent(n) {
            return n * 100;
        }


        function setupNumbers(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                 d[i][FOCUS_KEY] = roundThousands(d[i][FOCUS_KEY]);

                 d[i].color = LABELS[d[i].Airport].color;
                 d[i].Airport = LABELS[d[i].Airport].label;

                 // if(d[i].Airport === 'Oakland') {
                 //    d[i].Airport += ' (OAK)';
                 // } else if (d[i].Airport === 'San Francisco') {
                 //    d[i].Airport += ' (SFO)';
                 // } else {
                 //    d[i].Airport += ' (SJC)';
                 // }
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(ports) {
            portData = setupNumbers(ports);

            // Once we have the data, set up the visualizations
            setup();
        }

        var portPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/17/freight"
        });

        $.when(portPromise).done(prepData);
    });
})(jQuery);
