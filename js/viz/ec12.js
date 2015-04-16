/*globals jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science: true */
(function($) {
    /*
    Job Creation

    A
    Stacked bar graph showing regional historical trend of jobs by industry by
    default. Using dropdown menu, user can select a county of interest to see
    its historical trend. X-axis should be years and Y-axis should be the number
    of jobs. User should be able to turn on or off the bar chunks as needed.
    Hovering over the bars should show the number and share of jobs for that
    geography for the year selected (for example: 1991 "Professional & Business
    Services: XXXXX (YY.Y%), etc.)
    Similar to T1-2-C (but without 100% sum)
    http://econ-mtc-vital-signs.pantheon.io/sites/all/themes/vitalsigns/js/t1t2c.js?nm1pp4
    http://econ-mtc-vital-signs.pantheon.io/commute-mode-choice


    B
    Line graph showing the change in jobs in each industry sector since 1991.
    Regional data shows by default. Using dropdown menu, user can select a
    county of interest to see its trend. X-axis should be years starting in 1990
    and Y-axis should be % change in jobs with a line for each industry displayed.
    User should be able to turn on or off the lines as needed. Hovering over the
    lines should show the performance of all industries for that year (+X%, +Y%,
    -Z%, etc.) in popup.
    LU-1-A

    C
    See PowerPoint presentation. *** User should be able to generate each of
    those bubble charts by selecting her county from dropdown menu; by default,
    should show regional data. X-axis is job growth and Y-axis is location
    quotient. Hovering over a bubble should list the X, Y data points for that
    bubble. Bubbles should be sized based on the number of jobs. The color
    should be dictated by quadrants (see PowerPoint quadrants) - green for
    upper-right, yellow for upper-left and lower-right, and red for lower-left.
    Call MTC for more information if needed - this is a complex interactive.


    D
    100% stacked bar graph showing the 10 metros' breakdown of total jobs in
    2013. No dropdown menus or button bars. X-axis is share of jobs and Y-axis
    is the 10 metros with Bay Area bolded. Hovering over a metro should yield a
    popup with the breakdown of jobs (number and %) for that metro.
    T1-2-C
    http://econ-mtc-vital-signs.pantheon.io/sites/all/themes/vitalsigns/js/t1t2c.js?nm1pp4
    http://econ-mtc-vital-signs.pantheon.io/commute-mode-choice


    MISC

    TODO


    Requests
    */

    var i;

    var DASH_FORMAT = 'ShortDash';

    var FOCUSYEAR = 2013;
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


    var EC1_KEYS = ["Farm","MLC","Manuf","TTU","Inform","FA","PBS","EHS","LH","Govt", "Other"];
    var EC2_KEYS = ["pctchng_EHS","pctchng_FA","pctchng_Farm","pctchng_Govt", "pctchng_Inform","pctchng_LH","pctchng_Manuf","pctchng_MLC", "pctchng_Other", "pctchng_PBS","pctchng_TTU"];

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
                    dashStyle: DASH_FORMAT
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
                    dashStyle: DASH_FORMAT
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

            var bottomText = "<div class='col-lg-6'><h4>Lowest Rents</h4>";
            _.each(bottom5, function(city, i) {
                bottomText += "<h6>" + (i+1) + '. ' + city.City + ": $" + city[MEDIAN_RENT_ADJUSTED].toLocaleString() + "</h6>";
            });
            bottomText += '</div>';
            $("#ec-b-bottom-cities").html(bottomText);

            var topText = "<div class='col-lg-6'><h4>Highest Rents</h4>";
            _.each(top5, function(city, i) {
                topText += "<h6>"  + (i+1) + '. ' + city.City + ": >$" + city[MEDIAN_RENT_ADJUSTED].toLocaleString() + "</h6>";
            });
            topText += '</div>';
            $("#ec-b-top-cities").html(topText);
        }

        function ecbBarChart(series, options) {
            console.log("Chart with data", series, options);
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
                colors: econColors
            });
        }

        function ec8MapInteraction(data) {
            console.log("Map interation with data", data);

            var cityName = 'cityName'; //feature.properties.City;
            var countyName = data.county;
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
                    data.tract + ' in 2013 was ' + '$' +
                    data.median_contract_rent_ia.toLocaleString(),
                data: [
                    data.median_contract_rent_ia,
                    null, // City TODO
                    county2013.Median_Contract_Rent_IA,
                    region2013.Median_Contract_Rent_IA
                ]
            }];

            ecbBarChart(series, {
                categories: [
                    'Tract ' + data.tract,
                    cityName,
                    countyName,
                    'Bay Area'
                ]
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
            // L.mapbox.accessToken = 'pk.eyJ1IjoicG9zdGNvZGUiLCJhIjoiWWdxRTB1TSJ9.phHjulna79QwlU-0FejOmw';
            // var map = L.mapbox.map('map', 'postcode.kh28fdpk', {
            //     infoControl: true,
            //     attributionControl: false,
            //     center: [37.783367, -122.062378],
            //     zoom: 10,
            //     minZoom: 8
            // });
            // L.control.scale().addTo(map);

            // Prep the tract data
            var focusYearData = _.filter(tractData, {'Year': FOCUSYEAR});
            var joinedFeatures = [];
            var breaks = getRange(focusYearData, 'Median_Contract_Rent_IA');

            console.log("Setting up map");

            cartodb.createVis('map', 'http://mtc.cartodb.com/api/v2/viz/3c4a4858-dd38-11e4-a2a8-0e0c41326911/viz.json')
              .done(function(vis, layers) {
                // layer 0 is the base layer, layer 1 is cartodb layer
                layers[1].setInteraction(true);

                // layers[1].getSubLayer(0).setInteractivity(CARTO_FIELDS);
                layers[1].on('featureClick', function(e, latlng, pos, data, layerNumber) {
                    ec8MapInteraction(data);
                });

                // you can get the native map to work with it
                var map = vis.getNativeMap();

                // Add the legend
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

                    var legendText = '<div><div class="col-lg-1" style="background:' + econColors[i] + ';">&nbsp; </div><div class="col-lg-10">';
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

                var container = L.DomUtil.create('div', 'map-legends wax-legends');
                var legend = L.DomUtil.create('div', 'map-legend wax-legend', container);
                console.log("Created legend text", $(div).html());
                console.log("Created legend", legend);
                // TODO
                // legend.innerHTML($(div).html());

                // legendControl.addTo(map);


              });





            function style(feature) {
                var color;
                var data = _.find(focusYearData, { Tract: parseInt(feature.properties.TRACT.slice(5), 10) });
                if (!data) {
                    console.log("Missing data for", feature.properties);
                }
                feature.properties = _.merge(feature.properties, data);
                var u = feature.properties.Median_Contract_Rent_IA;
                if (u > breaks[3]) {
                    color = econColors[4];
                } else if (u > breaks[2]) {
                    color = econColors[3];
                } else if (u > breaks[1]) {
                    color = econColors[2];
                } else if (u > breaks[0]) {
                    color = econColors[1];
                } else {
                    color = econColors[0];
                }
                return {
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.8,
                  weight: 0.5
                };
            }
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

            $('#ec-c-chart').highcharts(options);
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

        function round(n) {
            if (n === null) {
                return n;
            }

            return Math.round(n/100) * 100;
        }


        function setupNumbers(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                _.each(EC1_KEYS, function(k) {
                    d[i][k] *= 100;
                });
                _.each(EC1_KEYS, function(k) {
                    d[i][k] = round(d[i][k]);
                });
            }
            return d;
        }

        function joinData(left, right) {
            var i, objectToJoin;
            for (i = 0; i < left.length; i++) {
                objectToJoin =  _.find(right, {
                    Year: left[i].Year,
                    Workplace_Geo: left[i].Residence_Geo
                });

                left = _.assign(left[i], objectToJoin);
            }
            return left;
        }

        // Get the data ready to visualize
        function prepData(region1, region2, county1, county2, metro) {
            region1     = setupNumbers(region1[0]);
            region2     = setupNumbers(region2[0]);
            county1     = setupNumbers(county1[0]);
            county2     = setupNumbers(county2[0]);
            metroData   = setupNumbers(metro[0]);

            // Once we have the data, set up the visualizations
            setupECA();
            setupECB();
            // setupBubbles();
            setupECD();
        }


        // Request all the data
        var regionPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/1/region"
        });
        var region2Promise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/2/region"
        });
        var countyPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/1/county"
        });
        var county2Promise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/2/county"
        });
        var metroPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/1/metro"
        });

        // Technically it could be faster to group these into separate listeners
        // but the requests are quite fast, and it's simpler to do the data cleaning
        // all at once.
        $.when(regionPromise, region2Promise, countyPromise, county2Promise, metroPromise).done(prepData);
    });
})(jQuery);
