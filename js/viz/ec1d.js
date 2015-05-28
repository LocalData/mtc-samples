/*globals jQuery, L, cartodb, geocities, econColors, altColors, Highcharts, science: true */
(function($) {
    /*
    Job creation

    D
    100% stacked bar graph showing the 10 metros' breakdown of total jobs in
    2013. No dropdown menus or button bars. X-axis is share of jobs and Y-axis
    is the 10 metros with Bay Area bolded. Hovering over a metro should yield a
    popup with the breakdown of jobs (number and %) for that metro.


    MISC

    TODO

    REQUESTS

    */

    var i;

    var CHART_TITLE = 'Metro Comparison for 2013 Jobs by Industry';
    var DASH_FORMAT = 'ShortDash';
    var COUNTY_KEY = 'GeoName';
    var INDUSTRIES = {
        "EHS": "Education & Health Services",
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

    var metroData;

    $(function(){
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
                    type: 'bar'
                },
                title: {
                    text: CHART_TITLE
                },
                xAxis: {
                    categories: _.pluck(_.uniq(metroData, 'Metro'), 'Metro'),
                    labels: {
                        formatter: formatter
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Share of Total Jobs in Metro Area'
                    },
                    labels: {
                        format: '{value}%'
                    },
                    reversedStacks: false
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

        function setupecD() {
            graph('#ec-d-chart', getSeries(metroData));
            var ec8CountySelect = $("#ec-d-county-select").data("kendoComboBox");
        }

        function setupNumbers(d) {
            // We need to calculate the % of jobs by category in each region
            var i, total;
            for(i = 0; i < d.length; i++) {
                total = 0;
                _.each(INDUSTRIES, function(v, k) {
                    total += d[i][k];
                });
                _.each(INDUSTRIES, function(v, k) {
                    d[i][k] = d[i][k] / total * 100;
                });
            }
            return d;
        }

        // Get the data ready to visualize
        function prepData(metro) {
            metroData = setupNumbers(metro);
            console.log("Set up metro data", metroData);
            // Once we have the data, set up the visualizations
            setupecD();
        }

        // Request all the data
        var metroPromise = $.ajax({
            dataType: "json",
            url: "http://vitalsigns-production.elasticbeanstalk.com/ec/1/metro"
        });

        $.when(metroPromise).done(prepData);
    });
})(jQuery);
