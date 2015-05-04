/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science,
regionPromise, countyPromise, cityPromise: true
*/
(function($) {
    /*
    Home prices

    C
    Line graph showing the inflation-adjusted median home prices (or % growth)
    of 8 of the 10 major metro areas (Texas does not report data). X-axis should
    show years and Y-axis should show either $ or % growth. User should be able
    to turn on or off metro areas in graph. User should be able to hover over
    graph to see all metros' home prices for the selected year. Button bar
    allows for switch between $ and % modes.

    Y-axis: Median Home Price ($) OR
    Change in Median House Price since 1997 (%)

    Metro Comparison for Home Prices
    OR Metro Comparison for Percent Change in Home Prices

    MISC

    TODO

    REQUESTS

    */

    $(function(){
        var i;
        var metroData;
        var dates;

        var CHART_BASE_TITLE = 'Metro Comparison for Home Prices';
        var CHART_ID = '#ec-c-chart';
        var METRO_NAME_KEY = 'Metro';

        var MEDIAN_KEY = 'MedPrice';
        var MEDIAN_IA_KEY = 'MedPrice_IA';
        var PERCENT_KEY = 'PercentChngPriceIA';

        var DASH_FORMAT = 'ShortDash';

        var MAXYEAR = 2014;
        var MINYEAR = 1997;
        var YEARNAMES = [];
        for (i = MINYEAR; i <= MAXYEAR; i++) {
            YEARNAMES.push(i);
        }


        var MODE_1 = {
            title: 'Metro Comparison for Home Prices',
            yAxis: 'Median Home Price ($)',
            key: 'MedPrice_IA',
            format: "${value:,.0f}",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>${point.y:,.0f}</b></td></tr>'
        };
        var MODE_2 = {
            title: 'Metro Comparison for Percent Change in Home Prices',
            yAxis: 'Change in Median House Price since 1997 (%)',
            key: PERCENT_KEY,
            format: "{value:,.0f}%",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>'
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
            }

            return this.value;
        }

        function getSeries() {
            var series = [];
            var dataByMetro = _.groupBy(metroData, METRO_NAME_KEY);
            _.each(dataByMetro, function(data, name) {
                series.push({
                    name:  name,
                    data: _.pluck(data, mode.key)
                });
            });

            return series;
        }


        function chart() {
            var series = getSeries();

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
                    text: mode.title
                },
                xAxis: {
                    categories: dates,
                    tickmarkPlacement: 'on',
                    minTickInterval: 2,
                    labels: {
                        step: 12,
                        maxStaggerLines: 1,
                        staggerLines: 1
                    },
                    title: {
                        text: 'Year'
                    }
                },
                yAxis: {
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
                    enabled: true,
                    symbolWidth: 30
                },
                plotOptions: {
                },
                tooltip: tooltip,
                series: series
            };


            $(CHART_ID).highcharts(options);
        }


        function setup() {
            chart();

            $('#ec-c-median-prices').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                mode = MODE_1;
                chart();

                $(this).display();
            });
            $('#ec-c-home-price-growth').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                mode = MODE_2;
                chart();

                $(this).display();
            });
        }


        function round(n) {
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
                 d[i][MODE_1.key] = round(d[i][MODE_1.key]);
                 d[i][MODE_2.key] = percent(d[i][MODE_2.key]);
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(metro) {
            metroData = setupNumbers(metro);

            // Set up the date labels
            dates = [];
            _.each(metroData, function(d) {
                // if (d.Month === 1) {
                //     dates.push(d.Year);
                // } else {
                //
                // }
                dates.push(d.Month + '/' + d.Year);

            });
            dates = _.uniq(dates);

            // Once we have the data, set up the visualizations
            setup();
        }


        var metroPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/7/metro"
        });
        $.when(metroPromise).done(prepData);
    });
})(jQuery);
