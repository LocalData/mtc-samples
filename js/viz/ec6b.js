/*globals
jQuery, L, cartodb, geocities, kendo, allYellow, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/
(function($) {
    /*
    Labor force participation

    B
    100% stacked bar graph showing the region and all nine counties for a given
    year. Scroll bar allows user to select any year in the datasets, but data
    for 2013 should be shown on load. Hovering over the graph should show data
    for the age group selected for all geographies at once. X-axis should be %
    of labor force and Y-axis should be the counties and region at top (in bold).
    Other than scroll bar, no need for button bar or dropdown.

    X-axis: Share of Labor Force

    Chart title:
    Historical Distribution of Labor Force by Age Group - "Year"

    MISC

    TODO
    - Add scroll bar
    - Hovering should show all _Age_ groups

    REQUESTS

    */


    $(function(){
        var CHART_ID = '#ec-b-chart';

        var CHART_BASE_TITLE = 'Historical Distribution of Labor Force by Age Group';
        var LABOR_TOTALS = {
            'NUMLF_1619': '16-19',
            'NUMLF_2024': '20-24',
            'NUMLF_2544': '25-44',
            'NUMLF_4554': '45-54',
            'NUMLF_5564': '55-64',
            'NUMLF_65xx': '65+'
        };
        var LABOR_PERCENTS = {
            'LF_1619': '16-19',
            'LF_2024': '20-24',
            'LF_2544': '25-44',
            'LF_4554': '45-54',
            'LF_5564': '55-64',
            'LF_65xx': '65+'
        };

        var FOCUSYEAR = 2013;
        var YEARNAMES = [1980, 1990, 2000, 2010, 2013];
        var DASH_FORMAT = 'ShortDash';
        var COUNTY_KEY = 'CountyName';

        var i;
        var selectedYear = FOCUSYEAR;
        var regionData, countyData;

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


        function graph(series) {
            console.log("Graphing", series);

            var tooltip = {
                shared: false,
                formatter: function() {
                    var s = '<span style="font-size:10px">' + this.series.name + '</span><table>';
                    _.each(this.series.data, function(d) {
                        s += '<tr>';
                        s += '<td style="color:' + d.color + ';padding:0">';
                        s += d.category + ': </td><td style="padding:0"><b>';
                        s += d.percentage.toFixed(1) + '%</b></td></tr>';
                    });
                    s += '</table';
                    return s;
                },
                useHTML: true
            };

            // Set up categories
            // TODO -- this might generate more garbage than we want
            var categories = ['Bay Area'].concat(_.pluck(_.uniq(countyData, COUNTY_KEY), COUNTY_KEY));

            var options = {
                chart: {
                    type: 'bar'
                },
                title: {
                    text: CHART_BASE_TITLE
                },
                xAxis: {
                    categories: categories,
                    labels: {
                        formatter: formatter
                    },
                    title: {
                        text: ''
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Share of Labor Force'
                    },
                    reversedStacks: false,
                    stackLabels: {
                        enabled: false
                    },
                    labels: {
                        format: "{value:,.0f}%"
                    }
                },
                legend: {
                    enabled: true
                },
                colors: altColors,
                plotOptions: {
                    series: {
                        stacking: 'percent'
                    }
                },
                tooltip: tooltip,
                series: series
            };

            options.title.text += ' - ' + selectedYear;

            $(CHART_ID).highcharts(options);
        }


        function getSeries(year) {
            var bayYearData = _.find(regionData, {'Year': year});
            var countyYearData = _.filter(countyData, {'Year': year});

            var dataByCategory = {};

            // Set up the bay area data first
            _.each(LABOR_TOTALS, function(name, key) {
                dataByCategory[key] = [bayYearData[key]];
            });

            // Then set up the county data
            _.each(countyYearData, function(county) {
                _.each(LABOR_TOTALS, function(name, key) {
                    dataByCategory[key].push(county[key]);
                });
            });

            var series = [];
            _.each(LABOR_TOTALS, function(name, key) {
                series.push({
                    name: name,
                    data: dataByCategory[key]
                });
            });
            return series;
        }


        // Used for dropdown menu
        // function selectYear(e) {
        //     selectedYear = parseInt(e.item.text(), 10);
        //     graph(getSeries(selectedYear));
        // }


        function sliderSelectYear(e) {
            selectedYear = YEARNAMES[e.value];
            console.log("Selected year", selectedYear);
            graph(getSeries(selectedYear));
        }


        function setup() {
            graph(getSeries(FOCUSYEAR));


            // $("#ec-b-year-select").kendoComboBox({
            //     text: "Select year...",
            //     // dataTextField: COUNTY_KEY,
            //     // dataValueField: COUNTY_KEY,
            //     dataSource: YEARNAMES,
            //     select: selectYear
            // });

            function getYearForSlider(value) {
                return YEARNAMES[value];
            }
            var templateString = "# getYearForSlider(value) #";

            var slider = $("#ec-b-year-select").kendoSlider({
                min: 0,
                max: 4,
                tickPlacement: "none",
                change: sliderSelectYear,
                slide: sliderSelectYear,
                value: 4,
                tooltip: {
                    template: function(e) {
                        return YEARNAMES[e.value];
                    }
                }
            });

            var ec8CountySelect = $("#ec-b-year-select").data("kendoComboBox");
        }


        function round(n) {
            if (n === null) {
                return n;
            }

            return Math.round(n/100) * 100;
        }


        function percent(n) {
            return n * 100;
        }


        function setupNumbers(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                _.each(LABOR_TOTALS, function(v, k) {
                    //d[i][k] = percent(d[i][k]);
                    d[i][k] = round(d[i][k]);
                });
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(region, county) {
            regionData = setupNumbers(_.clone(region[0], true));
            countyData = setupNumbers(_.clone(county[0], true));

            // Once we have the data, set up the visualizations
            setup();
        }

        $.when(regionPromise, countyPromise).done(prepData);
    });
})(jQuery);
