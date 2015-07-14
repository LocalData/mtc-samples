/*globals
jQuery, L, cartodb, geocities, allGreen, altColors, Highcharts, science,
regionPromise, countyPromise, cityPromise: true
*/
(function($) {
    /*
    Greenhouse gas emissions (from fuel sales)

    A
    Bar graph with button bar allowing user to choose between GHG and GHG Per
    Capita (default to per-capita mode) - chart displays emissions by county for
    year 2012. When in total mode, should show stacked bar graph breaking apart
    the metric tons of emissions from gasoline versus diesel. When hovering
    over a bar, should show the tons of each, the total, and then the share
    of regional GHG emissions that county is producing. Graph should be sorted
    by largest to smallest GHG emissions and legend should detail what the
    stacked bar colors mean (gasoline, diesel). When in per-capita mode, the
    graph should re-sort based on which county has the lowest PC emissions at
    the top and highest at bottom. No legend should be shown and the hover box
    should simply show "Per-Capita GHG Emissions: X.X metric tons per year".

    Background shading should indicate counties with below-average GHG (San
    Francisco and Alameda) and counties with above-average (all others).

    X-axis: Greenhouse Gas Emissions from County Fuel Sales (metric tons)
    OR Per-Capita Greenhouse Gas Emissions from County Fuel Sales (metric tons)

    Title
    2012 Greenhouse Gas Emissions from Fuel Sales by County
    OR 2012 Per-Capita Greenhouse Gas Emissions from Fuel Sales by County

    Should show swatch of color and type of fuel (Gasoline/Diesel) in total
    mode; in per-capita mode, no legend needed

    MISC

    TODO

    REQUESTS

    */

    $(function(){
        var i;
        var countyData;

        var CHART_BASE_TITLE = 'Historical Trend for Fatalities from Crashes';
        var CHART_ID = '#en-a-chart';

        var DASH_FORMAT = 'ShortDash';

        var GEO_KEY = 'Geography';
        var GAS_KEY = 'GHG_Gasoline_metrictons';
        var DIESEL_KEY = 'GHG_Diesel_metrictons';
        var TOTAL_KEY = 'GHG_Total_metrictons';
        var SHARE_KEY = 'Share_BA_GHG';
        var PER_CAPITA_KEY = 'GHG_Total_percapita_metrictons';

        // Average per-capita GHG emissions:
        var PER_CAPITA_AVERAGE = 3.2;


        allGreen[0] = allGreen[3]; // add a little more contrast

        var minYear, maxYear;
        var yearNames = [];


        var MODE_TOTALS = {
            title: '2012 Greenhouse Gas Emissions from Fuel Sales by County',
            yAxis: 'Greenhouse Gas Emissions from County Fuel Sales (metric tons)',
            yMin: 0,
            format: "{value:,.0f}",
            formatter: function() {
                var s = '<table>';
                s += '<span style="font-size:10px">' + this.x + '</span>';

                _.each(this.points, function(p) {
                    s += '<tr><td style="color:' + p.series.color + ';padding:0">';
                    s += p.series.name + ': </td>';
                    s += '<td style="padding:0"><b>' + p.y.toLocaleString() + ' metric tons</b></td></tr>';
                });

                // Then add total and share of regional emissions
                s += '<tr><td style="padding:0">Total GHG Emissions: </td>';
                s += '<td style="padding:0"><b>' + this.points[0].point[TOTAL_KEY].toLocaleString() + ' metric tons</b></td></tr>';

                s += '<tr><td style="padding:0">Share of Regional GHG Emissions: </td>';
                s += '<td style="padding:0"><b>' + this.points[0].point[SHARE_KEY].toFixed(1) + '%</b></td></tr>';

                s += '</table>';

                return s;
            },
            getSeries: function() {
                var gasData = [];
                var dieselData = [];

                // Sort by total value
                countyData = _.sortBy(countyData, TOTAL_KEY);
                countyData.reverse();

                _.each(countyData, function(d) {
                    d.y = d[GAS_KEY];
                    gasData.push(d);

                    d = _.clone(d);
                    d.y = d[DIESEL_KEY];
                    dieselData.push(d);
                });

                var series = [{
                    name: 'GHG Emissions from Gasoline',
                    data: gasData
                }, {
                    name: 'GHG Emissions from Diesel',
                    data: dieselData
                }];

                return series;
            },
            getCategories: function() {
                countyData = _.sortBy(countyData, TOTAL_KEY);
                countyData.reverse();
                return _.pluck(countyData, GEO_KEY);
            },
            legend: true
        };
        var MODE_PER_CAPITA = {
            title: '2012 Per-Capita Greenhouse Gas Emissions from Fuel Sales by County',
            yAxis: 'Per-Capita Greenhouse Gas Emissions from County Fuel Sales (metric tons)',
            format: "{value:,.1f}",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{point.category}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f}</b> metric tons</td></tr>',
            getSeries: function() {
                // Sort by per-capita key
                countyData = _.sortBy(countyData, PER_CAPITA_KEY);
                countyData.reverse();

                var series = [{
                    name: '',
                    data: _.pluck(countyData, PER_CAPITA_KEY)
                }];
                return series;
            },
            plotLines: [{
                color: allGreen[3],
                label: {
                    text: 'Average Regional Per-Capita GHG Emissions: 3.2 metric tons',
                    align: 'center',
                    verticalAlign: 'top',
                    rotation: 0,
                    y: -5,
                    style: {
                        color: allGreen[3]
                    }
                },
                value: PER_CAPITA_AVERAGE,
                width: 1.5
            }],
            plotBands: [{ // Light air
                from: 6.5,
                to: 10,
                color: 'rgba(86, 94, 52, 0.1)',
                zIndex: 1,
                label: {
                    text: 'At or below regional average',
                    align: 'right',
                    useHTML: true,
                    style: {
                        color: '#606060',
                        paddingRight: '20px'
                    }
                }
            }, {
                from: -1,
                to: 6.5,
                color: 'rgba(0, 0, 0, 0)',
                zIndex: 1,
                label: {
                    text: 'Above average emissions',
                    align: 'right',
                    useHTML: true,
                    style: {
                        color: '#606060',
                        paddingRight: '20px',
                        paddingTop: '12px'
                    }
                }
            }
            ],
            getCategories: function() {
                countyData = _.sortBy(countyData, PER_CAPITA_KEY);
                countyData.reverse();
                return _.pluck(countyData, GEO_KEY);
            },
            legend: false
        };


        var selectedGeography = {};
        var mode = MODE_PER_CAPITA;

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
            var tooltip = {
                headerFormat: '<span style="font-size:10px">Per-Capita Greenhouse Gas Emissions</span><table>',
                pointFormat: mode.pointFormat,
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            };

            if (mode.formatter) {
                tooltip.formatter = mode.formatter;
            }

            var options = {
                chart: {
                    type: 'bar'
                },
                title: {
                    text: mode.title,
                    margin: 25
                },
                xAxis: {
                    categories: mode.getCategories(),
                    tickmarkPlacement: 'on',
                    title: {
                        enabled: false,
                        text: 'County'
                    }
                },
                yAxis: {
                    title: {
                        text: mode.yAxis
                    },
                    labels: {
                        step: 3,
                        format: mode.format
                    },
                    reversedStacks: false,
                    stackLabels: {
                        enabled: false
                    }
                },
                legend: {
                    enabled: mode.legend,
                    symbolWidth: 30
                },
                colors: allGreen,
                plotOptions: {
                    series: {
                        stacking: true
                    }
                },
                tooltip: tooltip,
                series: mode.getSeries()
            };

            if (_.has(mode, 'yMin')) {
                options.yAxis.min = mode.yMin;
            }

            if (_.has(mode, 'plotBands')) {
                options.xAxis.plotBands = mode.plotBands;
            }

            if (_.has(mode, 'plotLines')) {
                options.yAxis.plotLines = mode.plotLines;
            }

            // Don't explicitly set step size on smaller screens
            if (window.innerWidth < 650) {
                delete options.yAxis.labels.step;
            }

            $(CHART_ID).highcharts(options);
        }


        function resetCombos(mode) {
            var combo;
            combo = $("#en-a-county-select").data("kendoComboBox");
            combo.text('Select County...');
            // combo = $("#en-a-city-select").data("kendoComboBox");
            // combo.text('Select City...');
        }


        function setup() {
            chart(CHART_ID);

            $('#mode-totals').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                mode = MODE_TOTALS;
                chart();

                $(this).display();
            });
            $('#mode-per-capita').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                mode = MODE_PER_CAPITA;
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


        // Get the data ready to visualize
        function prepData(countyTotals) {
            // Set up the percents, round numbers
            var i;
            for(i = 0; i < countyTotals.length; i++) {
                 countyTotals[i][SHARE_KEY] = countyTotals[i][SHARE_KEY] * 100;
                 countyTotals[i][TOTAL_KEY] = round(countyTotals[i][TOTAL_KEY]);
                 countyTotals[i][GAS_KEY] = round(countyTotals[i][GAS_KEY]);
                 countyTotals[i][DIESEL_KEY] = round(countyTotals[i][DIESEL_KEY]);
            }

            countyData = countyTotals;

            // Once we have the data, set up the visualizations
            setup();
        }


        // Request all the data
        var countyTotalsPromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/en/3/county"
        });


        $.when(countyTotalsPromise).done(prepData);

    });
})(jQuery);
