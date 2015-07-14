/*globals
jQuery, L, cartodb, geocities, econColors, allGreen, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/
(function($) {
    /*
    Particulate Matter

    A
    Simple bar graph showing ozone concentrations for 2014. No dropdowns or
    button bar. X-axis should be ozone concentrations and Y-axis should be metro
    names (with Bay Area in bold); rank order with highest ozone at top. Hovering
    over data should show data for bar selected (example: Philadelphia: XX.X ppb).

    X-axis: Ozone Concentration (ppb)
    Metro Comparison for Ozone Concentrations

    No legend needed


    MISC

    TODO
    - LOCATION NAME in tooltip
    - Microgram symbol in legend

    REQUESTS

    */

    $(function(){
        var i;
        var data;

        var CHART_ID = '#en-c-chart';
        var CHART_BASE_TITLE = 'Metro Comparison for 2014 Ozone Concentrations';
        var Y_LABEL = 'Ozone Concentration (ppb)';

        var AVG_LABEL = '';
        var FOCUS_KEY = 'Ozone_Max4_Daily_8HR_ppb_Annual_3YR_Standard_Actual';

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
            yAxis: 'Ozone Concentration (ppb)',
            format: "{value:,.1f}",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{point.category}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f} ppb</b></td></tr>',
            getSeries: function() {
                var series = [{
                    name: 'Ozone Concentration',
                    data: _.pluck(data, FOCUS_KEY)
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
            console.log("Mode", activeMode);

            $(CHART_ID).highcharts({
                chart: {
                    type: 'bar'
                },
                title: {
                    text: CHART_BASE_TITLE
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
                colors: allGreen,
                plotOptions: {
                },
                tooltip: tooltip,
                series: activeMode.getSeries()
            });
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

            data = _.sortBy(data, FOCUS_KEY).reverse();

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
            url: "http://vitalsigns-production.elasticbeanstalk.com/en/2/metro"
        });


        $.when(dataPromise).done(prepData);
    });
})(jQuery);
