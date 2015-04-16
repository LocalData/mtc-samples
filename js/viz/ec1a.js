/*globals jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science: true */
(function($) {
    /*
    Job creation

    A
    Stacked bar graph showing regional historical trend of jobs by industry by
    default. Using dropdown menu, user can select a county of interest to see
    its historical trend. X-axis should be years and Y-axis should be the number
    of jobs. User should be able to turn on or off the bar chunks as needed.
    Hovering over the bars should show the number and share of jobs for that
    geography for the year selected (for example: 1991 "Professional & Business
    Services: XXXXX (YY.Y%), etc.)
    Similar to T1-2-C (but without 100% sum)
    http://econ-mtc-vital-signs.pantheon.io/sites/all/themes/vitalsigns/js/t1t2c.js
    http://econ-mtc-vital-signs.pantheon.io/commute-mode-choice

    Y-axis: Number of Jobs
    Historical Trend for Jobs by Industry - "Geography" S


    MISC

    TODO

    REQUESTS

    */

    var i;

    var DASH_FORMAT = 'ShortDash';
    var COUNTY_KEY = 'GeoName';
    var INDUSTRIES = {
        "EHS": "Education & Health Services",
        "Farm": "Farm",
        "FA": "Financial Activities",
        "Govt": "Government",
        "Inform": "Information",
        "Manuf": "Manufacturing",
        "MLC": "Mining, Logging & Construction",
        "LH": "Leisure & Hospitality",
        "Other": "Other",
        "PBS": "Professional & Business Services",
        "TTU": "Trade, Transportation & Utilities"
    };

    var FOCUSYEAR = 2013;
    var FIRSTYEAR = 1970;
    var MAXYEAR = 2013;
    var YEARNAMES = [];
    for (i = 1990; i <= 2013; i++) {
        YEARNAMES.push(i);
    }

    var regionData, countyData;
    var ecaToggle = 'Median Rents';
    var selectedGeography = 'Bay Area';

    $(function(){
        Highcharts.setOptions({
            lang: {
                decimalPoint: '.',
                thousandsSep: ','
            }
        });

        /* -- EC-8 A (Regional rent graph) -----------------------------------*/
        function formatter() {
            if (this.value === 'Bay Area') {
                return '<span style="font-weight:800;color:#000;">' + this.value + '</span>';
            } else {
                return this.value;
            }
        }

        function graph(id, series) {
            var tooltip = {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.0f}</b> ({point.percentage:,.1f}%)</td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            };

            var options = {
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Historical Trend for Jobs by Industry'
                },
                xAxis: {
                    categories: YEARNAMES,
                    labels: {
                        formatter: formatter
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Number of Jobs'
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
                    column: {
                        stacking: 'normal'
                    }
                },
                tooltip: tooltip,
                series: series
            };

            if (!selectedGeography) {
                selectedGeography = 'Bay Area';
            }

            options.title.text += ' - ' + selectedGeography;

            $(id).highcharts(options);
        }

        function getSeries(data) {
            var series = [];
            _.each(INDUSTRIES, function(industry, key) {
                series.push({
                    name: industry,
                    data: _.pluck(data, key)
                });
            });
            return series;
        }

        function selectLocation(e) {
            if (!e) {
                selectedGeography = null;
                graph('#ec-a-chart', getSeries(regionData));
                return;
            }

            // e might be an event or actual location data.
            var location;
            if (e.GeoName) {
                location = e;
            } else {
                location = this.dataItem(e.item.index());
            }

            var county = location[COUNTY_KEY];
            selectedGeography = county;

            if (selectedGeography === 'Bay Area') {
                graph('#ec-a-chart', getSeries(regionData));
                return;
            }

            var selectedCountyData = _.filter(countyData, {'GeoName': county});

            graph('#ec-a-chart', getSeries(selectedCountyData, county));
        }

        function setupECA() {
            graph('#ec-a-chart', getSeries(regionData, 'Regional'));

            // Set up select boxes for county / city search
            // Could potentially use a cascading combo box:
            // http://demos.telerik.com/kendo-ui/combobox/cascadingcombobox
            var counties =  [{ GeoName: 'Bay Area' }].concat(_.uniq(countyData, COUNTY_KEY));
            $("#ec-a-county-select").kendoComboBox({
                text: "Select County...",
                dataTextField: COUNTY_KEY,
                dataValueField: COUNTY_KEY,
                dataSource: counties,
                select: selectLocation
            });

            var ec8CountySelect = $("#ec-a-county-select").data("kendoComboBox");
        }


        function round(n) {
            if (n === null) {
                return n;
            }

            return Math.round(n/100) * 100;
        }


        function setupCounties(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                d[i][COUNTY_KEY] = d[i][COUNTY_KEY] + ' County';
            }
            return d;
        }


        function setupNumbers(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                _.each(INDUSTRIES, function(v, k) {
                    d[i][k] = round(d[i][k]);
                });
            }
            return d;
        }

        // Get the data ready to visualize
        function prepData(region, county) {
            regionData = setupNumbers(region[0]);
            countyData = setupNumbers(setupCounties(county[0]));

            // Once we have the data, set up the visualizations
            setupECA();
        }

        // Request all the data
        var regionPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/1/region"
        });
        var countyPromise = $.ajax({
            dataType: "json",
            url: "http://54.149.29.2/ec/1/county"
        });

        $.when(regionPromise, countyPromise).done(prepData);
    });
})(jQuery);
