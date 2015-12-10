var t11modedata;
var t11operatordata;
var charttype = "mode";
var operators = ["Muni","BART","AC Transit","VTA","Caltrain","SamTrans"];
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

var colors = _.clone(altColors);
colors[0] = altColors[1];
colors[1] = altColors[0];

var percapitaOrTotal = "total"

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
        url: "http://vitalsigns-production.elasticbeanstalk.com/t11/mode",
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

lineChart("http://vitalsigns-production.elasticbeanstalk.com/t11/region", "Year", ["Daily_Boardings"], "Geography", "Daily Transit Ridership")
//CREATE BUTTONS AND CLICK EVENTS T11-T12-A
$("#totalButtont11t12a").kendoButton({
 enable: true
});
$("#totalButtont11t12a").click(function() {
  lineChart("http://vitalsigns-production.elasticbeanstalk.com/t11/region", "Year", ["Daily_Boardings"], "Geography", "Daily Transit Ridership")
  $(this).addClass("active")
  $(this).siblings('a').removeClass('active');
});

$("#percapitaTotalButtont11t12a").kendoButton({
 enable: true
});
$("#percapitaTotalButtont11t12a").click(function() {
  lineChart("http://vitalsigns-production.elasticbeanstalk.com/t12/region", "Year", ["PC_Annual_Boardings"], "Geography", "Annual Transit Ridership per Capita")
  $(this).addClass("active")
  $(this).siblings('a').removeClass('active');
});

$("#modeButtont11t12a").kendoButton({
  enable: true
})

$("#modeButtont11t12a").click(function() {
 lineChartAggregate("http://vitalsigns-production.elasticbeanstalk.com/t11/mode", "Year", ["Daily_Boardings"], "Mode", "Daily Transit Ridership by Mode")
 $(this).addClass("active")
  $(this).siblings('a').removeClass('active');
});

$("#percapitaModeButtont11t12a").kendoButton({
 enable: true
});
$("#percapitaModeButtont11t12a").click(function() {
 lineChart("http://vitalsigns-production.elasticbeanstalk.com/t12/mode", "Year", ["PC_Annual_Boardings"], "Mode_Simple", "Annual Transit Ridership by Mode per Capita")
 $(this).addClass("active")
  $(this).siblings('a').removeClass('active');
});


});

function lineChartAggregate(dataUrl, seriesName, seriesData, aggregate, title) {
  var yAxisTitle;

  if (title === 'Daily Transit Ridership') {
    yAxisTitle = 'Weekday Boardings';
  }
  if (title === 'Annual Transit Ridership per Capita') {
    yAxisTitle = 'Per-Capita Annual Boardings';
  }
  if (title === 'Daily Transit Ridership by Mode') {
    yAxisTitle = 'Weekday Boardings';
  }
  if (title === 'Annual Transit Ridership by Mode per Capita') {
    yAxisTitle = 'Per-Capita Annual Boardings';
  }

  // Get the CSV and create the chart
  var chartT11T12AOptions = {
    chart: {
      renderTo: 'T11-T12-A-chart',
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
    yAxis: {
      min: 0,
      startOnTick: false,
         // max: 50,
      title: {
        text: yAxisTitle
      }
    },
   tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
      '<td style="padding:0"><b>{point.y:,.1f}</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true
    },
    colors: colors
  }
  jQuery.getJSON(dataUrl, function(data) {
    yaxis = [];
    dataArray = []
    var years = []
    var types = []
    $.each(data, function(key, value) {
      if ($.inArray(value.Year, years) < 0) {
        years.push(value.Year)
      }
      if(seriesData == "PercentChg_1991") {
        if ($.inArray(value[aggregate], types) < 0 && value[aggregate] != "Other") {
          types.push(value[aggregate])
        }
      } else {
        if ($.inArray(value[aggregate], types) < 0) {
          types.push(value[aggregate])
        }
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
    })
    if(seriesData == "Daily_Boardings") {
        chartT11T12AOptions.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.y:,.0f}</b></td></tr>'
      }
    chartT11T12AOptions.xAxis.categories = years
    $('#T11-T12-A .chart-title').html("Historical Trend for " + title);

    chart = new Highcharts.Chart(chartT11T12AOptions);
  })
}

function lineChart(dataUrl, seriesName, seriesData, chartType, title) {
    var yAxisTitle;
    if (title === 'Daily Transit Ridership') {
      yAxisTitle = 'Weekday Boardings';
    }
    if (title === 'Annual Transit Ridership per Capita') {
      yAxisTitle = 'Per-Capita Annual Boardings';
    }
    if (title === 'Daily Transit Ridership by Mode') {
      yAxisTitle = 'Weekday Boardings';
    }
    if (title === 'Annual Transit Ridership by Mode per Capita') {
      yAxisTitle = 'Per-Capita Annual Boardings';
    }
    // Get the CSV and create the chart
    var chartT11T12AOptions = {
      chart: {
        renderTo: 'T11-T12-A-chart',
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
      yAxis: {
        title: {
          text: yAxisTitle
        },
        min: 0
      },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y:,.1f}</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      colors: colors
    }
    jQuery.getJSON(dataUrl, function(data) {
    categories = [];
    dataArray = []
    var types = []
    $.each(data, function(key, value) {
      if(seriesData == "PercentChg_1991") {
        if ($.inArray(value[chartType], types) < 0 && value[chartType] != "Other") {
          types.push(value[chartType])
        }
      } else {
        if ($.inArray(value[chartType], types) < 0) {
          types.push(value[chartType])
        }
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
    })
    if(seriesData == "Daily_Boardings") {
        chartT11T12AOptions.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.y:,.0f}</b></td></tr>'
      }
    chartT11T12AOptions.xAxis.categories = categories
    $('#T11-T12-A .chart-title').html("Historical Trend for " + title);
    chart = new Highcharts.Chart(chartT11T12AOptions);
  })
}

})(jQuery);
