/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/
(function($) {
    /*
    A
    Area graph showing the passengers boarding at the four Bay Area airports
    stacked on top of one another - should not sum to 100% like mode choice.
    Years should be shown on the x-axis with passenger totals on the y-axis.
    No drop-down menus, button bar required. Legend should be below with the
    names of the four airports (San Francisco (SFO), Oakland (OAK),
    San Jose (SJC), and Santa Rosa (STS)). Hovering over the line should show
    the data for all four airports in that year (Year placed above "SFO
    Airport: __ enplanements")

    Y-axis: Boardings (in thousands)
    Historical Trend for Airport Activity - Passengers


    MISC

    TODO

    REQUESTS
    - Legends are a bit confusing; maybe use straight TEUs

    */

    $(function(){
        var i;
        var portData;

        var CHART_BASE_TITLE = 'Historical Trend for Airport Activity - Passengers';

        var yearnames;
        var DASH_FORMAT = 'ShortDash';
        var CHART_ID = '#ec-a-chart';

        var YEAR_KEY = 'Year';
        var GEO_KEY = 'Airport';
        var FOCUS_KEY = 'Enplanements';
        var Y_AXIS = 'Annual Boardings';

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

        var groups;

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
                        s += ' boardings</strong></tr>';
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
                    categories: yearnames,
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
            var groupedData = _.groupBy(portData, GEO_KEY);
            _.each(groups, function(name) {
                var data = groupedData[name];
                var zIndex = 1;
                if (name === 'Santa Rosa (STS)') {
                    zIndex = 3;
                }

                series.push({
                    name: name,
                    color: data[0].color,
                    zIndex: zIndex,
                    data: _.pluck(data, FOCUS_KEY)
                });
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

            if (1000 > n) {
                return n;
            }

            return Math.round(n/1000) * 1000;
        }


        function percent(n) {
            return n * 100;
        }


        function prep(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                 d[i][FOCUS_KEY] = roundThousands(d[i][FOCUS_KEY]);

                 d[i].color = LABELS[d[i].Airport].color;
                 d[i].Airport = LABELS[d[i].Airport].label;
            }
            return d;
        }


        function getYears(data) {
            return _.chain(data).pluck('Year').uniq().value().sort();
        }


        // Get the data ready to visualize
        function prepData(ports) {
            portData = prep(ports);

            yearnames = getYears(portData);

            // Sort the cities by 2013 values (smaller on top)
            groups = _.chain(portData)
                        .filter({ Year: 2013})
                        .sortBy(FOCUS_KEY)
                        .pluck(GEO_KEY)
                        .value();

            // Once we have the data, set up the visualizations
            setup();
        }

        var portPromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/ec/17/passengers"
        });

        $.when(portPromise).done(prepData);
    });
})(jQuery);
