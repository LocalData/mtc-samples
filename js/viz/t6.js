/*globals
jQuery, L, cartodb, geocities, allGreen, allBlue, altColors, Highcharts, science,
regionPromise, countyPromise: true
*/

(function($) {

    // Set the default highcharts separator
    Highcharts.setOptions({
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        }
    });

    var t6acountylist = [];
    var t6acountydata = [];
    var t6achartdata = [];
    var t6aHaloCountylist = [];
    var regionalData = [];
    var years = [];
    var t6achart;
    var focus_key = 'BD_AADT';

    function chart(series, options) {
        var title = "";
        if (!options) {
            options = {};
        }

        var max = options.max || 140000;

        $('#T6-A-chart').highcharts({
            chart: {
                type: 'line',
                marginTop: 40
            },
            title: {
                text: ''
            },
            xAxis: {
                categories: years,
                tickmarkPlacement: 'on'
            },
            yAxis: {
                min: 0,
                max: max,
                title: {
                    text: 'Average Daily Vehicle Trips'
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:,.0f}</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            colors: altColors,
            plotOptions: {
                line: {
                    enableMouseTracking: true
                }
            },
            series: series
        });

    }

    $.fn.UpdateT6AChartData = function(searchcounty, mode) {
        var series = [];
        var title;
        var routeData, routeDataByRoute;

        if(mode === 'county'){
            title = "Entering/Exiting "+ searchcounty + " from outside Bay Area";

            routeData = _.filter(t6acountydata, {
                Gateway_County: searchcounty
            });
            routeDataByRoute = _.groupBy(routeData, 'Route_Text_ID');
            _.each(routeDataByRoute, function(values, key) {
                var routeText = values[0].Route_Text;

                // Find if this highway intersects the county in more than one place
                var intersections = _.uniq(_.pluck(_.where(routeData, {
                    Route_Text: routeText
                }), 'Halo_County'));
                console.log("Intersections", intersections);

                // If so, add the location of the intersection
                if (intersections.length > 1) {
                    routeText += ' - ' + values[0].Halo_County;
                }

                series.push({
                    name: routeText,
                    data: _.pluck(values, focus_key)
                });
            });
        }

        if (mode === 'halo') {
            title = "Entering/Exiting "+ searchcounty + " from Bay Area";
            routeData = _.filter(t6acountydata, {
                Halo_County: searchcounty
            });
            routeDataByRoute = _.groupBy(routeData, 'Route_Text');
            _.each(routeDataByRoute, function(values, key) {
                series.push({
                    name: key,
                    data: _.pluck(values, focus_key)
                });
            });
        }

        console.log("Got series", series);
        chart(series);

        // Update the title
        $('#T6 .chart-title').html(title);
    };

    $(function() {
    /* GET DATA FROM SERVER ****************************************/
    function successCountyDatat6a(data) {
        t6acountydata = data;
        t6acountylist = _.uniq(_.pluck(data, 'Gateway_County')).sort();
        t6aHaloCountylist = _.uniq(_.pluck(data, 'Halo_County')).sort();
        years = _.uniq(_.pluck(data, 'Year'));

        // Add up all the county data to get the regional totals
        var regionalDataByYear = {};
        _.each(data, function(d) {
            if (!regionalDataByYear[d.Year]) {
                regionalDataByYear[d.Year] = 0;
            }
            regionalDataByYear[d.Year] += d.BD_AADT;
        });
        regionalData = _.values(regionalDataByYear);
        console.log(regionalData);
    }


    //REQUEST COUNTY DATA FROM SERVER
    $.ajax({
        dataType: "json",
        url: "http://vitalsignsvs2.elasticbeanstalk.com/api/t6/county",
        //data: data,
        async: false,
        success: successCountyDatat6a
    });

    $(this).build_initial();

    /* We create the combo boxes ***************************************/
    var counties = [];
    _.each(t6acountylist, function(c) {
        counties.push({
            text: c,
            value: c
        });
    });

    var haloCounties = [];
    _.each(t6aHaloCountylist, function(c) {
        haloCounties.push({
            text: c,
            value: c
        });
    });

    function ont6aSelect(e) {
        $("#t6aHaloCountyCombo").data("kendoComboBox").text('Halo Counties');
        var dataItem = this.dataItem(e.item.index());
        $(this).UpdateT6AChartData(dataItem.text, 'county');
    }
    $("#t6aCountyCombo").kendoComboBox({
        text: "Gateway Counties",
        dataTextField: "text",
        dataValueField: "value",
        dataSource: counties,
        select: ont6aSelect
    });

    function ont6aHaloSelect(e) {
        $("#t6aCountyCombo").data("kendoComboBox").text('Gateway Counties');
        var dataItem = this.dataItem(e.item.index());
        $(this).UpdateT6AChartData(dataItem.text, 'halo');
    }
    $("#t6aHaloCountyCombo").kendoComboBox({
        text: "Halo Counties",
        dataTextField: "text",
        dataValueField: "value",
        dataSource: haloCounties,
        select: ont6aHaloSelect
    });

    var button = $('<a class="btn btn-primary btn-fix k-button">Regional Trend</a>').click(function () {
        $(this).build_initial();
    });

    $('#T6 div:first').prepend(button);

});

$.fn.build_initial = function(){
    var series = [];
    var bayData = _.filter(t6acountydata, {

    });
    series.push({
        "name": "Bay Area",
        "data": regionalData
    });
    chart(series, {
        max: 650000
    });
};
})(jQuery);
