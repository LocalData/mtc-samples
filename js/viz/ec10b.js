/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science,
regionPromise, countyPromise, cityPromise: true
*/
(function($) {
    /*
    Affordability

    B
    100% stacked bar graph of income classes and the 2013 breakdown of share of
    income spent on housing. Dropdown menu should allow user to select a county
    of interest; region mode should be the default, though. X-axis is share of
    population and Y-axis is the income classes; the chunks of the bar graph are
    the various shares (<20%, 20-24, 25-29, 30-34, >35% of income). User should
    be able to hover over the bar and see all data for a given income class in
    that row.

    X-axis: Share of Population
    Y-axis: Household Income

    2013 Housing Affordability by Income Level - "Geography"



    MISC

    TODO

    REQUESTS

    */

    $(function(){
        var i;
        var cityData, countyData, regionData;

        var CHART_BASE_TITLE = '2013 Housing Affordability by Income Level';
        var CHART_ID = '#ec-b-chart';
        var COUNTY_KEY = 'Geography';
        var HOUSEHOLD_KEY = 'Household_Type';
        var YAXIS_LABEL = 'Share of Population'; //'Share of Income Spent on Housing';
        var XAXIS_LABEL = 'Household Income';
        var categories = {};

        var FOCUS_FIELDS = [{
            name: 'Less than 20% of income',
            key: 'H_Share_lessthan20percent'
        },{
            name: '20% to 34% of income',
            key: 'H_Share_20to24percent'
        },{
            name: '25% to 29% of income',
            key: 'H_Share_25to29percent'
        },{
            name: '30% to 34% of income',
            key: 'H_Share_30to34percent'
        },{
            name: 'At least 35% of income',
            key: 'H_Share_morethan35percent'
        }];

        var MAXYEAR = 2013;
        var MINYEAR = 1980;
        var ACTIVE_YEARS = [1980, 1990, 2000, 2009, 2010, 2011, 2012, 2013];
        var YEARNAMES = [];
        for (i = MINYEAR; i <= MAXYEAR; i++) {
            YEARNAMES.push(i);
        }

        var selectedGeography = {};

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

            _.each(FOCUS_FIELDS, function(field) {
                series.push({
                    name: field.name,
                    data: _.pluck(data, field.key)
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

            var title = CHART_BASE_TITLE;

            if (selectedGeography.county) {
                title += ' - ' + selectedGeography.county;
            } else {
                title += ' - Bay Area';
            }

            var options = {
                chart: {
                    type: 'bar'
                },
                title: {
                    text: title
                },
                xAxis: {
                    categories: _.values(categories),
                    tickmarkPlacement: 'on',
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
                    series: {
                        stacking: 'percent'
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


        function setup() {
            chart();

            $("#ec-b-county-select").kendoComboBox({
                text: "Select County...",
                dataTextField: COUNTY_KEY,
                dataValueField: COUNTY_KEY,
                dataSource: [{ 'Geography': 'Bay Area' }].concat(_.uniq(countyData, COUNTY_KEY)),
                select: selectLocation
            });

            var ecaCountySelect = $("#ec-b-county-select").data("kendoComboBox");
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
            var i, j;
            for(i = 0; i < d.length; i++) {
                for (j = 0; j < FOCUS_FIELDS.length; j++) {
                    d[i][FOCUS_FIELDS[j].key] = percent(d[i][FOCUS_FIELDS[j].key]);
                }
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(county, region) {
            countyData = setupNumbers(county[0]);
            regionData = setupNumbers(region[0]);

            // Set up labels / series
            _.each(regionData, function(r) {
                categories[r.Income_Bracket] = r.Income_Bracket_Label;
            });

            // Once we have the data, set up the visualizations
            setup();
        }


        var countyPromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/ec/10/countyInc"
        });
        var regionPromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/ec/10/regionInc"
        });

        $.when(countyPromise, regionPromise).done(prepData);
    });
})(jQuery);
