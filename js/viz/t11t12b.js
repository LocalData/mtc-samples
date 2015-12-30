(function($) {
  $(function() {
    // Set the default highcharts separator
    Highcharts.setOptions({
        lang: {
            decimalPoint: '.',
            thousandsSep: ','
        }
    });

    var colors = _.clone(altColors);
    colors[0] = altColors[1];
    colors[1] = altColors[0];

    //CREATE BUTTONS AND CLICK EVENTS T11-T12-A
    $("#totalButtont11t12b").kendoButton({
        enable: true
    });
    $("#totalButtont11t12b").click(function() {
      $(this).addClass("active");
      $(this).siblings('a').removeClass('active');
      lineChartAggregate("http://vitalsignsvs2.elasticbeanstalk.com/api/t11/metro", "Year", "Est_Weekday_Boardings", "Metro", "Metro Comparison for Daily Transit Ridership" );
    });

    $("#percentTotalButtont11t12b").kendoButton({
        enable: true
    });
    $("#percentTotalButtont11t12b").click(function() {
      $(this).addClass("active")
      $(this).siblings('a').removeClass('active');
      lineChart("http://vitalsignsvs2.elasticbeanstalk.com/api/t11/metro", "Year", "PercentChg_1991", "Metro", "Metro Comparison for Percent Change in Daily Transit Ridership" )
    });
    $("#percapitaButtont11t12b").kendoButton({
        enable: true
    });
    $("#percapitaButtont11t12b").click(function() {
      $(this).addClass("active")
      $(this).siblings('a').removeClass('active');
      lineChart("http://vitalsignsvs2.elasticbeanstalk.com/api/t12/metro", "Year", "PC_Annual_Boardings", "Metro", "Metro Comparison for Annual Transit Ridership per Capita" )
    });
    $("#percentPercapitaButtont11t12b").kendoButton({
        enable: true
    });
    $("#percentPercapitaButtont11t12b").click(function() {
    $(this).addClass("active")
      $(this).siblings('a').removeClass('active');
    lineChart("http://vitalsignsvs2.elasticbeanstalk.com/api/t12/metro", "Year", "PercentChg_1991", "Metro", "Metro Comparison for Percent Change in Annual Transit Ridership per Capita")
    });
    lineChartAggregate("http://vitalsignsvs2.elasticbeanstalk.com/api/t11/metro", "Year", "Est_Weekday_Boardings", "Metro", "Metro Comparison for Daily Transit Ridership" )

  })

  function lineChartAggregate(dataUrl, seriesName, seriesData, aggregate, title) {
    // Get the CSV and create the chart
    var options = {
      chart: {
        renderTo: 'T11-T12-B-chart',
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
          max: 15000000,
          title: {
            text: 'Weekday Boardings'
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
        if ($.inArray(value[aggregate], types) < 0) {
          types.push(value[aggregate])
        }
      })
      $.each(types, function(typeKey, typeName) {
        dataArray = []
        labelArray = []
        options.series[typeKey] = [{}]
        options.series[typeKey].data = []
        options.series[typeKey].name = []
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
          });
        dataArray[typeName].push(dataVal);
        });
        options.series[typeKey].name = typeName;
        options.series[typeKey].data = dataArray[typeName];
      })
      if(seriesData != "PercentChg_1991") {
        options.yAxis.min = 0
      } else if (seriesData == "PercentChg_1991") {
        options.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>'
        options.yAxis.title.text = "Percent Change"
      }
      if(seriesData == "Daily_Boardings") {
        options.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.y:,.0f}</b></td></tr>'
        options.yAxis.title.text = 'Weekday Boardings'
      }
      options.xAxis.categories = years
      // options.title.text = title
      $('#T11-T12-B .chart-title').html(title);
      chart = new Highcharts.Chart(options);
    })
  }

function lineChart(dataUrl, seriesName, seriesData, chartType, title) {
    // Get the CSV and create the chart
    var options = {
      chart: {
        renderTo: 'T11-T12-B-chart',
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
          text: 'Per-Capita Annual Boardings'
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
    categories = [];
    dataArray = []
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
      options.series[key] = [{}]
      options.series[key].data = []
      options.series[key].name = []
      jQuery.each(data, function(i,value) {
        if(value[chartType] == type) {
          if(seriesData == "PercentChg_1991") {
            dataArray[type].push(value[seriesData]*100);
          } else {
            dataArray[type].push(value[seriesData]);
          }
        }
      });
    options.series[key].data = dataArray[type];
    options.series[key].name = type;
    })
    if(seriesData != "PercentChg_1991") {
        options.yAxis.min = 0
      } else if (seriesData == "PercentChg_1991") {
        options.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.y:,.1f}%</b></td></tr>'
        options.yAxis.title.text = "Percent Change"
      }
    if(seriesData == "Daily_Boardings") {
        options.tooltip.pointFormat = '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.y:,.0f}</b></td></tr>'
        options.yAxis.title.text = 'Per-Capita Annual Boardings'
      }
    options.xAxis.categories = categories
    $('#T11-T12-B .chart-title').html(title);
    chart = new Highcharts.Chart(options);
  })
}
})(jQuery);
