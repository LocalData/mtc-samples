var charttype = "system";
var operators = ["Muni","BART","AC Transit","VTA","Caltrain","SamTrans","Golden Gate Transit"];
//Mode Variables
var dataset1 = [];
var dataset2 = [];
var dataset3 = [];
var dataset4 = [];
var dataset5 = [];
var dataset6 = [];

var lineData = [];

var percapitaOrTotal = "total";


var modes = ["Bus","Commuter Rail","Ferry","Heavy Rail", "Light Rail"];
(function($) {
$(function() {
    // Set the default highcharts separator
    Highcharts.setOptions({
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        }
    });

lineChartAggregate("http://vitalsignsvs2.elasticbeanstalk.com/api/t11/operator", "Year", "Est_Weekday_Boardings", "System", "Daily Transit Ridership")

//CREATE BUTTONS AND CLICK EVENTS T11-T12-A
$("#totalButtont11t12aSystem").kendoButton({
 enable: true

});
$("#totalButtont11t12aSystem").click(function() {
  $(this).addClass("active")
  $(this).siblings('a').removeClass('active');
  lineChartAggregate("http://vitalsignsvs2.elasticbeanstalk.com/api/t11/operator", "Year", "Est_Weekday_Boardings", "System", "Daily Transit Ridership")
});

$("#percentButtont11t12aSystem").kendoButton({
 enable: true
});
$("#percentButtont11t12aSystem").click(function() {
  $(this).addClass("active")
  $(this).siblings('a').removeClass('active');
  lineChart("http://vitalsignsvs2.elasticbeanstalk.com/api/t11/operator", "Year", "PercentChg_1991", "System", "Percent Change in Daily Transit Ridership")
});

$("#percapitaButtont11t12aSystem").kendoButton({
 enable: true
});
$("#percapitaButtont11t12aSystem").click(function() {
  $(this).addClass("active")
  $(this).siblings('a').removeClass('active');
  lineChart("http://vitalsignsvs2.elasticbeanstalk.com/api/t12/operator", "Year", "PC_Annual_Boardings", "System", "Annual Transit Ridership per Capita")
});

$("#percapitaPercentButtont11t12aSystem").kendoButton({
 enable: true
});
$("#percapitaPercentButtont11t12aSystem").click(function() {
  $(this).addClass("active")
  $(this).siblings('a').removeClass('active');
  lineChart("http://vitalsignsvs2.elasticbeanstalk.com/api/t12/operator", "Year", "PercentChg_1991", "System", "Percent Change in Annual Transit Ridership per Capita")
});


});

function lineChartAggregate(dataUrl, seriesName, seriesData, aggregate, title ) {
    // Get the CSV and create the chart
    var chartT11T12AOptions = {
      chart: {
        renderTo: 'T11-T12-A-system-chart',
        defaultSeriesType: 'line',
        marginTop: 40
      },
      series: [{
          name: 'val1',
          data: []
     }],
     xAxis: {
          categories: []
      },
      title: {
          text: ''
      },
      exporting: {
          chartOptions: {
              title: {
                  text: ''
              }
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
        yAxis: {
          min: 0,
          startOnTick: false,
          title: {
            text: 'Weekday Boardings'
          }
        },
        colors: altColors
      }
    jQuery.getJSON(dataUrl, function(data) {
      yaxis = [];
      dataArray = []
      var years = []
      var systems = ["Muni","BART","AC Transit","VTA","Caltrain","SamTrans","Golden Gate Transit"]
      var types = []
      $.each(data, function(key, value) {
        if ($.inArray(value.Year, years) < 0) {
          years.push(value.Year)
        }
        if ($.inArray(value[aggregate], types) < 0) {
          types.push(value[aggregate])
        }
      })
      $.each(types, function(typeKey, typeName) {
        dataArray = []
        labelArray = []
        chartT11T12AOptions.series[typeKey] = [{}]
        chartT11T12AOptions.series[typeKey].data = []
        chartT11T12AOptions.series[typeKey].name = []
        dataArray[typeName] = []
        $.each(years, function(i, year){
          dataVal = 0
          $.each(data, function(key, value) {
            if (value[aggregate] === typeName && value.Year == year) {
              if(seriesData == "PercentChg_1991") {
                dataVal += value[seriesData] * 100
              } else {
                dataVal += value[seriesData]
              }
            }
          })
        dataArray[typeName].push(dataVal);
        })
        chartT11T12AOptions.series[typeKey].name = typeName;
        chartT11T12AOptions.series[typeKey].data = dataArray[typeName];
        if(jQuery.inArray( typeName, systems ) == -1) {
            chartT11T12AOptions.series[typeKey].visible = false;
        }
      })
      if(seriesData != "PercentChg_1991") {
        chartT11T12AOptions.yAxis.min = 0
      } else if (seriesData == "PercentChg_1991") {
        chartT11T12AOptions.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>'
        chartT11T12AOptions.yAxis.title.text = "Percent Change"
      }
      if(seriesData == "Daily_Boardings") {
        chartT11T12AOptions.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.y:,.0f}</b></td></tr>'
        chartT11T12AOptions.yAxis.title.text = "Weekday Boardings"
      }
      chartT11T12AOptions.xAxis.categories = years
      // chartT11T12AOptions.title.text = "Historical Trend for "+title
      $('#T11-T12-A-system .chart-title').html("Historical Trend for " + title);
      chartT11T12AOptions.exporting.chartOptions.title.text = "Historical Trend for " + title;

      chart = new Highcharts.Chart(chartT11T12AOptions);
    })
  }

function lineChart(dataUrl, seriesName, seriesData, chartType, title) {
    // Get the CSV and create the chart
    var chartT11T12AOptions = {
      chart: {
        renderTo: 'T11-T12-A-system-chart',
        defaultSeriesType: 'line',
        marginTop: 40
      },

      series: [{
          name: 'val1',
          data: []
       }],
       xAxis: {
            categories: []
        },
        yAxis: {
          title: {
            text: 'Per-Capita Annual Boardings'
          }
        },
        title: {
            text: ''
        },
        exporting: {
            chartOptions: {
                title: {
                    text: ''
                }
            }
        },
        colors: altColors,
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:,.1f}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
        }
      }
    jQuery.getJSON(dataUrl, function(data) {
    categories = [];
    dataArray = []
    var systems = ["Muni","BART","AC Transit","VTA","Caltrain","SamTrans","Golden Gate Transit"]
    var types = []
    $.each(data, function(key, value) {
      if ($.inArray(value[chartType], types) < 0) {
        types.push(value[chartType])
      }
      if ($.inArray(value.Year, categories) < 0) {
        categories.push(value.Year)
      }
    })
    jQuery.each(types, function(key, type) {
      dataArray[type] = []
      chartT11T12AOptions.series[key] = [{}]
      chartT11T12AOptions.series[key].data = []
      chartT11T12AOptions.series[key].name = []
      jQuery.each(data, function(i,value) {
        if(value[chartType] == type) {
          if(seriesData == "PercentChg_1991") {
            dataArray[type].push(value[seriesData]*100);
          } else {
            dataArray[type].push(value[seriesData]);
          }
        }
      });
    chartT11T12AOptions.series[key].data = dataArray[type];
    chartT11T12AOptions.series[key].name = type;
    if(jQuery.inArray( type, systems ) == -1) {
            chartT11T12AOptions.series[key].visible = false;
        }
    })
    if(seriesData != "PercentChg_1991") {
        chartT11T12AOptions.yAxis.min = 0
      } else if (seriesData == "PercentChg_1991") {
        chartT11T12AOptions.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>'
        chartT11T12AOptions.yAxis.title.text = "Percent Change"
      }
      if(seriesData == "Daily_Boardings") {
        chartT11T12AOptions.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.y:,.0f}</b></td></tr>'
        chartT11T12AOptions.yAxis.title.text = 'Per-Capita Annual Boardings'
      }
    chartT11T12AOptions.xAxis.categories = categories
    // chartT11T12AOptions.title.text = "Historical Trend for "+title
    $('#T11-T12-A-system .chart-title').html("Historical Trend for " + title);
    chartT11T12AOptions.exporting.chartOptions.title.text = "Historical Trend for " + title;

    chart = new Highcharts.Chart(chartT11T12AOptions);
  })
}

})(jQuery);
