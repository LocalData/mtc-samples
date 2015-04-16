/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/
(function($) {
    /*
    Economic output

    B
    Line graph showing both total GRP and per-capita GRP for 10 metros -
    per-capita GRP shown by default, but user can select measure from button bar.
    Button bar also lets user see the % change in GRP, similar to T11-12-C.
    X-axis is year and Y-axis is $ of GRP (or % change). User can hover over
    line to see the specific GRP or per-capita GRP or % change for all metros
    for a given year.

    Y-axis: Gross Regional Product (in billions of dollars)
    OR Per-Capita Gross Regional Product (in dollars)

    Metro Comparison for Economic Output


    MISC

    TODO

    REQUESTS

    */

    $(function(){
        var i;
        var ec13Data, ec14Data;

        var CHART_BASE_TITLE = 'Metro Comparison for Economic Output';

        var YEARNAMES = [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
        var DASH_FORMAT = 'ShortDash';
        var CHART_ID = '#ec-c-chart';

        var GEO_KEY = 'MSA';
        var MODE_1 = {
            key: 'GRP_2013',
            label: 'Gross Regional Product (in billions of dollars)',
            data: ec13Data,
            format: "${value:,.0f}B",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>${point.y:,.0f} billion</b></td></tr>',
            type: 'line'
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
        var MODE_3 = {
            key: 'GRP_2013_PerChange2001',
            label: '% Change in Gross Regional Product',
            data: ec13Data,
            format: "{value:,.0f}%",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>',
            type: 'line'
        };
        var MODE_4 = {
            key: 'PC_GRP_2013_PerChange2001',
            label: '% Change in Per-Capita Gross Regional Product',
            data: ec14Data,
            format: "{value:,.0f}%",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>',
            type: 'line'
        };

        var mode = MODE_2;

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
                },
                tooltip: tooltip,
                series: series
            };

            $(id).highcharts(options);
        }

        function getSeries(mode) {
            var series = [];
            var groups = _.groupBy(mode.data, GEO_KEY);
            var orderedCities = _.keys(groups).sort();

            _.each(orderedCities, function(name) {
                var data = groups[name];
                var lineWidth = 1.5;
                if (name === 'Bay Area') {
                    lineWidth = 3.5;
                }

                series.push({
                    name: name,
                    data: _.pluck(data, mode.key),
                    lineWidth: lineWidth
                });
            });

            console.log("Got series", series, groups);
            return series;
        }


        function setup() {
            graph(CHART_ID, getSeries(mode));

            $('#ec-c-gross-product').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                mode = MODE_1;
                graph(CHART_ID, getSeries(mode));

                $(this).display();
            });
            $('#ec-c-gross-product-change').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                mode = MODE_3;
                graph(CHART_ID, getSeries(mode));

                $(this).display();
            });
            $('#ec-c-per-capita').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                mode = MODE_2;
                graph(CHART_ID, getSeries(mode));

                $(this).display();
            });
            $('#ec-c-per-capita-change').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                mode = MODE_4;
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
            for(i = 0; i < d.length; i++) {
                 d[i][MODE_1.key] = roundBillion(d[i][MODE_1.key]);
                 d[i][MODE_2.key] = round(d[i][MODE_2.key]);
                 d[i][MODE_3.key] = percent(d[i][MODE_3.key]);
                 d[i][MODE_4.key] = percent(d[i][MODE_4.key]);
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(ec13, ec14) {
            ec13Data = setupNumbers(_.clone(ec13[0], true));
            ec14Data = setupNumbers(_.clone(ec14[0], true));

            MODE_1.data = ec13Data;
            MODE_2.data = ec14Data;
            MODE_3.data = ec13Data;
            MODE_4.data = ec14Data;

            // Once we have the data, set up the visualizations
            setup();
        }

        var ec13Promise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/13/metro"
        });
        var ec14Promise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/14/metro"
        });

        $.when(ec13Promise, ec14Promise).done(prepData);
    });
})(jQuery);
