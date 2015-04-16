/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/
(function($) {
    /*
    Economic output

    A
    Line graph showing both total GRP and per-capita GRP for Bay Area as a whole
    - per-capita GRP shown by default, but user can select measure from button
    bar. X-axis is year and Y-axis is $ of GRP. User can hover over line to see
    the specific GRP or per-capita GRP for a given year.

    Y-axis: Gross Regional Product (in billions of dollars)
    OR Per-Capita Gross Regional Product (in dollars)

    Historical Trend for Economic Activity - Bay Area

    MISC

    TODO

    REQUESTS

    */

    $(function(){
        var i;
        var ec13Data, ec14Data;

        var CHART_BASE_TITLE = 'Historical Trend for Economic Activity - Bay Area';

        var YEARNAMES = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
        var DASH_FORMAT = 'ShortDash';
        var MODE_1 = {
            key: 'GRP_2013',
            label: 'Gross Regional Product',
            yAxis: 'Gross Regional Product (in billions of dollars)',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>${point.y:,.0f} billion</b></td></tr>',
            data: ec13Data,
            format: "${value:,.0f}B"
        };
        var MODE_2 = {
            key: 'PC_GRP_2013',
            label: 'Per-Capita Gross Regional Product',
            yAxis: 'Per-Capita Gross Regional Product',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>${point.y:,.0f}</b></td></tr>',
            data: ec14Data,
            format: "${value:,.0f}"
        };

        var mode = MODE_1;

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

        function graph(id, series) {
            var tooltip = {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: mode.pointFormat,
                footerFormat: '</table>',
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
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: mode.yAxis
                    },
                    labels: {
                        format: mode.format
                    },
                    reversedStacks: false,
                    stackLabels: {
                        enabled: false
                    }
                },
                legend: {
                    enabled: false
                },
                colors: altColors,
                plotOptions: {
                },
                tooltip: tooltip,
                series: series
            };

            $(id).highcharts(options);
        }

        function getSeries(mode) {

            var series = [{
                name: mode.label,
                data: _.pluck(mode.data, mode.key)
            }];

            return series;
        }


        function setup() {
            graph('#ec-a-chart', getSeries(mode));

            $('#gross-product').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                mode = MODE_1;
                graph('#ec-a-chart', getSeries(mode));

                $(this).display();
            });
            $('#per-capita').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                mode = MODE_2;
                graph('#ec-a-chart', getSeries(mode));

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

            return Math.round(n/1000000000);
        }


        function percent(n) {
            return n * 100;
        }


        function setupNumbers(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                 d[i][MODE_1.key] = roundBillion(d[i][MODE_1.key]);
                 d[i][MODE_2.key] = round(d[i][MODE_2.key]);
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
            url: "http://54.149.29.2/ec/13/region"
        });
        var ec14Promise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/14/region"
        });

        $.when(ec13Promise, ec14Promise).done(prepData);
    });
})(jQuery);
