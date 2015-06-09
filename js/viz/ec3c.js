/*globals jQuery, L, geocities, allGray, econColors, altColors, science,
metroPromise: true */

(function($) {
    /*

    C
    Line graph showing the unemployment trends for major metro areas.
    - When hovering over lines, show unemployment rates for all metros in year user is
    hovering over.
    - X-axis should be year, Y-axis should be unemployment rate.
    - User should be able to turn on or off metro areas in graph.
    - No dropdowns or button bars needed. (T11-12-C (without button bar),
    http://dev-mtc-vital-signs.pantheon.io/transit-ridership)
    http://vitalsigns-production.elasticbeanstalk.com/ec/3/metro

    TODO

    MISC

    REQUESTS

    */

    var FOCUSYEAR = 2013;
    var YEARNAMES =      [1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014];
    var METROYEARNAMES = YEARNAMES;
    var CITYBLANKS = [null, null, null, null, null, null, null, null, null, null];

    // Use econ purple as the first color
    altColors[4] = altColors[0];
    altColors[0] = econColors[1];

    var cityData, countyData, regionData, metroData;
    var selectedGeography;

    $(function() {
        // Create graph EC-3, showing unemployment trend for US metro areas
        function setup() {

            // Group the metro data by name
            var dataByMetro = _.groupBy(metroData, 'Residence_Geo');
            var series = [];
            _.each(dataByMetro, function(d, metro) {
                // We can't use the 'metro' key for public display because it
                // includes "MSA" at the end.

                var lineWidth = 1.5;
                if (d[0]['Metro Name'] === 'Bay Area') {
                    lineWidth = 4;
                }

                series.push({
                    name: d[0]['Metro Name'],
                    data: _.pluck(d, 'Unemployment_Rate'),
                    lineWidth: lineWidth
                });
            });
            series = _.sortBy(series, 'name');


            $('#ec3-c-chart').highcharts({
                chart: {
                    type: 'line'
                },
                title: {
                    text: 'Metro Comparison for Unemployment Rate'
                },
                xAxis: {
                    categories: METROYEARNAMES,
                    labels: {
                        step: 2,
                        staggerLines: 1
                    }
                },
                yAxis: {
                    min: 0,
                    title: {
                        text: 'Unemployment Rate'
                    },
                    labels: {
                        format: '{value}%'
                    }
                },
                tooltip: {
                    enabled: true,
                    headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                    pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>',
                    footerFormat: '</table>',
                    shared: true,
                    useHTML: true
                },
                colors: altColors,
                series: series
            });
        }


        // Get all the data needed for the interactives in one go.
        function prepData(metroRaw) {
            metroData = metroRaw;
            setup();
        }

        $.when(metroPromise).done(prepData);
    });
})(jQuery);
