/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science,
regionPromise, countyPromise, cityPromise: true
*/
(function($) {
    /*
    Fatalaties from Crashes

    A
    Line graph showing historical fatality trends for the region, counties, or
    cities (only EN4 and EN5 available for cities). Button bar allows user to
    choose the metric they are interested in; total fatalities provided by
    default with region upon load. Drop down menus allow the user to select a
    city or county of interest. When in EN5 or EN6 mode, selection of county or
    city should show parent geographies for reference (e.g. Bay Area, Alameda
    County, Berkeley). X-axis should be year and Y-axis should be fatalities
    (total, per-capita, or per-VMT). Hovering over the graph should show the
    relevant data for lines plotted for the year in question with geography
    names.

    Y-axis: Fatalities OR Fatalities per Capita OR
    Fatalities per Vehicle Mile Traveled

    Historical Trend for Fatalities from Crashes


    MISC

    TODO

    REQUESTS

    */

    $(function(){
        var i;
        var regionData, localData;

        var CHART_BASE_TITLE = 'Historical Trend for Fatalities from Crashes';
        var CHART_ID = '#en-a-chart';

        var GEO_KEY = 'Place';
        var CITY_KEY = '';
        var COUNTY_KEY = 'Place';
        var YEAR_KEY = 'Year';

        var TOTAL_KEY = 'Total Killed';
        var RATE_KEY = 'Rate Killed Per 100k Pop';
        var PER_MILE_KEY = 'Rate of Fatalities per 100m VMT';

        var minYear, maxYear;
        var yearNames = [];

        var MODE_FATALITIES = {
            title: 'Historical Trend for Fatalities from Crashes',
            yAxis: 'Fatalities',
            yMin: 0,
            format: "{value:,.0f}",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.0f}</b></td></tr>',
            getSeries: function(data, name) {
                var series = [{
                    name: 'Fatalities - ' + name,
                    data: _.pluck(data, TOTAL_KEY)
                }];
                return series;
            }
        };
        var MODE_PER_CAPITA = {
            title: 'Historical Trend for Fatalities from Crashes',
            yAxis: 'Fatalities per Capita',
            format: "{value:,.1f}",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f}</b></td></tr>',
            getSeries: function(data, name) {
                var series = [{
                    name: 'Fatalities per Capita - ' + name,
                    data: _.pluck(data, RATE_KEY)
                }];
                return series;
            }
        };
        var MODE_PER_MILE = {
            title: 'Historical Trend for Fatalities from Crashes',
            yAxis: 'Fatalities per Vehicle Mile Traveled',
            format: "{value:,.1f}",
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f}</b></td></tr>',
            getSeries: function(data, name) {
                var series = [{
                    name: 'Fatalities per Vehicle Mile Traveled - ' + name,
                    data: _.pluck(data, PER_MILE_KEY)
                }];
                return series;
            }
        };


        var selectedGeography = {};
        var mode = MODE_FATALITIES;

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

        /*
        Get the raw series for the selected geography.
         */
        function getAllSeries() {
            var series = getSeries(regionData, 'Bay Area');

            if (selectedGeography.county) {
                var selectedCountyData = _.filter(localData, {'Place': selectedGeography.county});
                series = series.concat(getSeries(selectedCountyData, selectedGeography.county));
            }

            if (selectedGeography.city) {
                var selectedCityData = _.filter(localData, {'Place': selectedGeography.city});
                series = series.concat(getSeries(selectedCityData, selectedGeography.city));
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
                        // step: 2,
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
                colors: altColors,
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
            combo = $("#en-a-county-select").data("kendoComboBox");
            combo.text('Select County...');
            // combo = $("#en-a-city-select").data("kendoComboBox");
            // combo.text('Select City...');
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

            $('#fatalities').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                mode = MODE_FATALITIES;
                chart();

                $(this).display();
            });
            $('#per-capita').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                mode = MODE_PER_CAPITA;
                chart();

                $(this).display();
            });
            $('#per-mile').click(function(){
                $(this).addClass("active");
                $(this).siblings('a').removeClass('active');

                mode = MODE_PER_MILE;
                chart();

                $(this).display();
            });

            // $("#ec-a-city-select").kendoComboBox({
            //     text: "Select City...",
            //     dataTextField: CITY_KEY,
            //     dataValueField: CITY_KEY,
            //     dataSource: [{ 'City': 'Bay Area' }].concat(_.uniq(localData, GEO_KEY)),
            //     select: selectLocation
            // });
            $("#en-a-county-select").kendoComboBox({
                text: "Select County...",
                dataTextField: COUNTY_KEY,
                dataValueField: COUNTY_KEY,
                dataSource: [{ 'Place': 'Bay Area' }].concat(_.uniq(localData, GEO_KEY)),
                select: selectLocation
            });

            var ecACitySelect = $("#en-a-city-select").data("kendoComboBox");
            var ecACountySelect = $("#en-a-county-select").data("kendoComboBox");
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


        // function setupNumbers(d) {
        //     var i;
        //     for(i = 0; i < d.length; i++) {
        //     }
        //     return d;
        // }


        // Get the data ready to visualize
        function prepData(
            regionTotals,
            localTotals,
            regionRate,
            localRate,
            regionPerMile,
            localPerMile
        ) {

            regionTotals = regionTotals[0];
            localTotals = localTotals[0];
            regionRate = regionRate[0];
            localRate = localRate[0];
            regionPerMile = regionPerMile[0];
            localPerMile = localPerMile[0];

            // Get the years available
            yearNames = [];
            var years = _.pluck(regionTotals, YEAR_KEY);
            var maxYear = _.max(years);
            var minYear = _.min(years);
            for (i = minYear; i <= maxYear; i++) {
                yearNames.push(i);
            }

            // Combine all the regional data
            regionData = _.merge(regionTotals, regionRate, regionPerMile);

            // Combine all the city data
            localData = [];
            _.each(localTotals, function(l) {
                var perMile = _.find(localPerMile, {
                    Year: l.Year,
                    Place: l.Place
                });
                var rate = _.find(localRate, {
                    Year: l.Year,
                    Place: l.Place
                });

                l[RATE_KEY] = rate[RATE_KEY] || null;
                l[PER_MILE_KEY] = perMile[PER_MILE_KEY] || null;
                localData.push(l);
            });

            // Once we have the data, set up the visualizations
            setup();
        }


        // Request all the data
        var regionTotalsPromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/en/4/region"
        });
        var localTotalsPromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/en/4/local"
        });

        var regionRatePromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/en/5/region"
        });
        var localRatePromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/en/5/local"
        });

        var regionPerMilePromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/en/6/region"
        });
        var localPerMilePromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/en/6/local"
        });


        $.when(
            regionTotalsPromise,
            localTotalsPromise,
            regionRatePromise,
            localRatePromise,
            regionPerMilePromise,
            localPerMilePromise
        ).done(prepData);

    });
})(jQuery);
