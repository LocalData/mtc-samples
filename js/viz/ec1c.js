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

    var CHART_ID = '#ec-c-chart';
    var CHART_TITLE = '2013 Industry Specialization Breakdown';
    var X_LABEL ='Percent Change in Employment (1990-2013) <br> Bubble size indicates number of jobs';
    var X_KEY = 'PercntChng_1990';
    var Y_LABEL = 'Location Quotient';
    var Y_KEY = 'LQ';
    var Z_MAX = 190200; // Largest value from the data, for sizing
    var SIZE_KEY = 'Jobs';

    var INDUSTRIES = [
        'Educational & Health Services',
        'Farm',
        'Financial Activities',
        'Government',
        'Information',
        'Leisure & Hospitality',
        'Manufacturing',
        'Mining, Logging &Construction',
        'Other',
        'Professional & Business Services',
        'Trade, Transportation & Utilities'
    ];


    var COUNTY_KEY = 'County';

    var COLORS = {
        1: '#e16556',
        2: '#b7d25c',
        3: '#f5d36b',
        4: '#f59758'
    };

    var regionData, countyData;
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


        function quadrants(chart) {
            //Calculate the quadrant coordinates; toPixels uses point values
            var x0 = chart.xAxis[0].toPixels(0, false);
            var x1 = chart.xAxis[0].toPixels(50, false);
            var x2 = chart.xAxis[0].toPixels(100, false);

            //The y axis coordinates return values from TOP LEFT origin (opposite order)
            var y0 = chart.yAxis[0].toPixels(100, false);
            var y1 = chart.yAxis[0].toPixels(50, false);
            var y2 = chart.yAxis[0].toPixels(0, false);

            //Draw the quadrants
            chart.renderer.rect(x0, y1, x1 - x0, y2 - y1, 1).attr({ fill: 'lightblue', zIndex: 0 }).add();
            chart.renderer.rect(x0, y0, x1 - x0, y1 - y0, 1).attr({ fill: 'lightyellow', zIndex: 0 }).add();
            chart.renderer.rect(x1, y0, x2 - x1, y1 - y0, 1).attr({ fill: 'lightblue', zIndex: 0 }).add();
            chart.renderer.rect(x1, y1, x2 - x1, y2 - y1, 1).attr({ fill: 'lightyellow', zIndex: 0 }).add();
        }


        function addLabels(chart, isNapa) {
            var text, textBBox, x, y;

            console.log("Add labels for chart?", chart);

            // Add labels for all the quadrants
            text = chart.renderer.text(
                '<strong>Declining</strong> industries<br><strong>strong</strong> concentration',
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
                '<strong>Growing</strong> industries<br><strong>strong</strong> concentration'
            )
            .css({
                color: COLORS[2]
            }).add();

            textBBox = text.getBBox();
            x = chart.xAxis[0].toPixels(200) - (textBBox.width + 5);
            y = chart.plotTop  + 15;
            console.log(x, y);
            text.attr({
                x: x,
                y: y,
                zIndex: 5
            });


            // Quadrant 3
            text = chart.renderer.text(
                '<strong>Growing</strong> industries<br><strong>weak</strong> concentration'
            )
            .css({
                color: COLORS[3]
            }).add();

            textBBox = text.getBBox();
            x = chart.xAxis[0].toPixels(200) - (textBBox.width + 5);
            y = chart.yAxis[0].toPixels(0) - (textBBox.height - 5);
            console.log(x, y);
            text.attr({
                x: x,
                y: y,
                zIndex: 5
            });


            // Quadrant 4
            text = chart.renderer.text(
                '<strong>Declining</strong> industries<br><strong>weak</strong> concentration',
                chart.plotLeft + 15,
                chart.plotTop + 15
            )
            .css({
                color: COLORS[4]
            }).add();

            textBBox = text.getBBox();
            x = chart.plotLeft + 5;
            y = chart.yAxis[0].toPixels(0) - (textBBox.height - 5);
            console.log(x, y);
            text.attr({
                x: x,
                y: y,
                zIndex: 5
            });



            // Add the napa label
            // LQ 12
            // Jobs 5000
            // PercntChng_1990 0.47
            if (isNapa) {
                text = chart.renderer.text('<strong style="color:#b7d25c">Farming</strong><br>% Change in Employment: 47.1%<br>Location Quotient: 12<br>Jobs: 5,000').add();
                textBBox = text.getBBox();
                x = chart.xAxis[0].toPixels(47);
                y = chart.plotTop + 15;
                console.log(x, y);
                text.attr({
                    x: x,
                    y: y,
                    zIndex: 5
                });

                // Future: arrow
                // chart.renderer.path(['M', 250, 110, 'L', 250, 185, 'L', 245, 180, 'M', 250, 185, 'L', 255, 180])
                //     .attr({
                //         'stroke-width': 2,
                //         stroke: COLORS[2]
                //     })
                //     .add();
            }
        }


        function chart(series, isNapa) {
            var tooltip = {
                useHTML: true,
                formatter: function() {
                    console.log("Tooltip!");
                    var s = '<strong style="colorDisabled:' + this.series.color + ';">' + this.series.name + ':</strong>';
                    s += '<table><tr><td><strong>% Change in Employment</strong></td>';
                    s += '<td>' + this.point.x.toFixed(1) + '%</td></tr>';

                    s += '<tr><td><strong>' + Y_LABEL + '</strong></td>';
                    s += '<td>' + this.point.y.toFixed(1) + '</td></tr>';


                    s += '<tr><td><strong>' + SIZE_KEY + '</strong></td>';
                    s += '<td>' + this.point.z.toLocaleString() + '</td></tr>';

                    s += '</table>';

                    return s;
                }
            };

            console.log("Charting bubbles", series);

            series = _.sortBy(series, function(s) {
                if (s.quadrant === 1) {
                    return 5;
                }
                return s.quadrant;
            });

            var options = {
                chart: {
                    type: 'bubble',
                    zoomType: 'xy',
                    height: 500,
                    ignoreHiddenSeries: false,
                    events: {
                        // load: quadrants
                    }
                },
                plotOptions: {
                    bubble: {
                        // events: {
                        //     legendItemClick: function () {
                        //         // Disable clicks on the legend
                        //         return false;
                        //     }
                        // }
                    }
                },
                title: {
                    text: CHART_TITLE
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'top',
                    x: 0,
                    y: 35,
                    itemMarginBottom: 5
                },
                xAxis: {
                    min: -80,
                    max: 200,
                    title: {
                        text: X_LABEL
                    },
                    gridLineWidth: 1,
                    labels: {
                        format: '{value}%'
                    },
                    plotLines: [{
                        width: 1,
                        value: 0,
                        zIndex: 3,
                        color: '#6b7078'
                    }]
                },
                yAxis: {
                    min: 0,
                    max: 2.5,
                    title: {
                        text: Y_LABEL
                    },
                    plotLines: [{
                        width: 1,
                        value: 1,
                        zIndex: 3,
                        color: '#6b7078'
                    }]
                },
                colors: altColors,
                tooltip: tooltip,
                series: series
            };

            if (selectedGeography) {
                options.title.text += ' - ' + selectedGeography;
            }

            if (selectedGeography !== 'Bay Area') {
                options.plotOptions.bubble.zMax = Z_MAX;
            } else {
                options.plotOptions.bubble.zMax = Z_MAX * 2;
            }

            $(CHART_ID).highcharts(options, function(chart) {
                // After loading, show labels if this is Napa
                addLabels(chart, isNapa);
            });
        }

        function getSeries(rawData) {
            var series = [];

            // If we want quadrants with a background color:
            series.push({
                name: 'Q1',
                type: 'polygon',
                data: [[-80,1], [-80, 2.5], [0, 2.5], [0, 1]],
                color: Highcharts.Color(COLORS[1]).setOpacity(0.1).get(),
                enableMouseTracking: false,
                showInLegend: false,
                animation: false
            });
            series.push({
                name: 'Q2',
                type: 'polygon',
                data: [[0, 1], [0, 2.5], [200, 2.5], [200, 1]],
                color: Highcharts.Color(COLORS[2]).setOpacity(0.1).get(),
                enableMouseTracking: false,
                showInLegend: false,
                animation: false
            });
            series.push({
                name: 'Q3',
                type: 'polygon',
                data: [[0, 1], [0, 0], [200, 0], [200, 1]],
                color: Highcharts.Color(COLORS[3]).setOpacity(0.1).get(),
                enableMouseTracking: false,
                showInLegend: false,
                animation: false
            });
            series.push({
                name: 'Q4',
                type: 'polygon',
                data: [[0, 1], [0, 0], [-80, 0], [-80, 1]],
                color: Highcharts.Color(COLORS[4]).setOpacity(0.1).get(),
                enableMouseTracking: false,
                showInLegend: false,
                animation: false
            });

            // Then add the data on top
            _.each(INDUSTRIES, function(industry) {
                var d = _.find(rawData, { Industry: industry });

                // Bay area doesn't have farm data
                if (!d) {
                    return;
                }

                series.push({
                    name: d.Industry,
                    data: [[
                        d[X_KEY],
                        d[Y_KEY],
                        d[SIZE_KEY]
                    ]],
                    quadrant: d.Quadrant,
                    color: Highcharts.Color(d.color).setOpacity(0.6).get(),
                    marker: {
                        lineColor: Highcharts.Color(d.color).setOpacity(1).get(),
                        lineWidth: 2
                    },
                    zIndex: 30
                });

            });

            _.each(rawData, function(d) {
            });

            return series;
        }

        function selectLocation(e) {
            if (!e) {
                selectedGeography = null;
                chart(getSeries(regionData));
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
                chart(getSeries(regionData));
                return;
            }

            var selectedCountyData = _.filter(countyData, {'County': county});

            var isNapa = (county === 'Napa County');

            chart(getSeries(selectedCountyData, county), isNapa);
        }

        function setupECB() {
            chart(getSeries(regionData, 'Regional'));

            // Set up select boxes for county / city search
            // Could potentially use a cascading combo box:
            // http://demos.telerik.com/kendo-ui/combobox/cascadingcombobox
            var counties =  [{ County: 'Bay Area' }].concat(_.uniq(countyData, COUNTY_KEY));
            $("#ec-c-county-select").kendoComboBox({
                text: "Select County...",
                dataTextField: COUNTY_KEY,
                dataValueField: COUNTY_KEY,
                dataSource: counties,
                select: selectLocation
            });

            var ecCountySelect = $("#ec-c-county-select").data("kendoComboBox");
        }


        function percent(n) {
            return n * 100;
        }


        function setupCounties(d) {
            var i, j;
            for(i = 0; i < d.length; i++) {
                d[i][COUNTY_KEY] = d[i][COUNTY_KEY] + ' County';

                // Find the largest industry value
                // Used for creating relative sizing for the bubbles across counties.
                for(j=0; j < INDUSTRIES.length; j++) {
                    if (d[i][INDUSTRIES[j]] > Z_MAX) {
                        Z_MAX = d[i][INDUSTRIES[j]];
                    }
                }
            }
            return d;
        }


        function setupNumbers(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                d[i][X_KEY] = percent(d[i][X_KEY]);
                d[i].color = COLORS[d[i].Quadrant];
            }
            return d;
        }

        // Get the data ready to visualize
        function prepData(region, county) {
            regionData = setupNumbers(region[0]);
            countyData = setupNumbers(setupCounties(county[0]));

            // Once we have the data, set up the visualizations
            setupECB();
        }

        // Request all the data
        var regionPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/1/LQ/region"
        });
        var countyPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/1/LQ/county"
        });


        $.when(regionPromise, countyPromise).done(prepData);
    });
})(jQuery);
