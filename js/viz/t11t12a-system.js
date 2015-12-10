var t11modedata;
var t11operatordata;
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

//Operator Variables
var munidata = [];
var bartdata = [];
var actransitdata = [];
var vtadata = [];
var caltraindata = [];
var samtransdata = [];

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

     //REQUEST MODE DATA FROM SERVER
     $.ajax({
        dataType: "json",
        url: "http://vitalsignsvs2.elasticbeanstalk.com/api/t11/mode",
        //"http://vitalsigns-production.elasticbeanstalk.com/t11/mode",
        //data: data,
        async: false,
        success: successModeDatat11t12a
    });

     function successModeDatat11t12a(data) {
        t11modedata = data;
    }

    //REQUEST OPERATOR DATA FROM SERVER
    $.ajax({
        dataType: "json",
        url: "http://vitalsigns-production.elasticbeanstalk.com/t11/operator",
        //data: data,
        async: false,
        success: successOperatorDatat11t12a
    });

    function successOperatorDatat11t12a(data) {
        t11operatordata = data;
    }

//Populate Mode Objects


//Populate Operator Objects
for (var id in t11operatordata) {
  if (t11operatordata[id].SimpleName === "Muni"){
    munidata.push(t11operatordata[id].DailyPax_1991,t11operatordata[id].DailyPax_1995,t11operatordata[id].DailyPax_2000,t11operatordata[id].DailyPax_2005,t11operatordata[id].DailyPax_2010,t11operatordata[id].DailyPax_2012);
}
else if (t11operatordata[id].SimpleName === "BART"){
    bartdata.push(t11operatordata[id].DailyPax_1991,t11operatordata[id].DailyPax_1995,t11operatordata[id].DailyPax_2000,t11operatordata[id].DailyPax_2005,t11operatordata[id].DailyPax_2010,t11operatordata[id].DailyPax_2012);
}
else if (t11operatordata[id].SimpleName === "AC Transit"){
    actransitdata.push(t11operatordata[id].DailyPax_1991,t11operatordata[id].DailyPax_1995,t11operatordata[id].DailyPax_2000,t11operatordata[id].DailyPax_2005,t11operatordata[id].DailyPax_2010,t11operatordata[id].DailyPax_2012);
}
else if (t11operatordata[id].SimpleName === "VTA"){
    vtadata.push(t11operatordata[id].DailyPax_1991,t11operatordata[id].DailyPax_1995,t11operatordata[id].DailyPax_2000,t11operatordata[id].DailyPax_2005,t11operatordata[id].DailyPax_2010,t11operatordata[id].DailyPax_2012);
}
else if (t11operatordata[id].SimpleName === "Caltrain"){
    caltraindata.push(t11operatordata[id].DailyPax_1991,t11operatordata[id].DailyPax_1995,t11operatordata[id].DailyPax_2000,t11operatordata[id].DailyPax_2005,t11operatordata[id].DailyPax_2010,t11operatordata[id].DailyPax_2012);
}
else if (t11operatordata[id].SimpleName === "SamTrans"){
    samtransdata.push(t11operatordata[id].DailyPax_1991,t11operatordata[id].DailyPax_1995,t11operatordata[id].DailyPax_2000,t11operatordata[id].DailyPax_2005,t11operatordata[id].DailyPax_2010,t11operatordata[id].DailyPax_2012);
}
}

lineChartAggregate("http://vitalsigns-production.elasticbeanstalk.com/t11/system", "Year", ["Daily_Boardings"], "SysName_Simple", "Daily Transit Ridership")

//CREATE BUTTONS AND CLICK EVENTS T11-T12-A
$("#totalButtont11t12aSystem").kendoButton({
 enable: true

});
$("#totalButtont11t12aSystem").click(function() {
  $(this).addClass("active")
  $(this).siblings('a').removeClass('active');
  lineChartAggregate("http://vitalsigns-production.elasticbeanstalk.com/t11/system", "Year", ["Daily_Boardings"], "SysName_Simple", "Daily Transit Ridership")
});

$("#percentButtont11t12aSystem").kendoButton({
 enable: true
});
$("#percentButtont11t12aSystem").click(function() {
  $(this).addClass("active")
  $(this).siblings('a').removeClass('active');
  lineChart("http://vitalsigns-production.elasticbeanstalk.com/t11/system", "Year", ["PercentChg_1991"], "SysName_Simple", "Percent Change in Daily Transit Ridership")
});

$("#percapitaButtont11t12aSystem").kendoButton({
 enable: true
});
$("#percapitaButtont11t12aSystem").click(function() {
  $(this).addClass("active")
  $(this).siblings('a').removeClass('active');
  lineChart("http://vitalsigns-production.elasticbeanstalk.com/t12/system", "Year", ["PC_Annual_Boardings"], "SysName_Simple", "Annual Transit Ridership per Capita")
});

$("#percapitaPercentButtont11t12aSystem").kendoButton({
 enable: true
});
$("#percapitaPercentButtont11t12aSystem").click(function() {
  $(this).addClass("active")
  $(this).siblings('a').removeClass('active');
  lineChart("http://vitalsigns-production.elasticbeanstalk.com/t12/system", "Year", ["PercentChg_1991"], "SysName_Simple", "Percent Change in Annual Transit Ridership per Capita")
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
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:,.1f}</b></td></tr>',
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
        chartT11T12AOptions.yAxis.title.text = 'Weekday Boardings'
      }
    chartT11T12AOptions.xAxis.categories = categories
    // chartT11T12AOptions.title.text = "Historical Trend for "+title
    $('#T11-T12-A-system .chart-title').html("Historical Trend for " + title);
    chart = new Highcharts.Chart(chartT11T12AOptions);
  })
}

})(jQuery);
