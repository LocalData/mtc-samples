/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/
(function($) {
    /*
    Economic output

    B
    Default mode: stacked area chart (not summed to 100%) showing the five
    subregions' GRP stacked in rank order (largest at bottom). User can hover
    over data and see all five data points for the given year in a tooltip.
    Button bar allows user to switch from total mode to per-capita mode. In
    per-capita mode, the graph should revert to a line graph with five lines.
    For both, graph should have years on X-axis and $ on Y-axis.

    Y-axis: Gross Subregional Product (in billions of dollars) OR
    Per-Capita Gross Subregional Product (in dollars)

    Regional Breakdown of Economic Output

    MISC

    TODO

    REQUESTS

    */

    $(function(){
        var i;
        var ec13Data, ec14Data;

        var CHART_BASE_TITLE = 'Regional Breakdown of Economic Output';

        var NAME_MAPPINGS = {
            'San Francisco': 'San Francisco MSA',
            'San Jose': 'San Jose MSA',
            'Santa Rosa': 'Sonoma County',
            'Vallejo': 'Solano County',
            'Napa': 'Napa County'
        };

        var YEARNAMES = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
        var DASH_FORMAT = 'ShortDash';
        var CHART_ID = '#ec-b-chart';

        var GEO_KEY = 'MSA';
        var MODE_1 = {
            key: 'GRP_2013',
            label: 'Gross Subregional Product (in billions of dollars)',
            data: ec13Data,
            format: "${value:,.0f}B",
            formatter: function() {
                // Show the largest points first
                var points = _.sortBy(this.points, 'y').reverse();
                var s = '<span style="font-size:10px">' + this.x + '</span><table>';
                _.each(points, function(p) {
                    s += '<tr><td><strong style="color:' + p.series.color + '">';
                    s += p.series.name + ':';
                    s += '</strong></td><td> <strong>$';
                    s += p.y + ' billion';
                    s += '</strong></tr>';
                });
                s += '</table>';
                return s;
            },
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>${point.y:,.1f} billion</b></td></tr>',
            type: 'area'
        };
        var MODE_2 = {
            key: 'PC_GRP_2013',
            label: 'Per-Capita Gross Regional Product',
            data: ec14Data,
            format: "${value:,.0f}",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>${point.y:,.0f}</b></td></tr>',
            type: 'line'
        };

        var mode = MODE_1;

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

        function graph(id, series) {
            var tooltip = {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: mode.pointFormat,
                footerFormat: '</table>',
                formatter: mode.formatter,
                shared: true,
                useHTML: true
            };

            var options = {
                chart: {
                    type: mode.type
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
                        text: mode.label
                    },
                    labels: {
                        format: mode.format
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
                    area: {
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

            $(id).highcharts(options);
        }

        function getSeries(mode) {

            var series = [];
            var groups = _.groupBy(mode.data, GEO_KEY);
            _.each(groups, function(data, name) {
                var s = {
                    name: name,
                    data: _.pluck(data, mode.key)
                };

                // Show napa on the top
                // Otherwise it gets buried, since it is so small
                if (name === 'Napa') {
                    s.zIndex = 8;
                }
                series.push(s);
            });

            return series;
        }


        function setup() {
            graph(CHART_ID, getSeries(mode));

            $('#ec-b-gross-product').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                mode = MODE_1;
                graph(CHART_ID, getSeries(mode));

                $(this).display();
            });
            $('#ec-b-per-capita').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                mode = MODE_2;
                graph(CHART_ID, getSeries(mode));

                $(this).display();
            });
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

            return Math.round(n/100000000) / 10;
        }


        function percent(n) {
            return n * 100;
        }


        function setupNumbers(d) {
            var i;
                 console.log("Setting up", d);
            for(i = 0; i < d.length; i++) {
                 d[i][MODE_1.key] = roundBillion(d[i][MODE_1.key]);
                 d[i][MODE_2.key] = round(d[i][MODE_2.key]);

                 // We need to rename some of the MSAs
                 if (_.has(NAME_MAPPINGS, d[i].MSA)) {
                    d[i].MSA = NAME_MAPPINGS[d[i].MSA];
                 }
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(ec13, ec14) {
            ec13Data = setupNumbers(_.clone(ec13[0], true));
            ec14Data = setupNumbers(_.clone(ec14[0], true));

            MODE_1.data = ec13Data;
            MODE_2.data = ec14Data;

            // Once we have the data, set up the visualizations
            setup();
        }

        var ec13Promise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/ec/13/subregion"
        });
        var ec14Promise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/ec/14/subregion"
        });

        $.when(ec13Promise, ec14Promise).done(prepData);
    });
})(jQuery);
