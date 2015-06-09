/*globals
jQuery, L, cartodb, geocities, econColors, allGreen, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/
(function($) {
    /*
    Fatalities

    C
    Simple bar graph showing fatalities for 2012. Button bar should allow user
    to switch between "Total Fatalities" and "Fatalities per Capita"; per-capita
    mode should be default on load. X-axis should be fatalities or fatalities per
    capita and Y-axis should be metro names (with Bay Area in bold); rank order
    with highest fatalities (or fatalities per capita) at top for each mode.
    Hovering over data should show data for bar selected (example: Philadelphia:
    YYY fatalities OR Philadelphia: XX.X per 100,000 residents).

    "http://vitalsigns-production.elasticbeanstalk.com/en/4/metro
    http://vitalsigns-production.elasticbeanstalk.com/en/5/metro
    http://vitalsigns-production.elasticbeanstalk.com/en/6/metro"

    X-axis: Fatalities OR
    X-axis: Fatalities per 100,000 Residents

    Metro Comparison for Fatalities from Crashes


    MISC

    TODO

    REQUESTS

    */

    $(function(){
        var i;

        var CHART_ID = '#en-c-chart';
        var CHART_BASE_TITLE = 'Metro Comparison for Fatalities from Crashes';

        var TOTAL_KEY = 'Total Killed';
        var RATE_KEY = 'Rate Killed Per 100k Pop';
        var PER_MILE_KEY = 'Rate of Fatalities per 100m VMT';

        var GEOGRAPHY_KEY = 'Place';

        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });

        var MODE_FATALITIES = {
            key: TOTAL_KEY,
            yAxis: 'Fatalities',
            yMin: 0,
            format: "{value:,.0f}",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{point.category}: </td>' +
                '<td style="padding:0"><b>{point.y:,.0f} fatalities</b></td></tr>',
            getSeries: function(data, name) {
                var series = [{
                    name: 'Fatalities',
                    data: _.pluck(data, TOTAL_KEY)
                }];
                return series;
            }
        };
        var MODE_PER_CAPITA = {
            key: RATE_KEY,
            yAxis: 'Fatalities per Capita',
            format: "{value:,.1f}",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{point.category}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f} per 100,000 residents</b></td></tr>',
            getSeries: function(data, name) {
                var series = [{
                    name: 'Fatalities per Capita',
                    data: _.pluck(data, RATE_KEY)
                }];
                return series;
            }
        };

        var activeMode = MODE_FATALITIES;


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

            var data = _.sortBy(activeMode.data, activeMode.key).reverse();

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
                series: activeMode.getSeries(data)
            });
        }


        function setup() {
            chart();

            $('#en-c-fatalities').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                activeMode = MODE_FATALITIES;
                chart();

                $(this).display();
            });
            $('#en-c-per-capita').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                activeMode = MODE_PER_CAPITA;
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
        function prepData(totals, rates, perMile) {
            MODE_FATALITIES.data = totals[0];
            MODE_PER_CAPITA.data = rates[0];

            // Once we have the data, set up the visualizations
            setup();
        }

        // Request all the data
        var totalsPromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/en/4/metro"
        });
        var ratePromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/en/5/metro"
        });

        $.when(totalsPromise, ratePromise).done(prepData);
    });
})(jQuery);
