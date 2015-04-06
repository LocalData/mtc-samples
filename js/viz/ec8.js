/*globals jQuery, L, geocities, allYellow, altColors, Highcharts, science: true */
(function($) {
    /*
    http://54.149.29.2/ec/3/city
    http://54.149.29.2/ec/3/county
    http://54.149.29.2/ec/3/region
    http://www.vitalsigns.mtc.ca.gov/bridge-condition

    Median monthly rent payment

    LU1-A
    n/a - limited similarities to LU1-C
    LU1-C

    Line graph showing the median rent payments for a selected geography.
    Default to region on load with two lines shown (inflation-adjusted and
    non-inflation-adjusted). User can select county or city from dropdown menus
    to get localized data - overlay so both county and region (or city and
    county) are shown on same graph. User can hover over any year to see all
    data points for that year. X-axis should be year, Y-axis should be rent.
    User should be able to use button bar to switch from Median Rents to
    % Growth in Median Rent since 1970.
    LU1-A
    http://54.149.29.2/ec/8/county
    http://54.149.29.2/ec/8/city
    http://54.149.29.2/ec/8/region
    Historical Trend for Rents - "Geography" OR
    Historical Trend for Percent Change in Rents - "Geography"
    http://dev-mtc-vital-signs.pantheon.io/sites/all/themes/vitalsigns/js/lu1a.js?nlss6p


    Should be a census tract map of the region showing inflation-adjusted median
    rents. When the user clicks on a tract, a bar graph in the right panel
    should show the median rents of the tract, city, county, and region for
    comparison purposes. There should also be text above it saying "The median
    monthly rent payment of Census Tract XXXX in 2013 was $Y,YYY.". Below the
    bar graph in side panel, a top 5 and bottom 5 list should show the highest
    rent and lowest rent cities in the region. No button bar or dropdown menus
    are needed.
    http://54.149.29.2/ec/8/county
    http://54.149.29.2/ec/8/city
    http://54.149.29.2/ec/8/region
    http://54.149.29.2/ec/8/tract
    2013 Rents by Neighborhood
    - Get tract geodata
    - Load tract geodata on map
    - Load tract geodata on cartodb?


    Line graph showing the inflation-adjusted median rent (or % growth) of the
    10 major metro areas. X-axis should show years and Y-axis should show either
    $ or % growth (for either 1970 or 2000 as base year). User should be able to
    turn on or off metro areas in graph. User should be able to hover over graph
    to see all metros' rents for the selected year. Button bar allows for switch
    between $ and % modes.
    http://54.149.29.2/ec/8/metro
    Metro Comparison for Rents OR Metro Comparison for Percent Change in Rents
    - Get button bar
    - ORganize data by two types
    - Handle click on button bar


    MISC
    http://54.149.29.2/counties
    http://54.149.29.2/cities

    TODO
    - Load map
    - Get top & bottom
    - handle percents correctly


    Requests
    - The data for tracts is inconsistent.
        The featureserver data has full tracts specified in the format 06075031000
        However, the data at http://54.149.29.2/ec/8/tract has the shorter
        version (eg "31000"). It would be best if they are consistent
    */

    var i;

    var DASH = 'ShortDash';

    var FOCUSYEAR = 2013;
    var MEDIAN_RENT = 'Median_Contract_Rent';
    var MEDIAN_RENT_ADJUSTED = 'Median_Contract_Rent_IA';
    var MEDIAN_RENT_CHANGE = 'Median_Contract_Rent_PercentChg_1970';
    var MEDIAN_RENT_CHANGE_ADJUSTED = 'Median_Contract_Rent_IA_PercentChg_1970';

    var FIRSTYEAR = 1970;
    var MAXYEAR = 2013;
    var ACTIVEYARNAMES = [1970, 1980, 1990, 2000, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
    var YEARS_SINCE_2000 = [2000, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
    var YEARNAMES = [];
    for (i = 1970; i <= 2013; i++) {
        YEARNAMES.push(i);
    }
    var METROYEARNAMES = [1970, 1980, 1990, 2000, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
    var CITYBLANKS = [null, null, null, null, null, null, null, null, null, null];

    var cityData, countyData, regionData, metroData, tractData;
    var ec8aToggle = 'Median Rents';
    var ec8cToggle = 'Median Rents';
    var selectedGeography;

    $(function(){
        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });

        /* -- EC-8 A (Regional rent graph) -----------------------------------*/

        function graph(id, series) {

            var tooltip = {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>${point.y:,.0f}</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            };

            var options = {
                chart: {
                    type: 'line'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: YEARNAMES
                },
                yAxis: {
                    title: {
                        text: ec8aToggle
                    },
                    labels: {
                        format: "${value:,.0f}"
                    }
                },
                legend: {
                    reversed: true
                },
                tooltip: tooltip,
                colors: altColors,
                series: series
            };

            if (ec8aToggle === 'Median Rents') {
                options.title.text = 'Historical Trend for Rents';

                options.yAxis.labels = {
                    format: "${value:,.0f}"
                };
            } else {
                options.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>';
                options.title.text = 'Historical Trend for Percent Change in Rents';

                options.yAxis.labels = {
                    format: "{value:,.0f}%"
                };
            }

            if (selectedGeography) {
                options.title.text += ' - ' + selectedGeography;
            }

            $(id).highcharts(options);
        }

        // We need to fill in the years after 1970s so that the graph maintains
        // its scale.
        function fillInBlanks(data) {
            var blanked = [];

            i = 0;
            var year;
            for(year = FIRSTYEAR; year <= MAXYEAR; year++) {
                if (_.includes(ACTIVEYARNAMES, year)) {
                    blanked.push(data[i]);
                    i++;
                } else {
                    blanked.push(null);
                }
            }

            return blanked;
        }

        function cityBlanks(data) {
            // Cities only have data in 1970, 1980, 1990, 2000, 09, 10, 11, 12, 13
            var cityClean = data.slice(0,34);
            cityClean = cityClean.concat([null, null, null, null]);
            cityClean = cityClean.concat(data.slice(34));
            return cityClean;
        }

        function getSeries(data, name) {
            var series;
            if (ec8aToggle === 'Median Rents') {
                series = [{
                    name: name + " Median Rent (inflation-adjusted)",
                    data: fillInBlanks(_.pluck(data, MEDIAN_RENT_ADJUSTED)),
                    connectNulls: true
                }, {
                    name: name + " Median Rent",
                    data: fillInBlanks(_.pluck(data, MEDIAN_RENT)),
                    connectNulls: true,
                    dashStyle: DASH
                }];
            } else {
                series = [{
                    name: name + " % Growth in Median Rent since 1970 (inflation-adjusted)",
                    data: fillInBlanks(_.pluck(data, MEDIAN_RENT_CHANGE_ADJUSTED)),
                    connectNulls: true
                }, {
                    name: name + " % Growth in Median Rent since 1970",
                    data: fillInBlanks(_.pluck(data, MEDIAN_RENT_CHANGE)),
                    connectNulls: true,
                    dashStyle: DASH
                }];
            }
            return series;
        }

        function selectLocation(e) {
            if (!e) {
                selectedGeography = null;
                graph('#ec8-a-chart', getSeries(regionData, 'Regional'));
                return;
            }

            // e might be an event or actual location data.
            var location;
            if (e.County) {
                location = e;
            } else {
                location = this.dataItem(e.item.index());
            }

            var city, county;

            county = location.County;
            if (location.City) {
                city = location.City;
                selectedGeography = city;
                $("#ec8-a-county-select").data("kendoComboBox").text('Select County...');
            } else {
                selectedGeography = county;
                $("#ec8-a-city-select").data("kendoComboBox").text('Select City...');
            }

            // Get the regional data
            var graphData = [];
            graphData = graphData.concat(getSeries(regionData, 'Regional'));

            // Get the county data.
            var selectedCountyData = _.filter(countyData, {'County': county});
            graphData = graphData.concat(getSeries(selectedCountyData, county));

            // Push the city data, if any.
            if (city) {
                var selectedCityData = _.filter(cityData, {'City': city});
                var citySeries = getSeries(selectedCityData, city);
                citySeries[0].data = cityBlanks(citySeries[0].data);
                citySeries[1].data = cityBlanks(citySeries[1].data);
                graphData = graphData.concat(citySeries);

            }

            graph('#ec8-a-chart', graphData);
        }

        function setupEC8A() {
            graph('#ec8-a-chart', getSeries(regionData, 'Regional'));

            // Set up select boxes for county / city search
            // Could potentially use a cascading combo box:
            // http://demos.telerik.com/kendo-ui/combobox/cascadingcombobox
            $("#ec8-a-city-select").kendoComboBox({
                text: "Select City...",
                dataTextField: "City",
                dataValueField: "City",
                dataSource: _.uniq(cityData, 'City'),
                select: selectLocation
            });
            $("#ec8-a-county-select").kendoComboBox({
                text: "Select County...",
                dataTextField: "County",
                dataValueField: "County",
                dataSource: _.uniq(countyData, 'County'),
                select: selectLocation
            });

            var ec8CitySelect = $("#ec8-a-city-select").data("kendoComboBox");
            var ec8CountySelect = $("#ec8-a-county-select").data("kendoComboBox");

            $('#median-rents').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                ec8aToggle = "Median Rents";

                var county = ec8CitySelect.dataItem();
                var city = ec8CountySelect.dataItem();
                if (county) {
                    selectLocation(county);
                }else {
                    selectLocation(city);
                }

                $(this).display();
            });
            $('#percent-growth').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                ec8aToggle = "% Growth in Median Rent since 1970";

                var county = ec8CitySelect.dataItem();
                var city = ec8CountySelect.dataItem();
                if (county) {
                    selectLocation(county);
                }else {
                    selectLocation(city);
                }

                $(this).display();
            });

        }

        /* -- EC-8 B (Map) ---------------------------------------------------*/
        // Given an object
        function getRange(data, property) {
          var range = [];
          $.each(data, function(key, v) {
            if(v[property] !== null) {
              range.push(v[property]);
            }
          });
          var breaks = science.stats.quantiles(range, [0, 0.25, 0.50, 0.75]);
          return breaks;
        }

        function ecBLeaderboard(data) {
            data = _.sortBy(data, MEDIAN_RENT_ADJUSTED);
            var bottom5 = data.slice(0,5);
            var top5 = _.takeRight(data, 5).reverse();

            var topText = "<div class='col-lg-6'><h4>Highest Rents</h4>";
            _.each(top5, function(city, i) {
                topText += "<h6>"  + (i+1) + '. ' + city.City + ": $" + city[MEDIAN_RENT_ADJUSTED].toLocaleString() + "</h6>";
            });
            topText += '</div>';
            $("#ec3-b-top-cities").html(topText);


            var bottomText = "<div class='col-lg-6'><h4>Lowest Rents</h4>";
            _.each(bottom5, function(city, i) {
                bottomText += "<h6>" + (i+1) + '. ' + city.City + ": $" + city[MEDIAN_RENT_ADJUSTED].toLocaleString() + "</h6>";
            });
            topText += '</div>';
            $("#ec3-b-bottom-cities").html(bottomText);
        }

        function ec8bBarChart(series, options) {
            // http://dev-mtc-vital-signs.pantheon.io/sites/all/themes/vitalsigns/js/t3t4b-new.js?nlq112
            $('#ec3-b-chart').highcharts({
                chart: {
                    defaultSeriesType: 'bar'
                },
                series: series,
                exporting: {
                    enabled: true
                },
                legend: {
                    enabled: false
                },
                yAxis: {
                    title: {
                        text: 'Rent'
                    },
                    startOnTick: false,
                    endOnTick: false,
                    labels: {
                        format: "${value:,.0f}"
                    }
                },
                xAxis: {
                    categories: options.categories
                },
                title: {
                    text: series[0].name
                },
                tooltip: {
                    shared: true,
                    crosshairs: false,
                    pointFormat: '<b>${point.y:,.0f}</b>'
                },
                colors: allYellow
            });
        }

        function ec8bMapInteraction(event, feature) {
            var cityName = 'cityName'; //feature.properties.City;
            var countyName = feature.properties.County;
            var county2013 = _.find(countyData, {
                'Year': FOCUSYEAR,
                County: countyName
            });

            var region2013 = _.find(regionData, {
                'Year': FOCUSYEAR
            });

            var series = [
            {
                name: 'The median monthly rent payment of Census Tract ' +
                    feature.properties.TRACT + ' in 2013 was ' + '$' +
                    feature.properties.Median_Contract_Rent_IA.toLocaleString(),
                data: [
                    feature.properties.Median_Contract_Rent_IA,
                    null, // City TODO
                    county2013.Median_Contract_Rent_IA,
                    region2013.Median_Contract_Rent_IA
                ]
            }];

            ec8bBarChart(series, {
                categories: [
                    'Tract ' + feature.properties.TRACT,
                    cityName,
                    countyName,
                    'Bay Area'
                ]
            });
        }

        function ec8bSetupMapInteraction(feature, layer) {
            layer.on('click', function(event) {
                ec8bMapInteraction(event, feature);
            });
        }

        // Set up the interactive map
        function setupEC8B() {
            // Reference JS:
            // http://dev-mtc-vital-signs.pantheon.io/sites/all/themes/vitalsigns/js/t3t4b-new.js?nlqyte
            // http://matth-mtc-vital-signs.pantheon.io/sites/all/themes/vitalsigns/js/lu1c.js?nknpo6
            // Should be a census tract map of the region showing inflation-adjusted median
            // rents. When the user clicks on a tract, a bar graph in the right panel
            // should show the median rents of the tract, city, county, and region for
            // comparison purposes. There should also be text above it saying "The median
            // monthly rent payment of Census Tract XXXX in 2013 was $Y,YYY.". Below the
            // bar graph in side panel, a top 5 and bottom 5 list should show the highest
            // rent and lowest rent cities in the region. No button bar or dropdown menus
            // are needed.

            // Set up the top 5 / bottom 5 employment rate lists
            ecBLeaderboard(_.filter(cityData, {'Year': FOCUSYEAR}));

            // Set up the map
            L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';
            var map = L.mapbox.map('map', 'postcode.kh28fdpk', {
                infoControl: true,
                attributionControl: false,
                center: [37.783367, -122.062378],
                zoom: 10,
                minZoom: 8
            });
            L.control.scale().addTo(map);

            // Prep the tract data
            var focusYearData = _.filter(tractData, {'Year': FOCUSYEAR});
            var joinedFeatures = [];
            var breaks = getRange(focusYearData, 'Median_Contract_Rent_IA');

            function style(feature) {
                var color;
                var data = _.find(focusYearData, { Tract: parseInt(feature.properties.TRACT.slice(5), 10) });
                if (!data) {
                    console.log("Missing data for", feature.properties);
                }
                feature.properties = _.merge(feature.properties, data);
                var u = feature.properties.Median_Contract_Rent_IA;
                if (u > breaks[3]) {
                    color = allYellow[4];
                } else if (u > breaks[2]) {
                    color = allYellow[3];
                } else if (u > breaks[1]) {
                    color = allYellow[2];
                } else if (u > breaks[0]) {
                    color = allYellow[1];
                } else {
                    color = allYellow[0];
                }
                return {
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.8,
                  weight: 0.5
                };
            }

            // Get the tract data
            var tractLayer = L.esri.featureLayer('http://gis.mtc.ca.gov/mtc/rest/services/VitalSigns/LU_Features/FeatureServer/1', {
                onEachFeature: ec8bSetupMapInteraction,
                simplifyFactor: 0.35,
                precision: 5,
                fields: ['TRACT', 'OBJECTID', 'GeoID'],
                style: style
            }).addTo(map);

            // Add the legend
            var legendControl = new L.mapbox.legendControl();
            legendControl.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend');
                $(div).addClass("col-lg-12");
                $(div).append("<h5>Inflation-adjusted Median Rents</h5>");

                breaks.unshift(1);
                // loop through our density intervals and generate a label
                // with a colored square for each interval
                var i;
                for (i = 0; i < breaks.length; i++) {
                    var start = Math.round(breaks[i]*100)/100;
                    var end = Math.round(breaks[i + 1]*100)/100;

                    var legendText = '<div><div class="col-lg-1" style="background:' + allYellow[i] + ';">&nbsp; </div><div class="col-lg-10">';
                    legendText += start.toLocaleString();

                    if (Math.round(breaks[i + 1]*100)/100) {
                        // If there is a next value, display it.
                        legendText += '&ndash;' + end.toLocaleString() + '</div></div>';
                    } else {
                        // Otherwise we're at the end of the legend.
                        legendText +='+ </div></div>';
                    }
                    $(div).append(legendText);
                }
                return div;
            };
            legendControl.addTo(map);
        }

        function chartEC8C(mode) {
            // Group the metro data as needed
            var series = [];
            var key, label, pointFormat, title, yAxisLabel;
            var years = METROYEARNAMES;

            var dataByMetro = _.groupBy(metroData, 'Metro');
            _.each(dataByMetro, function(d, metro) {
                if (mode === 'Median Rents'){
                    title = 'Metro Comparison for Rents';
                    label = 'Median Monthly Rent Payment ($)';
                    key = 'Median_Contract_Rent_IA';
                    pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>${point.y:,.0f}</b></td></tr>';
                    yAxisLabel = {
                        format: "${value:,.0f}"
                    };
                } else if (mode === 'Change in Median Monthly Rent Payment since 1970 (%)') {
                    title = 'Metro Comparison for Percent Change in Rents';
                    label = 'Change in Median Monthly Rent Payment since 1970 (%)';
                    key = 'Median_Contract_Rent_IA_PercentChg_1970';
                    pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>';
                    yAxisLabel = {
                        format: "{value:,.0f}%"
                    };
                } else {
                    years = YEARS_SINCE_2000;
                    title = 'Metro Comparison for Percent Change in Rents';
                    label = 'Change in Median Monthly Rent Payment since 2000 (%)';
                    key = 'Median_Contract_Rent_IA_PercentChg_2000';
                    pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>';
                    yAxisLabel = {
                        format: "{value:,.0f}%"
                    };

                    // Skip the first three values (years before 2000)
                    d = d.slice(3);
                }
                series.push({
                    name: metro,
                    data: _.pluck(d, key)
                });
            });
            series = _.sortBy(series, 'Metro');

            var options = {
                chart: {
                    type: 'line'
                },
                title: {
                    text: title
                },
                xAxis: {
                    categories: years
                },
                yAxis: {
                    title: {
                        text: label
                    },
                    labels: yAxisLabel
                },
                tooltip: {
                    enabled: true,
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: pointFormat,
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                colors: altColors,
                series: series
            };

            $('#ec3-c-chart').highcharts(options);
        }

        function setupEC8C() {
            chartEC8C("Median Rents");

            $('#ec8-c-median-rents').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                chartEC8C("Median Rents");
                $(this).display();
            });
            $('#ec8-c-percent-growth').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                chartEC8C("Change in Median Monthly Rent Payment since 1970 (%)");
                $(this).display();
            });
            $('#ec8-c-percent-growth-2000').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                chartEC8C("Change in Median Monthly Rent Payment since 2000 (%)");
                $(this).display();
            });
        }

        function setupPercents(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                d[i].Median_Contract_Rent_IA_PercentChg_1970 *= 100;
                d[i].Median_Contract_Rent_PercentChg_1970 *= 100;

                // only for metros
                d[i].Median_Contract_Rent_IA_PercentChg_2000 *= 100;
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(cityRaw, countyRaw, regionRaw, metroRaw, tractRaw) {
            cityData    = setupPercents(cityRaw[0]);
            countyData  = setupPercents(countyRaw[0]);
            regionData  = setupPercents(regionRaw[0]);
            metroData   = setupPercents(metroRaw[0]);
            tractData   = tractRaw[0];

            // Once we have the data, set up the visualizations
            setupEC8A();
            setupEC8B();
            setupEC8C();
        }

        // Request all the data
        var cityPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/8/city"
        });
        var countyPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/8/county"
        });
        var regionPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/8/region"
        });
        var metroPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/8/metro"
        });
        var tractPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/8/tract"
        });

        $.when(cityPromise, countyPromise, regionPromise, metroPromise, tractPromise).done(prepData);
    });
})(jQuery);
