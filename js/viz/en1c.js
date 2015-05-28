/*globals
jQuery, L, cartodb, geocities, econColors, allBlue, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/
(function($) {
    /*
    Particulate Matter

    A
    Simple bar graph showing fine particulate concentrations for 2014.
    Button bar should allow user to switch between "Annual Average" and
    "98th Percentile Day". X-axis should be particulate matter concentrations
    and Y-axis should be metro names (with Bay Area in bold); rank order with
    highest PM at top for each mode. Hovering over data should show data for
    bar selected (example: Philadelphia: XX.X μg/m3).

    X-axis: Fine Particulate Concentration (μg/m3)

    Metro Comparison for Particulate Matter Concentrations

    No legend needed


    MISC

    TODO
    - Microgram symbol in legend if possible

    REQUESTS

    */

    $(function(){
        var i;
        var data;

        var CHART_ID = '#en-c-chart';
        var CHART_BASE_TITLE = ' Metro Comparison for Particulate Matter Concentrations';
        var Y_LABEL = 'Fine Particulate Concentration (microgams/m3)';
        var AVG_LABEL = 'Annual Average Fine Particulates';
        var TOP_LABEL = '98th Percentile Day Fine Particulates';
        var AVG_KEY = 'PM2#5_AnnualAvg_ugm3_Actual';
        var TOP_KEY = 'PM2#5_daily98percentile_ugm3_Actual';

        var GEOGRAPHY_KEY = 'Geography';

        var YEAR_KEY = 'Year';
        var minYear;
        var maxYear;
        var yearNames = [];
        var DASH_FORMAT = 'ShortDash';

        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });

        var MODE_ANNUAL = {
            title: AVG_LABEL,
            key: AVG_KEY,
            yAxis: 'Fine Particulate Concentration (micrograms/m3)',
            format: "{value:,.1f}",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{point.category}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f} &mu;g/m3</b></td></tr>',
            getSeries: function() {
                var series = [{
                    name: 'Particulate Matter Concentrations',
                    data: _.pluck(data, AVG_KEY)
                }];
                return series;
            }
        };
        var MODE_TOP = {
            title: TOP_LABEL,
            key: TOP_KEY,
            yAxis: 'Fine Particulate Concentration (micrograms/m3)',
            format: "{value:,.1f}",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{point.category}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f} &mu;g/m3</b></td></tr>',
            getSeries: function() {
                var series = [{
                    name: 'Particulate Matter Concentrations',
                    data: _.pluck(data, TOP_KEY)
                }];
                return series;
            }
        };

        var activeMode = MODE_ANNUAL;


        function formatter() {
            if (this.value === 'Bay Area') {
                return '<span style="font-weight:800;color:#000;">' + this.value + '</span>';
            }
            return this.value;
        }


        function chart() {
           var tooltip = {
                headerFormat: '<span style="font-size:10px">{series.name}</span><table>',
                pointFormat: activeMode.pointFormat,
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            };

            data = _.sortBy(data, activeMode.key).reverse();

            $(CHART_ID).highcharts({
                chart: {
                    type: 'bar'
                },
                title: {
                    text: activeMode.title
                },
                xAxis: {
                    categories: _.uniq(_.pluck(data, GEOGRAPHY_KEY)),
                    labels: {
                        formatter: formatter
                    },
                    tickmarkPlacement: 'on'
                },
                yAxis: {
                    title: {
                        text: activeMode.yAxis
                    },
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
                series: activeMode.getSeries()
            });
        }


        function setup() {
            chart();

            $('#en-c-annual').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                activeMode = MODE_ANNUAL;
                chart();

                $(this).display();
            });
            $('#en-c-top').click(function(){
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
            url: "http://vitalsigns-production.elasticbeanstalk.com/en/1/metro"
        });


        $.when(dataPromise).done(prepData);
    });
})(jQuery);
