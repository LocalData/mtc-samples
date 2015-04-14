/*globals jQuery, L, cartodb, geocities, allYellow, altColors, Highcharts, science: true */
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
            } else {
                return this.value;
            }
        }


        function quadrants() {
            var chart = this;

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


        function graph(series) {
            var tooltip = {
                useHTML: true,
                formatter: function() {
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

            var options = {
                chart: {
                    type: 'bubble',
                    zoomType: 'xy',
                    height: 500,
                    events: {
                        // load: quadrants
                    }
                },
                plotOptions: {
                    bubble: {
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
                console.log("Using new min", options.plotOptions.bubble);
            }

            $(CHART_ID).highcharts(options);
        }

        function getSeries(rawData) {
            var series = [];

            // If we want quadrants with a background color:
            // series.push({
            //     name: 'Q1',
            //     type: 'polygon',
            //     data: [[-80,1], [-80, 2.5], [0, 2.5], [0, 1]],
            //     color: Highcharts.Color(COLORS[1]).setOpacity(0.5).get(),
            //     enableMouseTracking: false,
            //     showInLegend: false,
            //     animation: false
            // });
            // series.push({
            //     name: 'Q2',
            //     type: 'polygon',
            //     data: [[0, 1], [0, 2.5], [200, 2.5], [200, 1]],
            //     color: Highcharts.Color(COLORS[2]).setOpacity(0.5).get(),
            //     enableMouseTracking: false,
            //     showInLegend: false,
            //     animation: false
            // });
            // series.push({
            //     name: 'Q3',
            //     type: 'polygon',
            //     data: [[0, 1], [0, 0], [200, 0], [200, 1]],
            //     color: Highcharts.Color(COLORS[3]).setOpacity(0.5).get(),
            //     enableMouseTracking: false,
            //     showInLegend: false,
            //     animation: false
            // });
            // series.push({
            //     name: 'Q4',
            //     type: 'polygon',
            //     data: [[0, 1], [0, 0], [-80, 0], [-80, 1]],
            //     color: Highcharts.Color(COLORS[4]).setOpacity(0.5).get(),
            //     enableMouseTracking: false,
            //     showInLegend: false,
            //     animation: false
            // });

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
                    color: Highcharts.Color(d.color).setOpacity(0.6).get(),
                    marker: {
                        lineColor: Highcharts.Color(d.color).setOpacity(1).get(),
                        lineWidth: 2
                    }
                });

            });

            _.each(rawData, function(d) {
            });

            return series;
        }

        function selectLocation(e) {
            if (!e) {
                selectedGeography = null;
                graph(getSeries(regionData));
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
                graph(getSeries(regionData));
                return;
            }

            var selectedCountyData = _.filter(countyData, {'County': county});

            graph(getSeries(selectedCountyData, county));
        }

        function setupECB() {
            graph(getSeries(regionData, 'Regional'));

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
