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
        var CHART_BASE_TITLE = ' Historical Trend for Particulate Matter Concentrations - Bay Area';
        var Y_LABEL = 'Fine Particulate Concentration (microgams/m3)';

        var AVG_LABEL = 'Annual Average Fine Particulates';
        var AVG_KEY = 'PM2#5_AnnualAvg_ugm3_1YR';

        var TOP_LABEL = '98th Percentile Day Fine Particulates';
        var TOP_KEY = 'PM2#5_daily98percentile_ugm3_1YR';

        var YEAR_KEY = 'Year';
        var minYear;
        var maxYear;
        var yearNames = [];
        var DASH_FORMAT = 'ShortDash';
        var LONG_DASH = 'LongDash';

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
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f} &mu;g/m3</b></td></tr>',
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
                    categories: yearNames,
                    tickmarkPlacement: 'on'
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: Y_LABEL
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
                colors: allGreen,
                plotOptions: {
                },
                tooltip: tooltip,
                series: series
            };

            $(CHART_ID).highcharts(options);
        }


        function getSeries() {
            var series = [{
                name: AVG_LABEL,
                data: _.pluck(data, AVG_KEY)
            }, {
                name: TOP_LABEL,
                data: _.pluck(data, TOP_KEY),
                dashStyle: DASH_FORMAT
            }];
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
