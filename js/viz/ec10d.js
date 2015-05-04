/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science,
regionPromise, countyPromise, cityPromise: true
*/
(function($) {
    /*
    Affordability

    D
    100% stacked bar graph of metros' housing affordability in 2013 with the
    most burdened (>35%) metros in rank order at top (LA, Miami, etc.) - no
    need to show prior years' data. X-axis is share of population and Y-axis
    is metros (Bay Area name in bold). Bar chunks should be the three categories
    of housing costs (>35%, 20-34%, and <20% of income). Hovering over a bar
    should show the breakdown for that metro area for all three chunks. No
    button bar or dropdown menu.

    X-axis: Share of Population

    Metro Comparison for Housing Affordability

    MISC

    TODO

    REQUESTS

    */

    $(function(){
        var i;
        var metroData;

        var CHART_BASE_TITLE = 'Metro Comparison for Housing Affordability';
        var CHART_ID = '#ec-d-chart';
        var FOCUS_YEAR = 2013;
        var COUNTY_KEY = 'Geography';
        var HOUSEHOLD_KEY = 'Household_Type';
        var YAXIS_LABEL = 'Share of Population'; //'Share of Income Spent on Housing';
        var XAXIS_LABEL = '';
        var categories = [];

        // Get the colors in a more natural order
        // (higher share = red)
        var colors = _.clone(altColors, true);
        var COLORS = [colors[2], colors[1], colors[0]];


        var FOCUS_KEY = 'H_Share_morethan35percent';

        var FOCUS_FIELDS = [{
            name: 'Less than 20% of income',
            key: 'H_Share_lessthan20percent'
        },{
            name: '20% to 34% of income',
            key: 'H_Share_20to34percent'
        },{
            name: 'At least 35% of income',
            key: 'H_Share_morethan35percent'
        }];

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

            _.each(FOCUS_FIELDS, function(field) {
                series.push({
                    name: field.name,
                    data: _.pluck(metroData, field.key)
                });
            });

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
                    type: 'bar'
                },
                title: {
                    text: title
                },
                xAxis: {
                    categories: _.uniq(_.pluck(metroData, 'Metro')),
                    tickmarkPlacement: 'on',
                    labels: {
                        formatter: formatter
                    },
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
                    reversedStacks: false,
                    stackLabels: {
                        enabled: false
                    }
                },
                legend: {
                    enabled: true
                },
                colors: COLORS,
                plotOptions: {
                    series: {
                        stacking: 'percent'
                    }
                },
                tooltip: tooltip,
                series: series
            };


            $(CHART_ID).highcharts(options);
        }



        function setup() {
            chart();
        }


        function percent(n) {
            return n * 100;
        }


        function setupNumbers(d) {
            var i, j;
            for(i = 0; i < d.length; i++) {
                for (j = 0; j < FOCUS_FIELDS.length; j++) {
                    d[i][FOCUS_FIELDS[j].key] = percent(d[i][FOCUS_FIELDS[j].key]);
                }
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(metro) {
            metroData = _.filter(metro, { Year: FOCUS_YEAR });
            metroData = setupNumbers(metroData);
            metroData = _.sortBy(metroData, FOCUS_KEY).reverse();

            console.log("Using metro data", metroData);

            // Once we have the data, set up the visualizations
            setup();
        }


        var metroPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/10/metro"
        });

        $.when(metroPromise).done(prepData);
    });
})(jQuery);
