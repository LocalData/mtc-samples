/*globals jQuery, L, geocities, allYellow, altColors, Highcharts, science: true */
(function($) {
    /*
    http://54.149.29.2/ec/3/city
    http://54.149.29.2/ec/3/county
    http://54.149.29.2/ec/3/region

    A
    Line graph showing the incomes of residents and workers for a selected
    geography. Default to region on load with two lines shown. User can select
    county or city from dropdown menus to get localized data - overlay so both
    county and region (or city and county) are shown on same graph. User can
    hover over any year to see all data points for that year. X-axis should be
    year, Y-axis should be income. User should be able to use button bar to
    switch from Median Incomes to % Growth in Median Income since 1970 (no
    worker data for that mode).
    "http:// 54.149.29.2/ec/4/city
    http:// 54.149.29.2/ec/4/county
    http:// 54.149.29.2/ec/4/region
    http:// 54.149.29.2/ec/5/county
    http:// 54.149.29.2/ec/5/region"
    Y-axis: Median Income ($) OR Change in Median Income since 1970 (%)
    Historical Trend for Median Income - "Geography"
    LU1-A

    B
    Should be a census tract map of the region showing household income data.
    When the user clicked on a tract, a bar graph in the right panel should show
    the median household income of the tract, city, county, and region for
    comparison purposes. There should also be text above it saying "The median
    household income of Census Tract XXXX in 2013 was $YY,YYY.". Below the bar
    graph in side panel, a top 5 and bottom 5 list should show the highest
    income and lowest household income cities in the region. No button bar or
    dropdown menus are needed.
    "http:// 54.149.29.2/ec/4/city
    http:// 54.149.29.2/ec/4/county
    http:// 54.149.29.2/ec/4/tract"
    2013 Median Household Income by Neighborhood

    C
    Line graph showing the median household income (or % growth) of the 10 major
    metro areas. X-axis should show years and Y-axis should show either $ or %
    growth. User should be able to turn on or off metro areas in graph. User
    should be able to hover over graph to see all metros' incomes for the
    selected year. Button bar allows for switch between $ and % modes.
    http:// 54.149.29.2/ec/4/metro
    http:// 54.149.29.2/ec/5/metro
    Metro Comparison for Median Household Income
    LU1-C


    MISC
    http://54.149.29.2/counties
    http://54.149.29.2/cities

    TODO
    - Move C to separate file
    - Join county and region worker data.
    -


    REQUESTS / QUESTIONS
    - Should title of B be "income by tract"?
    - http://54.149.29.2/ec/4/region: Residence_Geo1 should be Residence_Geo,
    - Residence_Geo should be Year
    - St Helena doesn't have income data after 2009 -- too small?

    */

    var i;

    var DASH = 'ShortDash';

    var FOCUS_YEAR = 2013;
    var FOCUS_KEY = 'Median_HH_Inc_PlaceOfResidence_IA';

    // The keys in the data we'll use
    var MEDIAN_HOUSEHOLD_INCOME = 'Median_HH_Inc_PlaceOfResidence_IA';
    var MEDIAN_WORKER_INCOME = 'Median_Worker_Inc_PlaceOfEmploy_IA';
    var MEDIAN_HOUSEHOLD_INCOME_CHANGE = 'Median_HH_Inc_PlaceOfResidence_IA_PerChg1970';

    var FIRSTYEAR = 1970; // first year we have data
    var MAXYEAR = 2013; // last year we have data
    var ACTIVE_YEARS = [1970, 1980, 1990, 2000, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
    var COUNTY_ACTIVE_YEARS = [2000, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
    var YEARNAMES = [];
    for (i = 1970; i <= MAXYEAR; i++) {
        YEARNAMES.push(i);
    }
    var METRO_YEARS = [1970, 1980, 1990, 2000, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013];
    var YEARS_SINCE_2000 = [ 9999 ];

    var cityData, countyData, regionData, countyWorkerData, regionWorkerData, metroData, tractData;
    var ecAToggle = 'Median Incomes'; // Default mode of interactive A
    var ecCToggle = 'Median Incomes'; // Default mode of interactive C
    var selectedGeography;

    $(function(){

        // Set explicit decimal separators
        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });

        /* -- Interactive A --------------------------------------------------*/

        function graph(id, series) {
            console.log("Graphing with", series);

            var tooltip = {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>${point.y:,.1f}</b></td></tr>',
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
                        text: ecAToggle
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

            if (ecAToggle === 'Median Incomes') {
                options.title.text = 'Historical Trend for Median Income';

                options.yAxis.labels = {
                    format: "${value:,.0f}"
                };
            } else {
                options.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>';
                options.title.text = 'Historical Trend for Median Income';

                options.yAxis.labels = {
                    format: "{value:,.1f}%"
                };
            }

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
            for(year = FIRSTYEAR; year <= MAXYEAR; year++) {
                if (_.includes(ACTIVE_YEARS, year)) {
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
            if (ecAToggle === 'Median Incomes') {
                series = [{
                    name: name + " Median Income of Households($)",
                    data: fillInBlanks(_.pluck(data, MEDIAN_HOUSEHOLD_INCOME)),
                    connectNulls: true
                }];

                // Median worker income only available for counties & region
                if (_.has(data[0], MEDIAN_WORKER_INCOME)) {
                    series.push({
                        name: name + " Median Income of Workers ($)",
                        data: fillInBlanks(_.pluck(data, MEDIAN_WORKER_INCOME)),
                        connectNulls: true,
                        dashStyle: DASH
                    });
                }
            } else {
                series = [{
                    name: name + " Change in Median Income since 1970 (%)",
                    data: fillInBlanks(_.pluck(data, MEDIAN_HOUSEHOLD_INCOME_CHANGE)),
                    connectNulls: true
                }];
            }

            console.log("Created series", series);
            console.log("From data", data);
            return series;
        }

        function selectLocation(e) {
            if (!e) {
                selectedGeography = null;
                graph('#ec-a-chart', getSeries(regionData, 'Regional'));
                return;
            }
            // e might be an event or actual location data.
            console.log("Selecting location", e);

            var location;
            if (e.Residence_Geo) {
                location = e;
            } else {
                location = this.dataItem(e.item.index());
            }

            var city, county;

            county = location.Residence_Geo;
            if (location.Residence_Geo_CountyRef) {
                city = location.Residence_Geo;
                county = location.Residence_Geo_CountyRef;
                selectedGeography = city;
                $("#ec-a-county-select").data("kendoComboBox").text('Select County...');
            } else {
                selectedGeography = county;
                $("#ec-a-city-select").data("kendoComboBox").text('Select City...');
            }

            // Get the regional data
            var graphData = [];
            graphData = graphData.concat(getSeries(regionData, 'Regional'));

            // Get the county data.
            var selectedCountyData = _.filter(countyData, {'Residence_Geo': county});
            graphData = graphData.concat(getSeries(selectedCountyData, county));

            console.log('Getting data for', city, county, selectedCountyData);

            // Push the city data, if any.
            if (city) {
                var selectedCityData = _.filter(cityData, {'Residence_Geo': city});
                var citySeries = getSeries(selectedCityData, city);
                console.log("Got city series", citySeries);
                citySeries[0].data = cityBlanks(citySeries[0].data);
                // citySeries[1].data = cityBlanks(citySeries[1].data);
                graphData = graphData.concat(citySeries);
            }

            graph('#ec-a-chart', graphData);
        }

        function setupA() {
            graph('#ec-a-chart', getSeries(regionData, 'Regional'));

            // Set up select boxes for county / city search
            // Could potentially use a cascading combo box:
            // http://demos.telerik.com/kendo-ui/combobox/cascadingcombobox
            $("#ec-a-city-select").kendoComboBox({
                text: "Select City...",
                dataTextField: "Residence_Geo",
                dataValueField: "Residence_Geo",
                dataSource: _.uniq(cityData, 'Residence_Geo'),
                select: selectLocation
            });
            $("#ec-a-county-select").kendoComboBox({
                text: "Select County...",
                dataTextField: "Residence_Geo",
                dataValueField: "Residence_Geo",
                dataSource: _.uniq(countyData, 'Residence_Geo'),
                select: selectLocation
            });

            var ecACitySelect = $("#ec-a-city-select").data("kendoComboBox");
            var ecACountySelect = $("#ec-a-county-select").data("kendoComboBox");

            $('#median-incomes').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                ecAToggle = "Median Incomes";

                var county = ecACitySelect.dataItem();
                var city = ecACountySelect.dataItem();
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

                ecAToggle = "% Growth in Median Rent since 1970";

                var county = ecACitySelect.dataItem();
                var city = ecACountySelect.dataItem();
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

        // Display the top 5 and lowest 5 unemployment rates
        function bLeaderboard(data) {
            data = _.filter(data, FOCUS_KEY); // remove nulls
            data = _.sortBy(data, FOCUS_KEY);
            var bottom5 = data.slice(0,5);
            var top5 = _.takeRight(data, 5).reverse();

            var topText = "<div class='col-lg-6'><h4>Highest Median Income</h4>";
            _.each(top5, function(city, i) {
                topText += "<h6>" + (i+1) + ': ' + city.Residence_Geo + ": $" + city[FOCUS_KEY].toLocaleString() + "</h6>";
            });
            topText += '</div>';
            $("#b-top-cities").html(topText);


            var bottomText = "<div class='col-lg-6'><h4>Lowest Median Income</h4><ol>";
            _.each(bottom5, function(city, i) {
                bottomText += "<h6>" + (i+1) + ': ' + city.Residence_Geo + ": $" + city[FOCUS_KEY].toLocaleString() + "</h6>";
            });
            topText += '</div>';
            $("#b-bottom-cities").html(bottomText);
        }

        function bBarChart(series, options) {
            // http://dev-mtc-vital-signs.pantheon.io/sites/all/themes/vitalsigns/js/t3t4b-new.js?nlq112
            $('#ec-b-chart').highcharts({
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
                        text: 'Median Income'
                    },
                    startOnTick: false,
                    endOnTick: false
                },
                xAxis: {
                    categories: options.categories
                },
                title: {
                    text: ''
                },
                tooltip: {
                    shared: true,
                    crosshairs: false,
                    pointFormat: '<b>${point.y:,.0f}</b>'
                },
                colors: allYellow
            });
        }

        function mapInteraction(event, feature) {
            var countyName = feature.properties.County;
            var county2013 = _.find(countyData, {
                'Year': FOCUS_YEAR,
                Residence_Geo: countyName + ' County'
            });

            var region2013 = _.find(regionData, {
                'Residence_Geo': FOCUS_YEAR // TODO -- this field is currently mislabeled
            });

            var series = [
            {
                name: 'The median monthly income of Census Tract ' +
                    feature.properties.TRACT + ' in 2013 was ' + '$' +
                    feature.properties[FOCUS_KEY].toLocaleString(),
                data: [
                    feature.properties[FOCUS_KEY],
                    500, // City
                    county2013[FOCUS_KEY],
                    region2013[FOCUS_KEY]
                ]
            }];

            bBarChart(series, {
                categories: [
                    'Tract ' + feature.properties.TRACT,
                    'cityName',
                    countyName,
                    'Bay Area'
                ]
            });
        }

        function setupMapInteraction(feature, layer) {
            layer.on('click', function(event) {
                mapInteraction(event, feature);
            });
        }

        // Set up the interactive map
        function setupB() {
            // Should be a census tract map of the region showing household income data.
            // When the user clicked on a tract, a bar graph in the right panel should show
            // the median household income of the tract, city, county, and region for
            // comparison purposes. There should also be text above it saying "The median
            // household income of Census Tract XXXX in 2013 was $YY,YYY.". Below the bar
            // graph in side panel, a top 5 and bottom 5 list should show the highest
            // income and lowest household income cities in the region. No button bar or
            // dropdown menus are needed.

            // Set up the leaderboard
            bLeaderboard(_.filter(cityData, {'Year': FOCUS_YEAR}));


            L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';
            var map = L.mapbox.map('map', 'postcode.kh28fdpk', {
                infoControl: true,
                attributionControl: false,
                center: [37.783367, -122.062378],
                zoom: 10,
                minZoom: 8
            });
            L.control.scale().addTo(map);

            // Prep the city data
            var focusYearData = _.filter(tractData, {'Year': FOCUS_YEAR});
            var joinedFeatures = [];
            var breaks = getRange(focusYearData, FOCUS_KEY);

            function style(feature) {
                var color;
                var data = _.find(focusYearData, { Residence_Geo: parseInt(feature.properties.TRACT.slice(5), 10) });
                if (!data) {
                    console.log("Missing data for", feature.properties);
                }
                feature.properties = _.merge(feature.properties, data);
                var u = feature.properties[FOCUS_KEY];
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
                onEachFeature: setupMapInteraction,
                simplifyFactor: 0.35,
                precision: 5,
                fields: ['TRACT', 'OBJECTID'],
                style: style
            }).addTo(map);

            // Add the legend
            var legendControl = new L.mapbox.legendControl();
            legendControl.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend');
                $(div).addClass("col-lg-12");
                $(div).append("<h5>Inflation-adjusted Median Household Income</h5>");

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
            var years = METRO_YEARS;

            var dataByMetro = _.groupBy(metroData, 'Metro');
            _.each(dataByMetro, function(d, metro) {
                if (mode === 'Median Rents'){
                    title = 'Metro Comparison for Rents';
                    label = 'Median Monthly Rent Payment ($)';
                    key = 'Median_Contract_Rent_IA';
                    pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                        '<td style="padding:0"><b>${point.y:,.1f}</b></td></tr>';
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
                    }
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

        // Create graph EC-3, showing unemployment trend for US metro areas
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
                d[i].Median_HH_Inc_PlaceOfResidence_IA_PerChg1970 *= 100;
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(cityRaw, countyRaw, regionRaw, countyWorkplaceData, regionWorkplaceData, tractRaw) {
            cityData    = setupPercents(cityRaw[0]);
            countyData  = setupPercents(countyRaw[0]);
            regionData  = setupPercents(regionRaw[0]);
            tractData = setupPercents(tractRaw[0]);

            countyWorkerData = setupPercents(countyWorkplaceData[0]);
            regionWorkerData = setupPercents(regionWorkplaceData[0]);

            // Join 4 & 5 for simplicity
            function joinData(left, right, key) {
                var i, objectToJoin;
                for (i = 0; i < left.length; i++) {
                    objectToJoin =  _.find(right, {
                        Year: left[i].Year,
                        Workplace_Geo: left[i].Residence_Geo
                    });

                    if (objectToJoin) {
                        left[i].Median_Worker_Inc_PlaceOfEmploy_IA =
                            objectToJoin.Median_Worker_Inc_PlaceOfEmploy_IA;
                    } else {
                        left[i].Median_Worker_Inc_PlaceOfEmploy_IA = null;
                    }
                }
                return left;
            }
            joinData(countyData, countyWorkerData);
            joinData(regionData, regionWorkerData);

            console.log("Got data", regionData);

            // metroData   = setupPercents(metroRaw[0]);
            // tractData   = tractRaw[0];
            // Median Income ($) OR Change in Median Income since 1970 (%)
            // Once we have the data, set up the visualizations
            setupA();
            setupB();
            // setupEC8C();
        }


        // Fetch all the data in one go.
        var sources = [
            'http://54.149.29.2/ec/4/city',
            'http://54.149.29.2/ec/4/county',
            'http://54.149.29.2/ec/4/region',
            'http://54.149.29.2/ec/5/county',
            'http://54.149.29.2/ec/5/region',
            'http://54.149.29.2/ec/4/tract'
        ];
        var requestArray = [];
        var i;
        for (i = 0; i < sources.length; i++) {
            requestArray.push($.ajax({
                dataType: 'json',
                url: sources[i]
            }));
        }
        $.when.apply($, requestArray).done(prepData);

    });
})(jQuery);
