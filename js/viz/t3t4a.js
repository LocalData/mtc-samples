//Global Variables
var t3t4countylist;
var t3t4countydata;
var t3t4regiondata;
var t3t4mode;
var regiondata = [];

(function($, Promise) {
  'use strict';
$(function() {
  var urls = [
    // County list data
    'http://vitalsigns-production.elasticbeanstalk.com/counties',
    // County-level data
    'http://vitalsigns-production.elasticbeanstalk.com/t3t4/counties',
    // Regional data
    'http://vitalsigns-production.elasticbeanstalk.com/t3t4/region'
  ];

  Promise.map(urls, function (url) {
    return Promise.resolve($.ajax({
      dataType: 'json',
      url: url
    }));
  }).then(function (datasets) {
    t3t4countylist = datasets[0];
    t3t4countydata = datasets[1];
    t3t4regiondata = datasets[2];


    //SET DEFAULT MODE
    t3t4mode = "OverallTime_Est";

    //SET INITIAL DATA FOR CHART
    for (var regionid in t3t4regiondata) {
        regiondata.push([Date.UTC(t3t4regiondata[regionid].Year, 0, 1), t3t4regiondata[regionid][t3t4mode]]);
    }

    //CREATE CHART T3-T4-A
    $('#T3-T4-A-chart').highcharts({
        chart: {
            type: 'line'
        },
        title: {
            text: 'Historical Trend for Commute Time - Region'
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                second: '%Y-%m-%d<br/>%H:%M:%S',
                minute: '%Y-%m-%d<br/>%H:%M',
                hour: '%Y-%m-%d<br/>%H:%M',
                day: '%Y<br/>%m-%d',
                week: '%Y<br/>%m-%d',
                month: '%Y-%m',
                year: '%Y'
            },
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
            max: 60
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
            series: {
                lineWidth: 5
            },
            line: {
                enableMouseTracking: true
            }
        },
        series: [{
            name: 'Region',
            data: regiondata,
            point: {

                events: {
                    mouseOver: function() {
                        var mode = t3t4mode;
                        update_areaChartInfoDiv(mode, this.category, this.y);
                    },
                    click: function() {
                        var mode = t3t4mode;
                        update_areaChartInfoDiv(mode, this.category, this.y);
                    }
                }
            }
        }]
    });
    t3t4countylist[t3t4countylist.length +1] = {County: "Bay Area"};
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

    //CREATE BUTTONS AND CLICK EVENTS T3-T4-A

    $("#overallButtont3t4a").kendoButton({
        enable: true

    });
    $("#overallButtont3t4a").click(function() {
      t3t4mode = "OverallTime_Est";
      updateChartst3t4a(t3t4mode);
      $(this).addClass("active")
      $(this).siblings('a').removeClass('active');
    });

    $("#datimeButtont3t4a").kendoButton({
        enable: true
    });
    $("#datimeButtont3t4a").click(function() {
      t3t4mode = "DATime_Est";
      updateChartst3t4a(t3t4mode);
      $(this).addClass("active")
      $(this).siblings('a').removeClass('active');
    });
    $("#cptimeButtont3t4a").kendoButton({
        enable: true
    });
    $("#cptimeButtont3t4a").click(function() {
      t3t4mode = "CPTime_Est";
      updateChartst3t4a(t3t4mode);
      $(this).addClass("active")
      $(this).siblings('a').removeClass('active');
    });

    $("#pttimeButtont3t4a").kendoButton({
        enable: true
    });
    $("#pttimeButtont3t4a").click(function() {
      t3t4mode = "PTTime_Est";
      updateChartst3t4a(t3t4mode);
      $(this).addClass("active")
      $(this).siblings('a').removeClass('active');
    });


  });

});

//UPDATEFUNCTION FOR T3-T4-A Chart based on city selection
$.fn.UpdateT3T4ChartData = function(searchcounty) {
    var countydata = [];
    regiondata = [];
    var county = searchcounty;

    for (var key in t3t4countydata) {
        if (county === t3t4countydata[key].County) {
            countydata.push([Date.UTC(t3t4countydata[key].Year, 0, 1), t3t4countydata[key].OverallTime_Est]);
        }

    }
    for (var count in t3t4regiondata) {
        regiondata.push([Date.UTC(t3t4regiondata[count].Year, 0, 1), t3t4regiondata[count].OverallTime_Est]);
    }

    if(county != "Bay Area") {
        county += " County"
    }

    $('#T3-T4-A-chart').highcharts({
        chart: {
            type: 'line'
        },
        title: {
            text: 'Historical Trend for Commute Time - ' + county
        },
        legend: {
            enabled: true
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                second: '%Y-%m-%d<br/>%H:%M:%S',
                minute: '%Y-%m-%d<br/>%H:%M',
                hour: '%Y-%m-%d<br/>%H:%M',
                day: '%Y<br/>%m-%d',
                week: '%Y<br/>%m-%d',
                month: '%Y-%m',
                year: '%Y'
            },
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
            max: 60
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
            series: {
                lineWidth: 5
            },
            line: {
                enableMouseTracking: true
            }
        },
        series: [{
            name: 'Region',
            data: regiondata,
            point: {

                events: {
                    mouseOver: function() {
                        var mode = t3t4mode;
                        update_areaChartInfoDiv(mode, this.category, this.y);
                    },
                    click: function() {
                        var mode = t3t4mode;
                        update_areaChartInfoDiv(mode, this.category, this.y);
                    }
                }
            }
        }, {
            name: 'County',
            data: countydata,
            point: {

                events: {
                    mouseOver: function() {
                        var mode = t3t4mode;
                        update_areaChartInfoDiv(mode, this.category, this.y);
                    },
                    click: function() {
                        var mode = t3t4mode;
                        update_areaChartInfoDiv(mode, this.category, this.y);
                    }
                }
            }
        }]
    });
};





