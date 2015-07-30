/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science,
regionPromise, countyPromise, cityPromise: true
*/
(function($) {
    /*
    Home prices

    A
    Line graph showing the median home prices for a selected geography. Default
    to region on load with two lines shown (inflation-adjusted and
    non-inflation-adjusted). User can select county or city from dropdown menus
    to get localized data - overlay so both county and region (or city and
    county) are shown on same graph. User can hover over any year to see all
    data points for that year. X-axis should be year, Y-axis should be home
    prices. User should be able to use button bar to switch from Median Home
    Prices to % Growth in Median Home Prices since 1990.


    Y-axis: Median Home Price ($) OR Change in Median House Price since 1990 (%)

    Historical Trend for Home Prices - "Geography" OR
    Historical Trend for Percent Change in Home Prices - "Geography"

    Legends:
    Lines + "Non-Inflation-Adjusted Home Price" and
    "Inflation-Adjusted Home Price" for all geographies

    MISC

    TODO

    REQUESTS

    */

    $(function(){
        var i;
        var cityData, countyData, regionData;

        var CHART_BASE_TITLE = 'Historical Trend for Home Prices';
        var CHART_ID = '#ec-a-chart';
        var CITY_KEY = 'City';
        var COUNTY_KEY = 'County';
        var YEAR_KEY = 'Year';

        var MEDIAN_KEY = 'MedPrice';
        var MEDIAN_IA_KEY = 'MedPrice_IA';
        var PERCENT_KEY = 'PercentChngPriceIA';


        // Use econ purple as the first color
        altColors[4] = altColors[0];
        altColors[0] = econColors[1];

        var DASH_FORMAT = 'ShortDash';
        var COLOR_PAIRS = [
            altColors[0],
            altColors[0],
            altColors[1],
            altColors[1],
            altColors[2],
            altColors[2]
        ];

        var minYear, maxYear;
        var yearNames = [];

        var MODE_1 = {
            title: 'Historical Trend for Home Prices',
            yAxis: 'Median Home Price',
            yMin: 0,
            format: "${value:,.0f}",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>${point.y:,.0f}</b></td></tr>',
            colors: COLOR_PAIRS,
            getSeries: function(data, name) {
                var series = [{
                    name: 'Inflation-Adjusted Home Price - ' + name,
                    data: _.pluck(data, MEDIAN_IA_KEY)
                }, {
                    name: 'Non-Inflation-Adjusted Home Price - ' + name,
                    data: _.pluck(data, MEDIAN_KEY),
                    dashStyle: DASH_FORMAT
                }];
                return series;
            }
        };
        var MODE_2 = {
            title: 'Historical Trend for Percent Change in Home Prices',
            yAxis: '% Change in Median House Price since 1990',
            format: "{value:,.0f}%",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.0f}%</b></td></tr>',
            colors: altColors,
            getSeries: function(data, name) {
                var series = [{
                    name: '% Change in Home Prices (inflation-adjusted) - ' + name,
                    data: _.pluck(data, PERCENT_KEY)
                }];
                return series;
            }
        };

        var selectedGeography = {};
        var mode = MODE_1;

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


        function getSeries(data, name) {
            return mode.getSeries(data, name);
        }


        function getAllSeries() {
            var series = getSeries(regionData, 'Bay Area');

            if (selectedGeography.county) {
                var selectedCountyData = _.filter(countyData, {'County': selectedGeography.county});
                series = series.concat(getSeries(selectedCountyData, selectedGeography.county));
            }

            if (selectedGeography.city) {
                // Don't show SF twice.
                if (selectedGeography.city !== 'San Francisco') {
                    var selectedCityData = _.filter(cityData, {'City': selectedGeography.city});
                    series = series.concat(getSeries(selectedCityData, selectedGeography.city));
                }
            }

            return series;
        }

        function chart() {
            var series = getAllSeries();

            var tooltip = {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: mode.pointFormat,
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            };


            var title = mode.title;
            if (selectedGeography.city) {
                title += ' - ' + selectedGeography.city;
            } else if (selectedGeography.county) {
                title += ' - ' + selectedGeography.county + ' County';
            }


            if (!selectedGeography.city && !selectedGeography.county) {
                title += ' - Bay Area';
            }

            var options = {
                chart: {
                    type: 'line'
                },
                title: {
                    text: title
                },
                xAxis: {
                    categories: yearNames,
                    tickmarkPlacement: 'on',
                    labels: {
                        step: 2,
                        maxStaggerLines: 1,
                        staggerLines: 1
                    },
                    title: {
                        text: 'Year'
                    }
                },
                yAxis: {
                    title: {
                        text: mode.yAxis
                    },
                    labels: {
                        format: mode.format
                    },
                    reversedStacks: false,
                    stackLabels: {
                        enabled: false
                    }
                },
                legend: {
                    enabled: true,
                    symbolWidth: 30
                },
                colors: mode.colors,
                plotOptions: {
                },
                tooltip: tooltip,
                series: series
            };

            if (_.has(mode, 'yMin')) {
                options.yAxis.min = mode.yMin;
            }

            // Don't explicitly set step size on smaller screens
            if (window.innerWidth < 650) {
                delete options.xAxis.labels;
            }

            $(CHART_ID).highcharts(options);
        }


        function resetCombos(mode) {
            var combo;
            combo = $("#ec-a-county-select").data("kendoComboBox");
            combo.text('Select County...');
            combo = $("#ec-a-city-select").data("kendoComboBox");
            combo.text('Select City...');
        }


        function selectLocation(e) {
            selectedGeography = {};
            resetCombos();

            var series = [];
            if (!e) {
                return;
            }

            // Has a county been selected?
            var location = this.dataItem(e.item.index());

            if (location.city === 'Bay Area' || location.County === 'Bay Area') {
                chart();
                return;
            }

            selectedGeography.county = location[COUNTY_KEY];

            // Get any city data
            var city = location[CITY_KEY];
            if (city) {
                selectedGeography.city = city;
            }

            chart();
        }


        function setup() {
            chart(CHART_ID);

            $('#median-prices').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                mode = MODE_1;
                chart();

                $(this).display();
            });
            $('#home-price-growth').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                mode = MODE_2;
                chart();

                $(this).display();
            });

            $("#ec-a-city-select").kendoComboBox({
                text: "Select City...",
                dataTextField: CITY_KEY,
                dataValueField: CITY_KEY,
                dataSource: [{ 'City': 'Bay Area' }].concat(_.uniq(cityData, CITY_KEY)),
                select: selectLocation
            });
            $("#ec-a-county-select").kendoComboBox({
                text: "Select County...",
                dataTextField: COUNTY_KEY,
                dataValueField: COUNTY_KEY,
                dataSource: [{ 'County': 'Bay Area' }].concat(_.uniq(countyData, COUNTY_KEY)),
                select: selectLocation
            });

            var ecACitySelect = $("#ec-a-city-select").data("kendoComboBox");
            var ecACountySelect = $("#ec-a-county-select").data("kendoComboBox");
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
            var i;
            for(i = 0; i < d.length; i++) {
                 d[i][PERCENT_KEY] = percent(d[i][PERCENT_KEY]);
            }
            return d;
        }


        function renameFields(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                 d[i][MEDIAN_KEY] = d[i]['sale_price#median'];
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(city, county, region) {
            cityData = setupNumbers(_.clone(city[0], true));
            countyData = setupNumbers(_.clone(county[0], true));
            regionData = setupNumbers(_.clone(region[0], true));

            yearNames = [];
            var years = _.pluck(regionData, YEAR_KEY);
            var maxYear = _.max(years);
            var minYear = _.min(years);
            for (i = minYear; i <= maxYear; i++) {
                yearNames.push(i);
            }

            // Once we have the data, set up the visualizations
            setup();
        }


        $.when(cityPromise, countyPromise, regionPromise).done(prepData);
    });
})(jQuery);
