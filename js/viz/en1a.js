/*globals
jQuery, L, cartodb, geocities, econColors, allGreen, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/
(function($) {
    /*
    Particulate Matter

    A
    Simple line graph showing annual average and 98th percentile day trends for
    fine particulates (refer to slide deck for example). No button bar or
    drop-down menus needed. X-axis should be years and Y-axis should be fine
    particulate concentrations. When hovering over line graph, it should display
    the two data points for the given year - for example: "Annual Average: XX.X
    μg/m3   98th Percentile Day: YY.Y μg/m3". Legend should show the two line
    colors with appropriate labels.

    Y-axis: Fine Particulate Concentration (μg/m3)

    Historical Trend for Particulate Matter Concentrations - Bay Area

    Line color for each series: Annual Average Fine Particulates,
    98th Percentile Day Fine Particulates
    3-year average (Ozone_Max4_Daily_8HR_ppb_Annual_3YR,)


    MISC

    TODO
    - Add 3-year aveage
    - Check legend titles

    REQUESTS

    */

    $(function(){
        var i;
        var data;

        var CHART_ID = '#en-a-chart';
        var CHART_BASE_TITLE = 'Historical Trend for Particulate Matter Concentrations - Bay Area';
        var Y_LABEL = 'Fine Particulate Concentration (&#181;g/m<sup>3</sup>)';

        var AVG_LABEL = 'Annual Average Fine Particulates';
        var TOP_LABEL = '98th Percentile Daily Fine Particulates';

        var YEAR_KEY = 'Year';
        var minYear;
        var maxYear;
        var yearNames = [];
        var STRONG_WIDTH = 3;

        var MODE_ANNUAL = {
            title: CHART_BASE_TITLE,
            getSeries: function() {
                var series = [{
                    name: 'Annual Average',
                    data: _.pluck(data, 'PM2#5_AnnualAvg_ugm3_1YR')
                }, {
                    name: '3-Year Average',
                    data: _.pluck(data, 'PM2#5_AnnualAvg_ugm3_3YR'),
                    lineWidth: STRONG_WIDTH
                }, {
                    name: 'Worst Location',
                    data: _.pluck(data, 'PM2#5_AnnualAvg_ugm3_WorstLocation_3YR'),
                    lineWidth: STRONG_WIDTH
                }];

                return series;
            }
        };

        var MODE_TOP = {
            title: CHART_BASE_TITLE,
            getSeries: function() {
                var series = [{
                    name: 'Annual Average',
                    data: _.pluck(data, 'PM2#5_daily98percentile_ugm3_1YR')
                }, {
                    name: '3-Year Average',
                    data: _.pluck(data, 'PM2#5_daily98percentile_ugm3_3YR'),
                    lineWidth: STRONG_WIDTH
                }, {
                    name: 'Worst Location',
                    data: _.pluck(data, 'PM2#5_daily98percentile_ugm3_WorstLocation_3YR'),
                    lineWidth: STRONG_WIDTH
                }];

                return series;
            }
        };

        var activeMode = MODE_ANNUAL;


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


        function chart() {
            var series = activeMode.getSeries();

            var tooltip = {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f} &#181;g/m<sup>3</sup></b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            };

            var options = {
                chart: {
                    type: 'line'
                },
                title: {
                    text: activeMode.title
                },
                xAxis: {
                    categories: yearNames,
                    tickmarkPlacement: 'on'
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: Y_LABEL,
                        useHTML: true
                    },
                    reversedStacks: true,
                    stackLabels: {
                        enabled: false
                    }
                },
                legend: {
                    enabled: true,
                    symbolWidth: 30
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

            $('#en-a-annual').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                activeMode = MODE_ANNUAL;
                chart();

                $(this).display();
            });
            $('#en-a-top').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                activeMode = MODE_TOP;
                chart();

                $(this).display();
            });

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


        // Get the data ready to visualize
        function prepData(rawData) {
            data = rawData;

            var years = _.pluck(data, YEAR_KEY);
            maxYear = _.max(years);
            minYear = _.min(years);
            for (i = minYear; i <= maxYear; i++) {
                yearNames.push(i);
            }

            // Once we have the data, set up the visualizations
            setup();
        }


        var dataPromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/en/1/region"
        });


        $.when(dataPromise).done(prepData);
    });
})(jQuery);
