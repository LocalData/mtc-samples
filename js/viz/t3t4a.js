//Global Variables
var t3t4countylist;
var t3t4countydata;
var t3t4regiondata;
var t3t4mode;
var regiondata = [];

(function($, Promise) {
  'use strict';
  var $chartTitle;

  function pullYearAvgTime(item) {
    return [item.Year, item.Avg_Commute_Time];
  }

  function pullYearTime(item) {
    return [item.Year, item.Time];
  }
  var colors = _.take(altColors, 4);
  colors.push(colors.shift());

$(function() {

    // Set the default highcharts separator
    Highcharts.setOptions({
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        }
    });

  var urls = [
    // County-level data
    'http://vitalsignsvs2.elasticbeanstalk.com/api/t3/county',
    // Regional data
    'http://vitalsignsvs2.elasticbeanstalk.com/api/t3/region'
  ];

  Promise.map(urls, function (url) {
    return Promise.resolve($.ajax({
      dataType: 'json',
      url: url
    }));
  }).then(function (datasets) {
    t3t4countydata = datasets[0];
    t3t4regiondata = datasets[1];

    t3t4countylist = _.unique(_.map(t3t4countydata, function (item) {
      return { County: item.County };
    }), 'County');

    t3t4countylist.unshift({County: "Bay Area"});

    //SET INITIAL DATA FOR CHART
    var overall = _(t3t4regiondata)
    .filter('Mode', 'Overall')
    .map(pullYearAvgTime).value();

    var drive = _(t3t4regiondata)
    .filter('Mode', 'Drive Alone')
    .map(pullYearAvgTime).value();

    var carpool = _(t3t4regiondata)
    .filter('Mode', 'Carpool')
    .map(pullYearAvgTime).value();

    var transit = _(t3t4regiondata)
    .filter('Mode', 'Public Transit')
    .map(pullYearAvgTime).value();

    //CREATE CHART T3-T4-A
    $chartTitle = $('<h3 class="chart-title">Historical Trend for Commute Time - Region</h3>').prependTo($('#T3-T4-A'));
    $('#T3-T4-A-chart').highcharts({
        chart: {
            type: 'line'
        },
        title: {
            text: '&nbsp;',
            useHTML: true
        },
        xAxis: {
            type: 'linear',
            tickInterval: 10,
            tickmarkPlacement: 'on',
            title: {
                enabled: false
            }
        },
        yAxis: {
            title: {
                text: 'Minutes'
            },
            min: 0,
            max: 80
        },
        legend:{
            enabled: true
        },
        tooltip: {
              headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
              pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
              '<td style="padding:0"><b>{point.y:,.1f} minutes</b></td></tr>',
              footerFormat: '</table>',
              shared: true,
              useHTML: true
        },
        plotOptions: {
            line: {
                enableMouseTracking: true,
                connectNulls: true
            }
        },
        colors: colors,
        series: [{
            name: 'Overall',
            data: overall
        }, {
            name: 'Drive Alone',
            data: drive
        }, {
            name: 'Carpool',
            data: carpool
        }, {
            name: 'Transit',
            data: transit
        }]
    });

    //CREATE COMBOX T3-T4-A
    var datat3t4a = [];
    for (var cntykey in t3t4countylist) {
        datat3t4a.push({
            "text": t3t4countylist[cntykey].County,
            "value": t3t4countylist[cntykey].County
        });

    }

    $("#t3t4CountyCombo").kendoComboBox({
        text: "Select a County",
        dataTextField: "text",
        dataValueField: "value",
        dataSource: datat3t4a,
        select: ont3t4Select
    });

    //ON SELECT FUNCTION FOR COMBOBOX T3-T4-A
    function ont3t4Select(e) {
        //console.log(e);
        var dataItem = this.dataItem(e.item.index());
        // console.log(dataItem);
        $(this).UpdateT3T4ChartData(dataItem.text);
        cityinfo = dataItem.text;
    }

  });

});

//UPDATEFUNCTION FOR T3-T4-A Chart based on city selection
$.fn.UpdateT3T4ChartData = function(searchcounty) {
    if (searchcounty === 'Bay Area') {
        var overall = _(t3t4regiondata)
        .filter('Mode', 'Overall')
        .map(pullYearAvgTime).value();

        var drive = _(t3t4regiondata)
        .filter('Mode', 'Drive Alone')
        .map(pullYearAvgTime).value();

        var carpool = _(t3t4regiondata)
        .filter('Mode', 'Carpool')
        .map(pullYearAvgTime).value();

        var transit = _(t3t4regiondata)
        .filter('Mode', 'Public Transit')
        .map(pullYearAvgTime).value();
    } else {
        var overall = _(t3t4countydata)
        .filter('County', searchcounty)
        .filter('Mode', 'Overall')
        .map(pullYearTime).value();

        var drive = _(t3t4countydata)
        .filter('County', searchcounty)
        .filter('Mode', 'Drive Alone')
        .map(pullYearTime).value();

        var carpool = _(t3t4countydata)
        .filter('County', searchcounty)
        .filter('Mode', 'Carpool')
        .map(pullYearTime).value();

        var transit = _(t3t4countydata)
        .filter('County', searchcounty)
        .filter('Mode', 'Public Transit')
        .map(pullYearTime).value();
    }

    $chartTitle.html('Historical Trend for Commute Time - ' + searchcounty);
    $('#T3-T4-A-chart').highcharts({
        chart: {
            type: 'line'
        },
        title: {
            text: '&nbsp;',
            useHTML: true
        },
        legend: {
            enabled: true
        },
        xAxis: {
            type: 'linear',
            tickInterval: 10,
            tickmarkPlacement: 'on',
            title: {
                enabled: false
            }
        },
        yAxis: {
            title: {
                text: 'Minutes'
            },
            min: 0,
            max: 80
        },
        tooltip: {
              headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
              pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
              '<td style="padding:0"><b>{point.y:,.1f} minutes</b></td></tr>',
              footerFormat: '</table>',
              shared: true,
              useHTML: true
        },
        plotOptions: {
            line: {
                enableMouseTracking: true,
                connectNulls: true
            }
        },
        colors: colors,
        series: [{
            name: 'Overall',
            data: overall
        }, {
            name: 'Drive Alone',
            data: drive
        }, {
            name: 'Carpool',
            data: carpool
        }, {
            name: 'Transit',
            data: transit
        }]
    });
};
})(window.jQuery, window.Promise);
