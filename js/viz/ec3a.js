/*globals jQuery, L, geocities, allGray, econColors, altColors, science,
cityPromise, countyPromise, regionPromise: true */

(function($) {
    /*
    http://vitalsigns-production.elasticbeanstalk.com/ec/3/city
    http://vitalsigns-production.elasticbeanstalk.com/ec/3/county
    http://vitalsigns-production.elasticbeanstalk.com/ec/3/region


    A
    Line graph showing the regional unemployment trend by default.
    - Using  drop-down menus, user can select a county or a city to see its historical
    trend.
    - If a county is selected, show lines both for county and for region.
    - If city is selected, show lines for both city, county, and region.
    - X-axis should be years and Y-axis should be unemployment rate (%).
    - Hovering over the line(s) should show the unemployment rates for each jurisdiction (e.g.
    "Regional Unemployment: X%; Alameda County Unemployment: Y%; Berkeley
    Unemployment: Z%) (T18-A: http://www.vitalsigns.mtc.ca.gov/bridge-condition)
    Example: http://dev-mtc-vital-signs.pantheon.io/sites/all/themes/vitalsigns/js/t18a.js?nlgw9a

    TODO

    MISC

    REQUESTS

    */

    var CHART_ID = '#ec3-a-chart';
    var CHART_TITLE = 'Historical Trend for Unemployment Rate';

    var FOCUS_YEAR = 2013;
    var YEAR_KEY = 'Year';
    // Blank years before we get city data:
    var CITYBLANKS = [null, null, null, null, null, null, null, null, null, null];
    var minYear;
    var maxYear;
    var yearNames = [];

    // Use econ purple as the first color
    altColors[4] = altColors[0];
    altColors[0] = econColors[1];

    var cityData, countyData, regionData, metroData;
    var selectedGeography;

    $(function(){
        function chart(series) {
            var options = {
                chart: {
                    type: 'line'
                },
                title: {
                    text: CHART_TITLE
                },
                xAxis: {
                    categories: yearNames,
                    labels: {
                        step: 2,
                        staggerLines: 1
                    }
                },
                yAxis: {
                    min: 0,
                    max: 20,
                    title: {
                        text: 'Unemployment Rate'
                    },
                    labels: {
                        format: '{value}%'
                    }
                },
                legend: {
                    reversed: true
                },
                tooltip: {
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                colors: altColors,
                series: series
            };

            if (!selectedGeography) {
                selectedGeography = 'Bay Area';
            }

            // Don't explicitly set step size on smaller screens
            if (window.innerWidth < 650) {
                delete options.xAxis.labels.step;
            }

            options.title.text += ' - ' + selectedGeography;

            $(CHART_ID).highcharts(options);
        }

        function selectLocation(e) {
            var location = this.dataItem(e.item.index());
            var city, county;

            if (location.Residence_Geo_CountyRef) {
                county = location.Residence_Geo_CountyRef;
                city = location.Residence_Geo;
                selectedGeography = city;
                $("#ec3-a-county-select").data("kendoComboBox").text('Select County...');
            } else {
                county = location.Residence_Geo;
                selectedGeography = county;
                $("#ec3-a-city-select").data("kendoComboBox").text('Select City...');
            }

            // Get the regional data
            var graphData = [];
            graphData.push({
                name: "Bay Area",
                data: regionData
            });

            // Get the county data.
            var selectedCountyData = _.filter(countyData, {'Residence_Geo': county});
            var data = _.pluck(selectedCountyData, 'Unemployment_Rate');
            graphData.push({
                name: county,
                data: data
            });

            // Push the city data, if any.
            if (city) {
                var selectedCityData = _.filter(cityData, {'Residence_Geo': location.Residence_Geo});
                data = _.pluck(selectedCityData, 'Unemployment_Rate');

                graphData.push({
                    name: location.Residence_Geo,
                    data: CITYBLANKS.concat(data)
                });
            }

            chart(graphData);
        }


        // Once we have the data, start setting up the various visualizations
        function setup() {
            chart([{
                name: 'Bay Area',
                data: regionData
            }]);

            var cities = _.uniq(cityData, 'Residence_Geo');
            var counties = _.uniq(countyData, 'Residence_Geo');

            // Set up select boxes for county / city search
            $("#ec3-a-city-select").kendoComboBox({
                text: "Select City...",
                dataTextField: "Residence_Geo",
                dataValueField: "Residence_Geo",
                dataSource: _.uniq(cityData, 'Residence_Geo'),
                select: selectLocation
            });
            $("#ec3-a-county-select").kendoComboBox({
                text: "Select County...",
                dataTextField: "Residence_Geo",
                dataValueField: "Residence_Geo",
                dataSource: _.uniq(countyData, 'Residence_Geo'),
                select: selectLocation
            });

            var ec8CitySelect = $("#ec8-a-city-select").data("kendoComboBox");
            var ec8CountySelect = $("#ec8-a-county-select").data("kendoComboBox");
        }

        // Get all the data needed for the interactives in one go.
        function prepData(cityRaw, countyRaw, regionRaw) {
            regionData = [];
            _.each(regionRaw[0], function(r, i) {
                regionData.push(r.Unemployment_Rate);
            });

            var i;
            var years = _.pluck(regionRaw[0], YEAR_KEY);
            maxYear = _.max(years);
            minYear = _.min(years);
            for (i = minYear; i <= maxYear; i++) {
                yearNames.push(i);
            }

            cityData = cityRaw[0];
            countyData = countyRaw[0];
            setup();
        }

        $.when(cityPromise, countyPromise, regionPromise).done(prepData);
    });
})(jQuery);
