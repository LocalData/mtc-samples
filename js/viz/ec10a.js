/*globals
jQuery, L, cartodb, geocities, allYellow, altColors, Highcharts, science,
regionPromise, countyPromise, cityPromise: true
*/
(function($) {
    /*

    Affordability

    A
    Area graph should show the three affordability classes (<20%, 20-35%, >35%
    of income) for all hosueholds and at the regional level by default. Two
    dropdown menus should allow the user to customize the graph - one that
    allows the user to focus on a specific county and one that allows the user
    to choose from All Households, Renter Households, Owner Households. The two
    dropdown menus need to work in tandem. X-axis should be years from 1980 to
    2013, Y-axis should be share of population. Hovering over the graph should
    show data for the selected year across the three affordability classes.


    Y-axis: Share of Population Historical Trend for Housing Affordability for "Type" - "Geography"
    (where "Type" = All Households, Renter Households, Owner Households)

    Should show color swatch and housing share bin


    MISC

    TODO

    REQUESTS

    */

    $(function(){
        var i;
        var cityData, countyData, regionData;

        var CHART_BASE_TITLE = 'Share of Population Historical Trend for Housing Affordability for ';
        var CHART_ID = '#ec-a-chart';
        var COUNTY_KEY = 'Geography';
        var HOUSEHOLD_KEY = 'Household_Type';
        var YAXIS_LABEL = 'Share of Population';
        var XAXIS_LABEL = '';

        var FOCUS_FIELDS = [{
            name: '<20% of income',
            key: 'H_Share_lessthan20percent'
        },{
            name: '20-34',
            key: 'H_Share_20to34percent'
        },{
            name: '>35%',
            key: 'H_Share_morethan35percent'
        }];

        var MAXYEAR = 2013;
        var MINYEAR = 1980;
        var ACTIVE_YEARS = [1980, 1990, 2000, 2009, 2010, 2011, 2012, 2013];
        var YEARNAMES = [];
        for (i = MINYEAR; i <= MAXYEAR; i++) {
            YEARNAMES.push(i);
        }

        var MODE_1 = {
            title: 'All Households',
            val: 'All'
        };
        var MODE_2 = {
            title: 'Renter Households',
            val: 'Renter'
        };
        var MODE_3 = {
            title: 'Owner Households',
            val: 'Owner'
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
            } else {
                return this.value;
            }
        }


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


        function getAllSeries() {
            var data = regionData;
            var series = [];

            if (selectedGeography.county) {
                data = _.filter(countyData, {'Geography': selectedGeography.county});
            }

            // Filter down to the selected mode
            data = _.filter(data, { 'Household_Type': mode.val });

            _.each(FOCUS_FIELDS, function(field) {
                series.push({
                    name: field.name,
                    data: fillInBlanks(_.pluck(data, field.key)),
                    connectNulls: true
                });
            });

            return series;
        }

        function chart() {
            var series = getAllSeries();

            var tooltip = {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            };

            var title = CHART_BASE_TITLE + mode.title;

            if (selectedGeography.county) {
                title += ' - ' + selectedGeography.county;
            }

            if (!selectedGeography.county) {
                title += ' - Bay Area';
            }

            var options = {
                chart: {
                    type: 'area'
                },
                title: {
                    text: title
                },
                xAxis: {
                    categories: YEARNAMES,
                    tickmarkPlacement: 'on',
                    labels: {
                        step: 5
                    },
                    title: {
                        text: XAXIS_LABEL
                    }
                },
                yAxis: {
                    title: {
                        text: YAXIS_LABEL
                    },
                    labels: {
                        format: '{value:,.0f}%'
                    },
                    reversedStacks: true,
                    stackLabels: {
                        enabled: false
                    }
                },
                legend: {
                    enabled: true
                },
                colors: altColors,
                plotOptions: {
                    area: {
                        stacking: 'percent',
                        lineColor: '#ffffff',
                        lineWidth: 1,
                        marker: {
                            lineWidth: 1,
                            lineColor: '#ffffff'
                        }
                    }
                },
                tooltip: tooltip,
                series: series
            };


            $(CHART_ID).highcharts(options);
        }


        function selectLocation(e) {
            selectedGeography = {};
            var series = [];
            if (!e) {
                return;
            }

            // Has a county been selected?
            var location = this.dataItem(e.item.index());

            if (location[COUNTY_KEY] === 'Bay Area') {
                chart();
                return;
            }

            selectedGeography.county = location[COUNTY_KEY];

            chart();
        }


        function selectMode(e) {
            var selectedMode = this.dataItem(e.item.index()).title;
            if (selectedMode === MODE_1.title) {
                mode = MODE_1;
            }
            if (selectedMode === MODE_2.title) {
                mode = MODE_2;
            }
            if (selectedMode === MODE_3.title) {
                mode = MODE_3;
            }

            chart();
        }


        function setup() {
            chart(CHART_ID);


            $("#ec-a-mode-select").kendoComboBox({
                text: "Select household type...",
                dataTextField: 'title',
                dataValueField: 'title',
                dataSource: [MODE_1, MODE_2, MODE_3],
                select: selectMode
            });
            $("#ec-a-county-select").kendoComboBox({
                text: "Select County...",
                dataTextField: COUNTY_KEY,
                dataValueField: COUNTY_KEY,
                dataSource: [{ 'Geography': 'Bay Area' }].concat(_.uniq(countyData, COUNTY_KEY)),
                select: selectLocation
            });

            var ecAModeSelect = $("#ec-a-mode-select").data("kendoComboBox");
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
                 d[i][FOCUS_FIELDS[0].key] = percent(d[i][FOCUS_FIELDS[0].key]);
                 d[i][FOCUS_FIELDS[1].key] = percent(d[i][FOCUS_FIELDS[1].key]);
                 d[i][FOCUS_FIELDS[2].key] = percent(d[i][FOCUS_FIELDS[2].key]);
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(county, region) {
            countyData = setupNumbers(county[0]);
            regionData = setupNumbers(region[0]);

            // Once we have the data, set up the visualizations
            setup();
        }


        var countyPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/10/county"
        });
        var regionPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/10/region"
        });

        $.when(countyPromise, regionPromise).done(prepData);
    });
})(jQuery);