//UPDATE CHART BASED ON MODE
function updateChartst3t4a(modet3t4) {

    regiondata = [];
    var countydata = [];
    var county = $('#t3t4CountyCombo').data('kendoComboBox').value();
    var mode = modet3t4;

    for (var key in t3t4countydata) {
        if (county === t3t4countydata[key].County) {
            countydata.push([Date.UTC(t3t4countydata[key].Year, 0, 1), t3t4countydata[key][mode]]);

        }

    }
    for (var count in t3t4regiondata) {
        regiondata.push([Date.UTC(t3t4regiondata[count].Year, 0, 1), t3t4regiondata[count][mode]]);
    }


    $('#T3-T4-A-chart').highcharts({
        chart: {
            type: 'line'
        },
        title: {
            text: 'Historical Trend for Commute Time - Region'
        },
        legend: {
            enabled: true
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                second: '%Y-%m-%d<br/>%H:%M:%S',
                minute: '%Y-%m-%d<br/>%H:%M',
                hour: '%Y-%m-%d<br/>%H:%M',
                day: '%Y<br/>%m-%d',
                week: '%Y<br/>%m-%d',
                month: '%Y-%m',
                year: '%Y'
            },
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
            max: 60
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
            series: {
                lineWidth: 5
            },
            line: {
                enableMouseTracking: true
            }
        },
        series: [{
            name: 'Region',
            data: regiondata,
            point: {

                events: {
                    mouseOver: function() {
                        var mode = t3t4mode;
                        update_areaChartInfoDiv(mode, this.category, this.y);
                    },
                    click: function() {
                        var mode = t3t4mode;
                        update_areaChartInfoDiv(mode, this.category, this.y);
                    }
                }
            }
        }, {
            name: 'County',
            data: countydata,
            point: {

                events: {
                    mouseOver: function() {
                        var mode = t3t4mode;
                        update_areaChartInfoDiv(mode, this.category, this.y);
                    },
                    click: function() {
                        var mode = t3t4mode;
                        update_areaChartInfoDiv(mode, this.category, this.y);
                    }
                }
            }

        }]
    });



}

//UPDATE SIMPLE INFO PANEL BASED ON MOUSEOVER ON CHART
function update_areaChartInfoDiv(mode, category, value) {
    var infoRegion;
    var infoCounty;

    for (var regionid in t3t4regiondata) {
        if (category === t3t4regiondata[regionid].Year.toString()) {
            infoRegion = (t3t4regiondata[regionid][mode]).toFixed(1);
        }
    }
    var updatetext = $('#t3t4CountyCombo').data('kendoComboBox').value();


    for (var cntyid in t3t4countydata) {
        if (t3t4countydata[cntyid].County === updatetext && t3t4countydata[cntyid].Year.toString() === category) {
            var infoMode = mode;
            if (t3t4countydata[cntyid][infoMode] === null) {
                infoCounty = "N/A";
            } else {
                infoCounty = (t3t4countydata[cntyid][infoMode]).toFixed(1);
            }
            //console.log(infoCounty + ": Success");

        }
    }
    $("#T3-T4-A-simpleinfo").html("<table align='center'><tr><td class='tablecell'><i class='fa fa-car fa-2x' style='color: blue; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + infoCounty + "</b>&nbsp;</td><td class='tablecell'><i class='fa fa-cab fa-2x' style='color: orange; text-shadow: 1px 1px 1px #000'></i>&nbsp;<b>" + infoRegion + "</b>&nbsp;</td></tr><tr><td><b>County</b></td><td><b>Region</b></td></tr></table>");

}
})(window.jQuery, window.Promise);
