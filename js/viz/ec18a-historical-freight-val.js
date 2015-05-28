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

    http://vitalsigns-production.elasticbeanstalk.com/ec/18/region2    "
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

        var CHART_BASE_TITLE = 'Historical Trend for Freight Value';
        var CHART_ID = '#ec-a-chart';
        var YAXIS_LABEL = ''; //'Share of Income Spent on Housing';
        var XAXIS_LABEL = 'Freight Value (in millions of dollars)';

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
                name: 'Vessel',
                data: exportVessel
            },{
                name: 'Air Freight',
                data: exportAir
            },{
                name: 'Imports',
                data: imports
            }];


            console.log("Got series", series);

            return series;
        }

        function chart() {
            var series = getAllSeries();

            var tooltip = {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            };

            var title = CHART_BASE_TITLE;

            var options = {
                chart: {
                    type: 'column'
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
                        format: '{value:,.0f}%'
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
            url: "http://vitalsigns-production.elasticbeanstalk.com/ec/18/region2"
        });
        $.when(regionPromise).done(prepData);
    });
})(jQuery);
