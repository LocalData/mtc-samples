/*globals jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science: true */
(function($) {
    /*
    Job creation

    C
    User should be able to generate each of
    those bubble charts by selecting her county from dropdown menu; by default,
    should show regional data. X-axis is job growth and Y-axis is location quotient.
    Hovering over a bubble should list the X, Y data points for that bubble.

    Bubbles should be sized based on the number of jobs.
    The color should be dictated by quadrants (see PowerPoint quadrants)
        - green for upper-right, yellow for upper-left and lower-right, and red for lower-left.

    X-axis: Percent Change in Employment (1990-2013)
    Y-axis: Location Quotient"

    2013 Industry Specialization Breakdown for "Geography

    MISC

    TODO

    REQUESTS

    */

    var i;

    var CHART_ID = '#t16-c-chart';
    var CHART_TITLE = 'Comparative Jurisdiction PCI Scores';
    var X_LABEL ='2015 PCI Score';
    var X_KEY = '3YRAverage';
    var Y_LABEL = 'Change in PCI Score Between 2005 and 2015';
    var Y_KEY = 'change';
    var Z_MAX = 2; // Largest value from the data, for sizing
    // var SIZE_KEY = 'Jobs';

    var Y_MIN = -20;
    var Y_MID = 0;
    var Y_MAX = 35;

    var X_MIN = 35;
    var X_MID = 66;
    var X_MAX = 90;

    var TOP_CITIES = [
        'San Jose',
        'San Francisco',
        'Oakland',
        'Fremont',
        'Santa Rosa',
        'Hayward',
        'Sunnyvale',
        'Concord',
        'Santa Clara',
        'Vallejo'
    ];

    var COUNTY_KEY = 'County';
    var CITY_KEY = 'Jurisdiction';

    var COLORS = {
        1: '#f5d36b',
        2: '#b7d25c', // #62a60a
        3: '#f59758', //f5d36b
        4: '#e16556' //#f59758
    };

    var cityData;
    var selectedGeography = 'Bay Area';


    $(function(){
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

        function addLabels(chart) {
            if (chart.currentTarget) {
                chart = chart.currentTarget;
            }
            var text, textBBox, x, y;

            // Add labels for all the quadrants
            text = chart.renderer.text(
                '<strong>Improving</strong> conditions<br><strong>Roughest</strong> roads',
                chart.plotLeft + 5,
                chart.plotTop + 15
            )
            .css({
                color: COLORS[1]
            })
            .attr({
                zIndex: 5
            }).add();


            // Quadrant 2
            text = chart.renderer.text(
                '<strong>Improving</strong> conditions<br><strong>Smoothest</strong> roads'
            )
            .css({
                color: COLORS[2]
            }).add();

            textBBox = text.getBBox();
            x = chart.xAxis[0].toPixels(X_MAX) - (textBBox.width + 5);
            y = chart.plotTop  + 15;
            text.attr({
                x: x,
                y: y,
                zIndex: 5
            });


            // Quadrant 3
            text = chart.renderer.text(
                '<strong>Declining</strong> conditions<br><strong>Smoothest</strong> roads'
            )
            .css({
                color: COLORS[3]
            }).add();

            textBBox = text.getBBox();
            x = chart.xAxis[0].toPixels(X_MAX) - (textBBox.width + 5);
            y = chart.yAxis[0].toPixels(Y_MIN) - (textBBox.height - 5);
            text.attr({
                x: x,
                y: y,
                zIndex: 5
            });


            // Quadrant 4
            text = chart.renderer.text(
                '<strong>Declining</strong> conditions<br><strong>Roughest</strong> roads',
                chart.plotLeft + 15,
                chart.plotTop + 15
            )
            .css({
                color: COLORS[4]
            }).add();

            textBBox = text.getBBox();
            x = chart.plotLeft + 5;
            y = chart.yAxis[0].toPixels(Y_MIN) - (textBBox.height - 5);
            text.attr({
                x: x,
                y: y,
                zIndex: 5
            });
        }


        function chart(series, chartOptions) {
            var tooltip = {
                useHTML: true,
                formatter: function() {
                    var s = '<strong style="colorDisabled:' + this.series.color + ';">' + this.series.name + '</strong>';
                    s += '<table><tr><td><strong>2015 PCI:</strong></td>';
                    s += '<td>' + this.point.x.toFixed(0) + '</td></tr>';

                    s += '<tr><td><strong>10-year change in PCI:</strong></td>';
                    s += '<td>' + this.point.y.toFixed(0) + '</td></tr>';


                    // s += '<tr><td><strong>' + SIZE_KEY + '</strong></td>';
                    // s += '<td>' + this.point.z.toLocaleString() + '</td></tr>';

                    s += '</table>';

                    return s;
                }
            };

            // If a city is selected, give it a highlight color
            console.log("Charting with", series, chartOptions);
            if (chartOptions && chartOptions.selectedCity) {
                console.log("Selected city", chartOptions.selectedCity);
                for (var i = 0; i < series.length; i++) {
                    if (series[i].name === chartOptions.selectedCity) {
                        series[i].color = Highcharts.Color(altColors[1]).setOpacity(1).get();
                        series[i].marker.lineColor = Highcharts.Color(altColors[1]).setOpacity(1).get();
                        series[i].data[0][2] = 1.005;
                    }
                }
            }

            series = _.sortBy(series, function(s) {
                if (s.quadrant === 1) {
                    return 5;
                }
                return s.quadrant;
            });

            var options = {
                chart: {
                    type: 'bubble',
                    //zoomType: 'xy',
                    height: 500,
                    ignoreHiddenSeries: false,
                    events: {
                        // TODO! Don't re-add existing labels.
                        // redraw: addLabels
                        // load: quadrants
                    }
                },
                plotOptions: {
                    bubble: {
                        animation: false,
                        dataLabels: {
                            enabled: true,
                            formatter: function() {
                                if (_.includes(TOP_CITIES, this.point.series.name)) {
                                    return this.point.series.name;
                                }

                                if (selectedGeography === this.point.series.name) {
                                    return this.point.series.name;
                                }
                            }
                        }
                        // events: {
                        //     legendItemClick: function () {
                        //         // Disable clicks on the legend
                        //         return false;
                        //     }
                        // }
                    }
                },
                title: {
                    text: ''
                },
                exporting: {
                    chartOptions: {
                        title: {
                            text: CHART_TITLE
                        }
                    }
                },
                legend: {
                    enabled: false
                },
                xAxis: {
                    min: X_MIN,
                    max: X_MAX,
                    startOnTick: false,
                    endOnTick: false,
                    title: {
                        text: X_LABEL
                    },
                    gridLineWidth: 1,
                    labels: {
                        format: '{value}'
                    }
                    // plotLines: [{ // Axis separator
                    //     width: 1,
                    //     value: 66,
                    //     zIndex: 3,
                    //     color: '#6b7078'
                    // }]
                },
                yAxis: {
                    min: Y_MIN,
                    max: Y_MAX,
                    startOnTick: false,
                    endOnTick: false,
                    title: {
                        text: Y_LABEL
                    }
                    // plotLines: [{ // Axis separator
                    //     width: 1,
                    //     value: 0,
                    //     zIndex: 3,
                    //     color: '#6b7078'
                    // }]
                },
                colors: altColors,
                tooltip: tooltip,
                series: series
            };

            // Show the label below the chart on smaller screens
            if (window.innerWidth < 650) {
                console.log("Using smaller window settings");
                delete options.legend.layout;
                delete options.legend.align;
                delete options.legend.verticalAlign;
                delete options.legend.x;
                delete options.legend.y;
            }

            if (selectedGeography) {
                options.exporting.chartOptions.title.text += ' - ' + selectedGeography;
                $('#t16-bubble .chart-title').html(CHART_TITLE + ' - ' + selectedGeography);
            } else {
                $('#t16-bubble .chart-title').html(CHART_TITLE);
            }

            if (selectedGeography !== 'Bay Area') {
                options.plotOptions.bubble.zMax = Z_MAX;
            } else {
                options.plotOptions.bubble.zMax = Z_MAX * 2;
            }

            $(CHART_ID).highcharts(options, function(chart) {
                // After loading, show labels if this is Napa
                addLabels(chart);
            });
        }

        function getSeries(rawData, cityToHighlight) {
            var series = [];

            // Set up qadrants with a background color:
            series.push({
                name: 'Q1',
                type: 'polygon',
                data: [[X_MIN, Y_MID], [X_MIN, Y_MAX], [X_MID, Y_MAX], [X_MID, Y_MID]],
                color: Highcharts.Color(COLORS[1]).setOpacity(0.1).get(),
                enableMouseTracking: false,
                showInLegend: false,
                animation: false
            });
            series.push({
                name: 'Q2',
                type: 'polygon',
                data: [[X_MID, Y_MID], [X_MID, Y_MAX], [X_MAX, Y_MAX], [X_MAX, Y_MID]],
                color: Highcharts.Color(COLORS[2]).setOpacity(0.1).get(),
                enableMouseTracking: false,
                showInLegend: false,
                animation: false
            });
            series.push({
                name: 'Q3',
                type: 'polygon',
                data: [[X_MID, Y_MID], [X_MID, Y_MIN], [X_MAX, Y_MIN], [X_MAX, Y_MID]],
                color: Highcharts.Color(COLORS[3]).setOpacity(0.1).get(),
                enableMouseTracking: false,
                showInLegend: false,
                animation: false
            });
            series.push({
                name: 'Q4',
                type: 'polygon',
                data: [[X_MID, Y_MID], [X_MID, Y_MIN], [X_MIN, Y_MIN], [X_MIN, Y_MID]],
                color: Highcharts.Color(COLORS[4]).setOpacity(0.1).get(),
                enableMouseTracking: false,
                showInLegend: false,
                animation: false
            });

            // Then add the data on top
            _.each(rawData, function(city) {

                // TODO: Fuzz overlapping values
                // http://jsfiddle.net/9m6wu/277/
                //
                series.push({
                    name: city.Jurisdiction,
                    data: [[
                        city[X_KEY],
                        city[Y_KEY],
                        1 // d[SIZE_KEY]
                    ]],
                    // quadrant: d.Quadrant,
                    color: Highcharts.Color(city.color).setOpacity(0.6).get(),
                    marker: {
                        lineColor: Highcharts.Color(city.color).setOpacity(1).get(),
                        lineWidth: 2
                    },
                    zIndex: 30
                });
            });

            return series;
        }

        function selectLocation(e) {
            if (!e) {
                selectedGeography = null;
                chart(getSeries(cityData));
                return;
            }

            // e might be an event or actual location data.
            var location;
            if (e.County) {
                location = e;
            } else {
                location = this.dataItem(e.item.index());
            }

            var county = location[COUNTY_KEY];
            selectedGeography = county;

            if (selectedGeography === 'Bay Area') {
                chart(getSeries(cityData));
                return;
            }

            if (location[CITY_KEY]) {
                selectedGeography = location[CITY_KEY]
                $("#t16-c-county-select").data("kendoComboBox").text('Select County...');
                chart(getSeries(cityData), {
                    selectedCity: location[CITY_KEY]
                });
                return;
            }

            $("#t16-c-city-select").data("kendoComboBox").text('Select City...');
            var selectedCountyData = _.filter(cityData, {'County': county});

            chart(getSeries(selectedCountyData, county));
        }

        function setup() {
            chart(getSeries(cityData, 'Regional'));

            // Set up select boxes for county / city search
            var cities = _.uniq(cityData, CITY_KEY).sort();
            var counties =  [{ County: 'Bay Area' }];
            _.each(_.uniq(cityData, COUNTY_KEY), function(county) {
                counties.push({ County: county[COUNTY_KEY] });
            });

            $("#t16-c-county-select").kendoComboBox({
                text: "Select County...",
                dataTextField: COUNTY_KEY,
                dataValueField: COUNTY_KEY,
                dataSource: counties,
                select: selectLocation,
                width: 250
            });
            // Set up select boxes for county / city search
            $("#t16-c-city-select").kendoComboBox({
                text: "Select City...",
                dataTextField: CITY_KEY,
                dataValueField: CITY_KEY,
                dataSource: cities,
                select: selectLocation
            });

            var ecCountySelect = $("#t16-c-county-select").data("kendoComboBox");
            var ecCitySelect = $("#t16-c-city-select").data("kendoComboBox");
        }


        function percent(n) {
            return n * 100;
        }


        function setupCounties(d) {
            var i, j;
            for(i = 0; i < d.length; i++) {
                d[i][COUNTY_KEY] = d[i][COUNTY_KEY] + ' County';
            }
            return d;
        }


        function setupNumbers(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                d[i].name = d[i][CITY_KEY];

                // Set up quadrants
                if (d[i][X_KEY] <= X_MID && d[i][Y_KEY] >= Y_MID) {
                    d[i].quadrant = 1;
                    d[i].color = COLORS[1];
                }
                if (d[i][X_KEY] > X_MID && d[i][Y_KEY] >= Y_MID) {
                    d[i].quadrant = 2;
                    d[i].color = COLORS[2];
                }
                if (d[i][X_KEY] > X_MID && d[i][Y_KEY] < Y_MID) {
                    d[i].quadrant = 3;
                    d[i].color = COLORS[3];
                }
                if (d[i][X_KEY] <= X_MID && d[i][Y_KEY] < Y_MID) {
                    d[i].quadrant = 4;
                    d[i].color = COLORS[4];
                }
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(city, cityDiff) {
            cityData = city[0];
            cityDiff = cityDiff[0];

            // Filter down to 2015 city data.
            cityData = _.filter(cityData, { Year: 2015 });

            // Join in the 10-year change data.
            _.each(cityData, function(city) {
                var match = _.find(cityDiff, { Jurisdiction: city.Jurisdiction });
                if (!match) {
                    console.log("No match found for", city);
                    return;
                }

                // console.log(match)

                city.change = match['3YRAverage_Change_2005_2015'];
            });

            cityData = setupNumbers(cityData);

            // Once we have the data, set up the visualizations
            setup();
        }

        // Request all the data
        var cityPromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/api/t16/city"
        });
        var cityDiffPromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/api/t16/city10"
        });


        $.when(cityPromise, cityDiffPromise).done(prepData);
    });
})(jQuery);
