/*globals
jQuery, L, cartodb, geocities, econColors, allBlue, altColors, Highcharts, science,
regionPromise, countyPromise, cityPromise: true
*/
(function($) {
    /*
    Freight
    Simple pie graph using 2013 freight value data. Each port should have a
    calculated share of the total freight value to the region. When hovering
    over the pie graph, it should display the value and % share for that slice
    (a given port). For example: Port of Oakland - $47.37 billion - XX%. No
    button bars or dropdowns needed. Legend should show the names of the ports
    (listed solely as cities - Alameda, Carquinez Strait, etc.)


    MISC

    TODO

    REQUESTS

    */

    $(function(){
        var i;
        var regionData;

        var CHART_BASE_TITLE = 'Regional Breakdown of 2013 Freight Value by Port (International)';
        var CHART_ID = '#ec-b-chart';
        var YAXIS_LABEL = 'Freight Value (in millions of dollars)'; //'Share of Income Spent on Housing';
        var XAXIS_LABEL = '';
        var GEO_FIELD = 'Name';

        var FOCUS_FIELD = 'Total Value 2013';
        var TYPE_FIELD = 'Type';

        var YEAR = 2013;

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


        function getAllSeries() {
            var groups = _.groupBy(regionData, GEO_FIELD);
            var data = [];
            _.each(groups, function(importExport, name) {
                var sum = _.sum(_.pluck(importExport, FOCUS_FIELD));
                data.push({
                    name: name,
                    y: sum
                });
            });

            data = _.sortBy(data, 'y').reverse();

            var series = {
                type: 'pie',
                name: CHART_BASE_TITLE,
                data: data
            };

            return [series];
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

                    s += '<tr><td><strong style="color:' + this.series.color + '">';
                    s += this.key + ':';
                    s += '</strong></td><td>$';
                    s += (this.y / 100).toFixed(1);
                    s += ' billion</tr>';

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
                    spacingRight: 0
                },
                title: {
                    text: title
                },
                colors: altColors,
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                            // format: '<span style="color:{point.color}">{point.name}</span>'
                        },
                        showInLegend: true
                    }
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle',
                    x: -250,
                    //y: 35,
                    itemMarginBottom: 5
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

                d[i][FOCUS_FIELD] = Math.round(d[i][FOCUS_FIELD] / 10000000);

                // Remove 'CA' from the end of the name
                d[i][GEO_FIELD] = _.trimRight(d[i][GEO_FIELD], ', CA');

                // Make the imports negative
                if (d[i][TYPE_FIELD] === 'Imports') {
                    d[i][FOCUS_FIELD] = -d[i][FOCUS_FIELD];
                }
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(region) {
            regionData = _.filter(region, { Year: YEAR });
            regionData = setupNumbers(regionData);

            // Once we have the data, set up the visualizations
            setup();
        }


        var regionPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/19/ports"
        });
        $.when(regionPromise).done(prepData);
    });
})(jQuery);
