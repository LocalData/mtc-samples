/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science,
regionPromise, countyPromise, cityPromise: true
*/
(function($) {
    /*
    Affordability

    C
    Clustered column graph showing the share of cost-burdened (>35% of income)
    households for each county, clustered by income bracket. User should be able
    to hover over an income bracket and see all nine counties' share of burdened
    households. X-axis is income brackets and Y-axis is share of burdened
    households. No dropdown menus or button bars.

    X-axis: Household Income
    Y-axis: Cost-Burdened Share of Households"
    2013 Housing Affordability by Income Level - Cost-Burdened Household Shares

    MISC

    TODO

    REQUESTS

    */

    $(function(){
        var i;
        var cityData, countyData, regionData;

        var CHART_BASE_TITLE = '2013 Housing Affordability by Income Level - Cost-Burdened Household Shares';
        var CHART_ID = '#ec-c-chart';
        var COUNTY_KEY = 'Geography';
        var YAXIS_LABEL = 'Cost-Burdened Share of Households'; //'Share of Income Spent on Housing';
        var XAXIS_LABEL = 'Household Income';
        var counties = {};
        var brackets = {};

        var FOCUS_FIELD = 'H_Share_morethan35percent';

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
            var series = [];

            _.each(counties, function(county) {
                var data = [];
                var dataForCounty = _.filter(countyData, { Geography: county });

                _.each(brackets, function(bracket, key) {
                    var bracketData = _.find(dataForCounty, { Income_Bracket: key });
                    data.push(bracketData[FOCUS_FIELD]);
                });

                series.push({
                    name: county,
                    data: data
                });
            });

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
                    categories: _.values(brackets),
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
                    },
                    max: 100
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
                d[i][FOCUS_FIELD] = percent(d[i][FOCUS_FIELD]);
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(county) {
            countyData = setupNumbers(county);

            // Set up labels / series
            counties = _.uniq(_.pluck(countyData, COUNTY_KEY));

            // Set up labels / series
            _.each(countyData, function(r) {
                brackets[r.Income_Bracket] = r.Income_Bracket_Label;
            });

            // Once we have the data, set up the visualizations
            setup();
        }


        var countyPromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/ec/10/countyInc"
        });
        $.when(countyPromise).done(prepData);
    });
})(jQuery);
