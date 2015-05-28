/*globals jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science: true */
(function($) {
    /*
    Job creation

    B
    Line graph showing the change in jobs in each industry sector since 1991.
     Regional data shows by default. Using dropdown menu, user can select a
     county of interest to see its trend. X-axis should be years starting in
     1990 and Y-axis should be % change in jobs with a line for each industry
     displayed. User should be able to turn on or off the lines as needed.
     Hovering over the lines should show the performance of all industries for
     that year (+X%, +Y%, -Z%, etc.) in popup.    Services: XXXXX (YY.Y%), etc.)

    MISC

    TODO

    REQUESTS

    */

    var i;

    var DASH_FORMAT = 'ShortDash';
    var COUNTY_KEY = 'GeoName';
    var INDUSTRIES = {
        "pctchng_EHS": "Education & Health Services",
        "pctchng_Farm": "Farm",
        "pctchng_FA": "Financial Activities",
        "pctchng_Govt": "Government",
        "pctchng_Inform": "Information",
        "pctchng_LH": "Leisure & Hospitality",
        "pctchng_Manuf": "Manufacturing",
        "pctchng_MLC": "Mining, Logging & Construction",
        "pctchng_Other": "Other",
        "pctchng_PBS": "Professional & Business Services",
        "pctchng_TTU": "Trade, Transportation & Utilities"
    };

    var FOCUSYEAR = 2013;
    var FIRSTYEAR = 1970;
    var MAXYEAR = 2013;
    var YEARNAMES = [];
    for (i = 1990; i <= 2013; i++) {
        YEARNAMES.push(i);
    }

    var regionData, countyData;
    var ECBToggle = 'Median Rents';
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
                    text: 'Historical Trend for Job Growth by Industry'
                },
                xAxis: {
                    categories: YEARNAMES
                },
                yAxis: {
                    title: {
                        text: 'Percent Change in Jobs since 1990'
                    },
                    labels: {
                        format: '{value:,.0f}%'
                    }
                },
                legend: {
                    reversed: false
                },
                colors: altColors,
                tooltip: tooltip,
                series: series
            };

            if (selectedGeography) {
                options.title.text += ' - ' + selectedGeography;
            }

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
                graph('#ec-b-chart', getSeries(regionData));
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
                graph('#ec-b-chart', getSeries(regionData));
                return;
            }

            var selectedCountyData = _.filter(countyData, {'GeoName': county});

            graph('#ec-b-chart', getSeries(selectedCountyData, county));
        }

        function setupECB() {
            graph('#ec-b-chart', getSeries(regionData, 'Regional'));

            // Set up select boxes for county / city search
            // Could potentially use a cascading combo box:
            // http://demos.telerik.com/kendo-ui/combobox/cascadingcombobox
            var counties =  [{ GeoName: 'Bay Area' }].concat(_.uniq(countyData, COUNTY_KEY));
            $("#ec-b-county-select").kendoComboBox({
                text: "Select County...",
                dataTextField: COUNTY_KEY,
                dataValueField: COUNTY_KEY,
                dataSource: counties,
                select: selectLocation
            });

            var ec8CountySelect = $("#ec-b-county-select").data("kendoComboBox");
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
                    d[i][k] *= 100;
                });
            }
            return d;
        }

        // Get the data ready to visualize
        function prepData(region, county) {
            regionData = setupNumbers(region[0]);
            countyData = setupNumbers(setupCounties(county[0]));

            // Once we have the data, set up the visualizations
            setupECB();
        }

        // Request all the data
        var regionPromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/ec/2/region"
        });
        var countyPromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/ec/2/county"
        });

        $.when(regionPromise, countyPromise).done(prepData);
    });
})(jQuery);
