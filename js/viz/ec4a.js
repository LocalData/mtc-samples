/*globals jQuery, L, geocities, cartodb, econColors, altColors,
Highcharts, science, requestArray: true */

(function($) {
    /*
    http://vitalsigns-production.elasticbeanstalk.com/ec/3/city
    http://vitalsigns-production.elasticbeanstalk.com/ec/3/county
    http://vitalsigns-production.elasticbeanstalk.com/ec/3/region

    A
    Line graph showing the incomes of residents and workers for a selected
    geography. Default to region on load with two lines shown. User can select
    county or city from dropdown menus to get localized data - overlay so both
    county and region (or city and county) are shown on same graph. User can
    hover over any year to see all data points for that year. X-axis should be
    year, Y-axis should be income. User should be able to use button bar to
    switch from Median Incomes to % Growth in Median Income since 1970 (no
    worker data for that mode).
    "http:// vitalsigns-production.elasticbeanstalk.com/ec/4/city
    http:// vitalsigns-production.elasticbeanstalk.com/ec/4/county
    http:// vitalsigns-production.elasticbeanstalk.com/ec/4/region
    http:// vitalsigns-production.elasticbeanstalk.com/ec/5/county
    http:// vitalsigns-production.elasticbeanstalk.com/ec/5/region"
    Y-axis: Median Income ($) OR Change in Median Income since 1970 (%)
    Historical Trend for Median Income - "Geography"
    LU1-A


    */

    var i;

    var CHART_ID = '#ec-a-chart';

    var DASH = 'ShortDash';

    // Pairs of colors used for related datasets from the same location
    var COLOR_PAIRS = [
        altColors[0],
        altColors[0],
        altColors[1],
        altColors[1],
        altColors[2],
        altColors[2]
    ];

    var METRO_NAME_KEY = 'Metro Name'; // key for metro names

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
    var ecAToggle = 'Income'; // Default mode of interactive A
    var ecCToggle = 'Median Income'; // Default mode of interactive C
    var selectedGeography = 'Bay Area';

    // Use econ purple as the first color
    altColors[4] = altColors[0];
    altColors[0] = econColors[1];


    $(function(){

        // Set explicit decimal separators
        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });

        /* -- Interactive A --------------------------------------------------*/

        function chart(series) {
            var colors;

            if (ecAToggle === 'Income') {
                colors = COLOR_PAIRS;
            } else {
                colors = altColors;
            }

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
                    categories: YEARNAMES,
                    tickmarkPlacement: 'on',
                    labels: {
                        step: 5,
                        staggerLines: 1
                    }
                },
                yAxis: {
                    title: {
                        text: 'Income (inflation-adjusted)'
                    },
                    labels: {
                        format: "${value:,.0f}"
                    }
                },
                legend: {
                    reversed: false,
                    symbolWidth: 35
                },
                tooltip: tooltip,
                colors: colors,
                series: series
            };

            if (ecAToggle === 'Income') {
                options.title.text = 'Historical Trend for Median Income';

                options.yAxis.labels = {
                    format: "${value:,.0f}"
                };
            } else {
                options.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>';
                options.title.text = 'Historical Trend for Median Income';

                options.yAxis.labels = {
                    format: "{value}%"
                };
            }

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


        function getSeries(data, geography) {
            var name, series;
            var lineWidth = 1.5;
            if (!geography) {
                lineWidth = 3;
                geography = 'Bay Area';
            }

            if (ecAToggle === 'Income') {
                name = 'Median Household Income';
                if (geography) {
                    name = geography + ' - ' + 'Household';
                }
                series = [{
                    name: name,
                    data: fillInBlanks(_.pluck(data, MEDIAN_HOUSEHOLD_INCOME)),
                    connectNulls: true,
                    lineWidth: lineWidth
                }];

                // Median worker income only available for counties & region
                if (_.has(data[0], MEDIAN_WORKER_INCOME) || name === '') {
                    // name = 'Median Worker Income';
                    if (geography) {
                        name =  geography + ' - ' + 'Worker';
                    }
                    series.push({
                        name: name,
                        data: fillInBlanks(_.pluck(data, MEDIAN_WORKER_INCOME)),
                        connectNulls: true,
                        dashStyle: DASH,
                        lineWidth: lineWidth
                    });
                }
            } else {
                name = '% Growth in Median Household Income';
                if (geography) {
                    name = geography + ' - ' + 'Household';
                }
                series = [{
                    name: name,
                    data: fillInBlanks(_.pluck(data, MEDIAN_HOUSEHOLD_INCOME_CHANGE)),
                    connectNulls: true,
                    lineWidth: lineWidth
                }];
            }

            return series;
        }

        function selectLocation(e) {
            if (!e) {
                selectedGeography = null;
                chart(getSeries(regionData, 'Bay Area'));
                return;
            }
            // e might be an event or actual location data.

            var location;
            if (e.Residence_Geo) {
                location = e;
            } else {
                location = this.dataItem(e.item.index());
            }

            var city, county;

            county = location.Residence_Geo;
            if (county === 'Bay Area') {
                selectedGeography = 'Bay Area';
                chart(getSeries(regionData, 'Bay Area'));
                return;
            }

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
            graphData = graphData.concat(getSeries(regionData));

            // Get the county data.
            var selectedCountyData = _.filter(countyData, {'Residence_Geo': county});
            graphData = graphData.concat(getSeries(selectedCountyData, county));


            // Push the city data, if any.
            if (city) {
                var selectedCityData = _.filter(cityData, {'Residence_Geo': city});
                var citySeries = getSeries(selectedCityData, city);
                citySeries[0].data = cityBlanks(citySeries[0].data);
                graphData = graphData.concat(citySeries);
            }

            chart(graphData);
        }

        function setup() {
            chart(getSeries(regionData));

            // Set up select boxes for county / city search
            // Could potentially use a cascading combo box:
            // http://demos.telerik.com/kendo-ui/combobox/cascadingcombobox
            var baseSelect = [{'Residence_Geo': 'Bay Area'}];

            $("#ec-a-city-select").kendoComboBox({
                text: "Select City...",
                dataTextField: "Residence_Geo",
                dataValueField: "Residence_Geo",
                dataSource: baseSelect.concat(_.uniq(cityData, 'Residence_Geo')),
                select: selectLocation
            });
            $("#ec-a-county-select").kendoComboBox({
                text: "Select County...",
                dataTextField: "Residence_Geo",
                dataValueField: "Residence_Geo",
                dataSource: baseSelect.concat(_.uniq(countyData, 'Residence_Geo')),
                select: selectLocation
            });

            var ecACitySelect = $("#ec-a-city-select").data("kendoComboBox");
            var ecACountySelect = $("#ec-a-county-select").data("kendoComboBox");

            $('#median-incomes').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                ecAToggle = "Income";

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

                ecAToggle = "% Growth in Median Income since 1970";

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

        function round(n) {
            if (n === null) {
                return n;
            }

            return Math.round(n/100) * 100;
        }

        function setupNumbers(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                // Set up percents
                if (d[i][MEDIAN_HOUSEHOLD_INCOME_CHANGE] !== null) {
                    d[i][MEDIAN_HOUSEHOLD_INCOME_CHANGE] *= 100;
                }

                // Round up to nearest hundred
                d[i][FOCUS_KEY] = round(d[i][FOCUS_KEY]);

                if (_.has(d[i], MEDIAN_WORKER_INCOME)) {
                    d[i][MEDIAN_WORKER_INCOME] = round(d[i][MEDIAN_WORKER_INCOME]);
                }
            }
            return d;
        }

        // Get the data ready to visualize
        function prepData(cityRaw, countyRaw, regionRaw, countyWorkplaceData, regionWorkplaceData, tractRaw, metroRaw, metroWorkplaceRaw) {
            cityData    = setupNumbers(cityRaw[0]);
            countyData  = setupNumbers(countyRaw[0]);
            regionData  = setupNumbers(regionRaw[0]);
            tractData   = setupNumbers(tractRaw[0]);

            metroData              = setupNumbers(metroRaw[0]);
            var metroWorkplaceData = setupNumbers(metroWorkplaceRaw[0]);

            countyWorkerData = setupNumbers(countyWorkplaceData[0]);
            regionWorkerData = setupNumbers(regionWorkplaceData[0]);

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
            joinData(metroData, metroWorkplaceData);

            // metroData   = setupPercents(metroRaw[0]);
            // tractData   = tractRaw[0];
            // Median Income ($) OR Change in Median Income since 1970 (%)
            // Once we have the data, set up the visualizations
            setup();
        }

        $.when.apply($, requestArray).done(prepData);

    });
})(jQuery);
