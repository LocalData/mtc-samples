/*globals
jQuery, L, cartodb, geocities, allYellow, altColors, Highcharts, science,
regionPromise, countyPromise, cityPromise: true
*/
(function($) {
    /*
    Poverty

    A
    Line graph showing the regional poverty trends by default (both 100% and
    200% of poverty limit). Using drop-down menus, user can select a county or
    a city to see its historical trend. If a county is selected, show lines both
    for county and for region. If city is selected, show lines for both city &
    county. X-axis should be years and Y-axis should be poverty rates (%).
    Hovering over the line(s) should show the poverty rates for each jurisdiction
    in the selected year.

    Y-axis: Share of Population
    Historical Trend for Poverty Rate - "Geography"

    MISC

    TODO

    REQUESTS

    */

   $(function(){
        var CHART_BASE_TITLE = 'Historical Trend for Poverty Rate';
        var DASH_FORMAT = 'ShortDash';
        var COUNTY_KEY = 'GeoName';
        var COUNTY_KEY_2 = 'County';
        var CITY_KEY = 'City';
        var KEY_100 = 'PovPCT100';
        var KEY_200 = 'PovPCT200';

        var i;
        var regionData, countyData, cityData;
        var selectedGeography = 'Bay Area';
        var ecAToggle = 'Share of Population'; // Default mode of interactive A

        var ACTIVE_YEARS = [1980, 1990, 2000, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
        var MAXYEAR = 2013;
        var YEARNAMES = [];
        for (i = ACTIVE_YEARS[0]; i <= MAXYEAR; i++) {
            YEARNAMES.push(i);
        }

        var DASH = 'ShortDash';
        var COLOR_PAIRS = [
            altColors[0],
            altColors[0],
            altColors[1],
            altColors[1],
            altColors[2],
            altColors[2]
        ];


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

        function graph(id, series) {
            var colors;

            var tooltip = {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            };

            var options = {
                chart: {
                    type: 'line'
                },
                title: {
                    text: CHART_BASE_TITLE
                },
                xAxis: {
                    categories: YEARNAMES,
                    tickmarkPlacement: 'on',
                    labels: {
                        step: 5,
                        staggerLines: 1
                    }
                },
                yAxis: {
                    title: {
                        text: ecAToggle
                    },
                    labels: {
                        format: "{value:,.0f}%"
                    }
                },
                legend: {
                    reversed: true,
                    symbolWidth: 30
                },
                tooltip: tooltip,
                colors: COLOR_PAIRS,
                series: series
            };

            if (selectedGeography) {
                options.title.text += ' - ' + selectedGeography;
            }

            $(id).highcharts(options);
        }

        // We need to fill in the years after 1970s without data with blanks so
        // that the graph maintains its scale.
        function fillInBlanks(data) {
            var blanked = [];

            i = 0;
            var year;
            for(year = YEARNAMES[0]; year <= YEARNAMES[YEARNAMES.length-1]; year++) {
                if (_.includes(ACTIVE_YEARS, year)) {
                    blanked.push(data[i]);
                    i++;
                } else {
                    blanked.push(null);
                }
            }

            return blanked;
        }

        function getSeries(data, geography) {
            var series = [];

            var nameA = 'Below national poverty level';
            var nameB = 'Below 200% of national poverty level';
            if (geography) {
                nameA += ' - ' + geography;
                nameB += ' - ' + geography;
            }

            series.push({
                name: nameA,
                data: fillInBlanks(_.pluck(data, KEY_100)),
                connectNulls: true
            });
            series.push({
                name: nameB,
                data: fillInBlanks(_.pluck(data, KEY_200)),
                connectNulls: true,
                dashStyle: DASH
            });
            return series;
        }

        function selectLocation(e) {
            var city, county, series;
            if (!e) {
                selectedGeography = 'Bay Area';
                graph('#ec-a-chart', getSeries(regionData));
                return;
            }

            series = getSeries(regionData);

            // e might be an event or actual location data.
            var location = this.dataItem(e.item.index());

            // Check if we're resetting the graph to the Bay Area
            if (location[COUNTY_KEY] === 'Bay Area' || location[CITY_KEY] === 'Bay Area') {
                selectedGeography = 'Bay Area';
                graph('#ec-a-chart', series);
                return;
            }

            // Get the county name
            county = location[COUNTY_KEY];
            selectedGeography = county + ' County';

            // Or, get the city name if we have one
            if (location[CITY_KEY]) {
                selectedGeography = location[CITY_KEY];
                city = location[CITY_KEY];
                county = location[COUNTY_KEY_2];
            }

            // Get the county data
            var selectedCountyData = _.filter(countyData, {'GeoName': county});
            series = series.concat(getSeries(selectedCountyData, county + ' County'));

            // Get the city data
            if (city) {
                var selectedCityData = _.filter(cityData, {'City': city});
                series = series.concat(getSeries(selectedCityData, city));
            }

            // Create the graphs
            graph('#ec-a-chart', series);
        }

        function setup() {
            graph('#ec-a-chart', getSeries(regionData, 'Regional'));

            var baseSelect = [{ 'City': 'Bay Area' }];
            $("#ec-a-city-select").kendoComboBox({
                text: "Select City...",
                dataTextField: CITY_KEY,
                dataValueField: CITY_KEY,
                dataSource: baseSelect.concat(_.uniq(cityData, CITY_KEY)),
                select: selectLocation
            });

            baseSelect = [{ 'GeoName': 'Bay Area' }];
            $("#ec-a-county-select").kendoComboBox({
                text: "Select County...",
                dataTextField: COUNTY_KEY,
                dataValueField: COUNTY_KEY,
                dataSource: baseSelect.concat(_.uniq(countyData, COUNTY_KEY)),
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


        function percent(n) {
            return n * 100;
        }


        function setupNumbers(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                d[i][KEY_100] = percent(d[i][KEY_100]);
                d[i][KEY_200] = percent(d[i][KEY_200]);
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(region, county, city) {
            regionData = setupNumbers(_.clone(region[0], true));
            countyData = setupNumbers(_.clone(county[0], true));
            cityData = setupNumbers(_.clone(city[0], true));

            // Once we have the data, set up the visualizations
            setup();
        }

        $.when(regionPromise, countyPromise, cityPromise).done(prepData);
    });
})(jQuery);
