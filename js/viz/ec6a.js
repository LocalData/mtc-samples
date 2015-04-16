/*globals
jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/
(function($) {
    /*
    Labor force participation

    A
    Clustered column graph showing the labor force participation rates clustered
    by age group for the following years: 1980, 1990, 2000, 2010, 2013. Region
    by default, but user can select her county from dropdown menu. Hovering over
    graph shows all datapoints for the age group in question in tooltip (e.g.
    16-19 years old 1980: X%, 1990: Y%, ...). All age groups should be included,
    with a combined section (all age groups in bold) on the left side of the
    graph.

    X-axis should be age categories, Y-axis should be labor force
    participation.

    Chart title:
    Historical Trend for Labor Force Participation by Age Group - "Geography"


    MISC

    TODO

    REQUESTS

    */

    $(function(){
        var CHART_BASE_TITLE = 'Historical Trend for Labor Force Participation by Age Group';
        var LABOR_TOTALS = {
            'NUMLF_1619': '16-19',
            'NUMLF_2024': '20-24',
            'NUMLF_2544': '25-44',
            'NUMLF_4554': '45-54',
            'NUMLF_5564': '55-64',
            'NUMLF_65xx': '65+'
        };
        var LABOR_PERCENTS = {
            'LF_16xx': '<b>All age groups</b>',
            'LF_1619': '16-19',
            'LF_2024': '20-24',
            'LF_2544': '25-44',
            'LF_4554': '45-54',
            'LF_5564': '55-64',
            'LF_65xx': '65+'
        };

        var YEARNAMES = [1980, 1990, 2000, 2010, 2013];
        var DASH_FORMAT = 'ShortDash';
        var COUNTY_KEY = 'CountyName';

        var i;
        var regionData, countyData;
        var selectedGeography = 'Bay Area';

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
            console.log("Graphing", series);

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
                    type: 'column'
                },
                title: {
                    text: CHART_BASE_TITLE
                },
                xAxis: {
                    categories: _.values(LABOR_PERCENTS),
                    labels: {
                        formatter: formatter
                    },
                    title: {
                        text: 'Age Group'
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Labor Force Participation'
                    },
                    reversedStacks: false,
                    stackLabels: {
                        enabled: false
                    },
                    labels: {
                        format: "{value:,.0f}%"
                    }
                },
                legend: {
                    enabled: true
                },
                colors: altColors,
                plotOptions: {
                },
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

            _.each(data, function(d) {
                var vals = [];
                _.each(LABOR_PERCENTS, function(v, k) {
                    vals.push(d[k]);
                });

                series.push({
                    name: d.Year,
                    data: vals
                });
            });
            return series;
        }

        function selectLocation(e) {
            if (!e) {
                selectedGeography = 'Bay Area';
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

            var selectedCountyData = _.filter(countyData, {'CountyName': county});

            graph('#ec-a-chart', getSeries(selectedCountyData, county));
        }

        function setup() {
            graph('#ec-a-chart', getSeries(regionData, 'Regional'));

            // Set up select boxes for county / city search
            // Could potentially use a cascading combo box:
            // http://demos.telerik.com/kendo-ui/combobox/cascadingcombobox
            var counties =  [{ CountyName: 'Bay Area' }].concat(_.uniq(countyData, COUNTY_KEY));
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


        function percent(n) {
            return n * 100;
        }


        function setupNumbers(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                _.each(LABOR_PERCENTS, function(v, k) {
                    d[i][k] = percent(d[i][k]);
                });
            }
            return d;
        }


        function setupCounties(d) {
            var i;
            for(i = 0; i < d.length; i++) {
                d[i][COUNTY_KEY] = d[i][COUNTY_KEY] + ' County';
            }
            return d;
        }


        // Get the data ready to visualize
        function prepData(region, county) {
            regionData = setupNumbers(_.clone(region[0], true));
            countyData = setupNumbers(setupCounties(_.clone(county[0], true)));

            // Once we have the data, set up the visualizations
            setup();
        }

        $.when(regionPromise, countyPromise).done(prepData);
    });
})(jQuery);
